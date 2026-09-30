import { getCrmData } from '../actions'
import { AccountsPage } from './accounts-page'
export default async function AccountsRoute({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params
  const data = await getCrmData(workspaceId)
  return <AccountsPage workspaceId={workspaceId} accounts={data.accounts} />
}
