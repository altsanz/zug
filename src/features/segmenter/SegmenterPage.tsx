import { useState } from 'react'
import type { SegmentDraft } from './segmenter.types'
import { Step1Define } from './steps/Step1Define'
import { Step2Annotate } from './steps/Step2Annotate'
import { Step3Process } from './steps/Step3Process'
import styles from './SegmenterPage.module.css'

type Step = 1 | 2 | 3
const STEP_LABELS = ['1. Define', '2. Annotate', '3. Save']

export function SegmenterPage() {
  const [step, setStep] = useState<Step>(1)
  const [segments, setSegments] = useState<SegmentDraft[]>([])
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  async function pickFile() {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'Video', accept: { 'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'] } }],
      })
      const file = await handle.getFile()
      if (videoUrl) URL.revokeObjectURL(videoUrl)
      setSourceFile(file)
      setVideoUrl(URL.createObjectURL(file))
    } catch {
      // cancelled
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.stepBar}>
        {STEP_LABELS.map((label, i) => (
          <span
            key={i}
            className={`${styles.stepLabel} ${step === i + 1 ? styles.active : ''}`}
          >
            {label}
          </span>
        ))}
      </div>

      {step === 1 && (
        <Step1Define
          segments={segments}
          onSegmentsChange={setSegments}
          videoUrl={videoUrl}
          onPickFile={pickFile}
          onDropFile={(file) => {
            if (videoUrl) URL.revokeObjectURL(videoUrl)
            setSourceFile(file)
            setVideoUrl(URL.createObjectURL(file))
          }}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && videoUrl && (
        <Step2Annotate
          segments={segments}
          onSegmentsChange={setSegments}
          videoUrl={videoUrl}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && sourceFile && (
        <Step3Process
          segments={segments}
          sourceFile={sourceFile}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  )
}
