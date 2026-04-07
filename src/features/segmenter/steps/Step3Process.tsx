import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchFile } from '@ffmpeg/util'
import type { SegmentDraft } from '../segmenter.types'
import { loadFFmpeg } from '../ffmpeg'
import { saveSegments } from '../segmenter.api'
import styles from './Step3Process.module.css'
import { FFmpeg } from '@ffmpeg/ffmpeg'

type Status = 'pending' | 'processing' | 'done' | 'error'

interface SegResult {
  segId: string
  status: Status
  videoId?: number
  error?: string
}

function todayStr(): string {
  const d = new Date()
  const y = String(d.getFullYear()).slice(2)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function sanitize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9_-]+/g, '_')
}

function ffmpegTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = (s % 60).toFixed(3)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.padStart(6, '0')}`
}

function outputFilename(dateStr: string, idx: number, name: string): string {
  return `${dateStr}-${String(idx + 1).padStart(2, '0')}_${sanitize(name)}.mp4`
}

interface Props {
  segments: SegmentDraft[]
  sourceFile: File
  onBack: () => void
}

export function Step3Process({ segments, sourceFile, onBack }: Props) {
  const navigate = useNavigate()
  const [dateStr, setDateStr] = useState(todayStr)
  const [results, setResults] = useState<SegResult[]>([])
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState('')
    const ffmpegRef = useRef(new FFmpeg());

  const done = results.length > 0 && !running

  async function process() {
    let dirHandle: FileSystemDirectoryHandle
    try {
      dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
    } catch {
      return // user cancelled
    }

    setRunning(true)
    const local: SegResult[] = segments.map((s) => ({ segId: s.id, status: 'pending' as Status }))
    setResults([...local])

    setLog('Loading ffmpeg…')
    try {
      ffmpegRef.current.on('log', ({ message }) => {
             setLog(message);
            console.log(message);
        });
      await loadFFmpeg(ffmpegRef.current)
    } catch (err) {
      setLog(`Failed to load ffmpeg: ${err}`)
      setRunning(false)
      return
    }

    const logHandler = ({ message }: { message: string }) => setLog(message)

    setLog('Writing source file to ffmpeg…')
    await ffmpegRef.current.writeFile('input.mp4', await fetchFile(sourceFile))

    const fileHandles: (FileSystemFileHandle | null)[] = Array(segments.length).fill(null)

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      local[i] = { ...local[i], status: 'processing' }
      setResults([...local])

      const outName = outputFilename(dateStr, i, seg.name)

      try {
        await ffmpegRef.current.exec([
          '-i', 'input.mp4',
          '-ss', ffmpegTime(seg.startTime),
          '-to', ffmpegTime(seg.endTime),
          '-c', 'copy',
          'out.mp4',
        ])

        const data = await ffmpegRef.current.readFile('out.mp4') as Uint8Array
        await ffmpegRef.current.deleteFile('out.mp4')

        const blob = new Blob([data.buffer as ArrayBuffer], { type: 'video/mp4' })
        const fh = await dirHandle.getFileHandle(outName, { create: true })
        const writable = await fh.createWritable()
        await writable.write(blob)
        await writable.close()

        fileHandles[i] = fh
        local[i] = { ...local[i], status: 'done' }
        setResults([...local])
      } catch (err) {
        local[i] = { ...local[i], status: 'error', error: String(err) }
        setResults([...local])
      }
    }

    ffmpegRef.current.off('log', logHandler)
    try { await ffmpegRef.current.deleteFile('input.mp4') } catch { /* ignore */ }

    // Save successful segments to DB
    const successes = segments
      .map((seg, i) => ({ seg, handle: fileHandles[i] }))
      .filter((x): x is { seg: SegmentDraft; handle: FileSystemFileHandle } => x.handle !== null)

    if (successes.length > 0) {
      const sessionDate = parseDateStr(dateStr)
      const videoIds = await saveSegments(
        successes.map((x) => x.seg),
        successes.map((x) => x.handle),
        sessionDate
      )

      setResults((prev) => {
        const next = [...prev]
        successes.forEach(({ seg }, idx) => {
          const ri = next.findIndex((r) => r.segId === seg.id)
          if (ri >= 0) next[ri] = { ...next[ri], videoId: videoIds[idx] }
        })
        return next
      })
    }

    setLog('')
    setRunning(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.options}>
        <label className={styles.label}>
          Date prefix (YYMMDD)
          <input
            className={styles.dateInput}
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            disabled={running}
          />
        </label>
      </div>

      <div className={styles.segmentList}>
        {segments.map((seg, i) => {
          const result = results.find((r) => r.segId === seg.id)
          const filename = outputFilename(dateStr, i, seg.name)
          return (
            <div key={seg.id} className={styles.segRow}>
              <span className={styles.segIdx}>{i + 1}</span>
              <div className={styles.segInfo}>
                <span className={styles.segName}>{seg.name}</span>
                <span className={styles.segFilename}>{filename}</span>
              </div>
              {result && (
                <span className={`${styles.status} ${styles[result.status]}`}>
                  {result.status === 'pending' && '–'}
                  {result.status === 'processing' && 'Processing…'}
                  {result.status === 'done' && '✓ Saved'}
                  {result.status === 'error' && `Error`}
                </span>
              )}
              {result?.status === 'done' && result.videoId != null && (
                <button
                  className={styles.viewBtn}
                  onClick={() => navigate(`/movements/${seg.movementId}/videos/${result.videoId}`)}
                >
                  View
                </button>
              )}
            </div>
          )
        })}
      </div>

      {log && <p className={styles.log}>{log}</p>}

      <div className={styles.footer}>
        {!running && !done && (
          <>
            <button className={styles.backBtn} onClick={onBack}>← Back</button>
            <button className={styles.processBtn} onClick={process}>
              Process & Save
            </button>
          </>
        )}
        {done && (
          <button className={styles.doneBtn} onClick={() => navigate('/')}>
            Done
          </button>
        )}
      </div>
    </div>
  )
}

function parseDateStr(s: string): number {
  const year = 2000 + Number(s.slice(0, 2))
  const month = Number(s.slice(2, 4)) - 1
  const day = Number(s.slice(4, 6))
  return new Date(year, month, day).getTime()
}
