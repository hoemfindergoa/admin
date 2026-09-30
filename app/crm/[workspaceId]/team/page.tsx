import { redirect } from 'next/navigation'
import { getCrmData, getCrmMembers } from '../actions'
import { CrmMembersWorkspace } from '@/components/crm-members-workspace'
export default async function TeamPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params
  const data = await getCrmData(workspaceId)
  if (!data.access.isSuperAdmin) redirect(`/crm/${workspaceId}`)
  const members = await getCrmMembers(workspaceId)
  return <CrmMembersWorkspace members={members as any} workspaceId={workspaceId} />
}
