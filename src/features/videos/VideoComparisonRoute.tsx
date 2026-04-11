import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from '../../hooks/useLiveQuery'
import { videosApi } from './videos.api'
import { VideoComparison } from './VideoComparison'

export function VideoComparisonRoute() {
  const { movementId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mid = Number(movementId)

  const { data: videos = [] } = useLiveQuery(
    () => videosApi.getByMovement(mid),
    [mid]
  )

  const leftParam = searchParams.get('left')
  const initialLeftId = leftParam != null ? Number(leftParam) : undefined

  return (
    <VideoComparison
      videos={videos}
      initialLeftId={initialLeftId}
      onBack={() => navigate(`/movements/${movementId}`)}
    />
  )
}
