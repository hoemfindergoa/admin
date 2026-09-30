import { getCrmData } from '../actions'
import { DealsPage } from './deals-page'
export default async function DealsRoute({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params
  const data = await getCrmData(workspaceId)
  return <DealsPage workspaceId={workspaceId} deals={data.deals} accounts={data.accounts} contacts={data.contacts} leads={data.leads} />
}
