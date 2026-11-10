import { getTeamChatData } from './actions'
import { CrmTeamChat } from '@/components/crm-team-chat'

export default async function CrmTeamChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>
  searchParams: Promise<{ with?: string }>
}) {
  const [{ workspaceId }, query] = await Promise.all([params, searchParams])
  const data = await getTeamChatData(workspaceId, query.with)
  return <CrmTeamChat workspaceId={workspaceId} data={data} />
}
