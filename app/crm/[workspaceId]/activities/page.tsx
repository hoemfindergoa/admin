import { getCrmData } from '../actions'
import { ActivitiesPage } from './activities-page'
export default async function ActivitiesRoute({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params
  const data = await getCrmData(workspaceId)
  return <ActivitiesPage workspaceId={workspaceId} activities={data.activities} />
}
