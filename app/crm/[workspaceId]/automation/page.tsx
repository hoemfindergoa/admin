import { getCrmData } from '../actions'
import { AutomationPage } from './automation-page'
export default async function AutomationRoute({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params
  const data = await getCrmData(workspaceId)
  return <AutomationPage workspaceId={workspaceId} rules={data.rules} />
}
