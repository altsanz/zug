import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

const BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'

// Loads ffmpeg core into the given FFmpeg instance. Safe to call multiple times.
export async function loadFFmpeg(ffmpeg: FFmpeg): Promise<void> {
  if (ffmpeg.loaded) return
  await ffmpeg.load({
    coreURL: await toBlobURL(`${BASE}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${BASE}/ffmpeg-core.wasm`, 'application/wasm'),
    // workerURL is only for @ffmpeg/core-mt (multi-threaded) — omit here
  })
}
