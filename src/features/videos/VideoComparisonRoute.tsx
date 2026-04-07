import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from '../../hooks/useLiveQuery'
import { videosApi } from './videos.api'
import { VideoComparison } from './VideoComparison'

export function VideoComparisonRoute() {
  const { movementId } = useParams()
  const navigate = useNavigate()
  const mid = Number(movementId)

  const { data: videos = [] } = useLiveQuery(
    () => videosApi.getByMovement(mid),
    [mid]
  )

  return (
    <VideoComparison
      videos={videos}
      onBack={() => navigate(`/movements/${movementId}`)}
    />
  )
}
