import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from '../../hooks/useLiveQuery'
import { db } from '../../db/db'
import { videosApi } from './videos.api'
import { VideoAnnotator } from './VideoAnnotator'

export function VideoAnnotatorRoute() {
  const { movementId, videoId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTime = searchParams.get('t') !== null ? Number(searchParams.get('t')) : undefined

  const { data: video } = useLiveQuery(
    () => db.videos.get(Number(videoId)),
    [videoId]
  )

  if (!video) return null

  return (
    <VideoAnnotator
      video={video}
      onBack={() => navigate(`/movements/${movementId}`)}
      onDelete={async () => {
        await videosApi.remove(video.id!)
        navigate(`/movements/${movementId}`)
      }}
      onCompare={() => navigate(`/movements/${movementId}/compare?left=${video.id}`)}
      onDateChange={(ts) => videosApi.updateDate(video.id!, ts)}
      initialTime={initialTime}
    />
  )
}
