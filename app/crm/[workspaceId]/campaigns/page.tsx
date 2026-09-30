import { getCrmData } from '../actions'
import { CampaignsPage } from './campaigns-page'

export default async function CampaignsRoute({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params
  const data = await getCrmData(workspaceId)
  return <CampaignsPage workspaceId={workspaceId} campaigns={data.campaigns} members={data.members} />
}
