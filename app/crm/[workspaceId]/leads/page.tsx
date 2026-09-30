import { getCrmData } from '../actions'
import { LeadsPage } from './leads-page'

export default async function LeadsRoute({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params
  const data = await getCrmData(workspaceId)
  return <LeadsPage workspaceId={workspaceId} leads={data.leads} campaigns={data.campaigns} notes={data.notes} access={data.access} />
}
