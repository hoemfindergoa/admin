'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getCrmAccess } from '@/utils/crm-access'

const isManager = (access: any) => access.isSuperAdmin || ['CRM_ADMIN', 'SALES_MANAGER'].includes(access.crmUser?.role)
const isAdminRole = (role: string) => ['CRM_ADMIN', 'SALES_MANAGER', 'SUPER_ADMIN'].includes(role)

async function getChatContext(workspaceId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('You do not have access to this CRM workspace.')
  return { user, access, admin: createAdminClient() }
}

async function getAllowedContacts(userId: string, access: any, admin: ReturnType<typeof createAdminClient>) {
  const [{ data: members, error: membersError }, { data: workspace, error: workspaceError }] = await Promise.all([
    admin.from('crm_users').select('user_id, name, email, role, status').eq('crm_workspace_id', access.crmWorkspaceId).eq('status', 'ACTIVE'),
    admin.from('crm_workspaces').select('owner_user_id').eq('id', access.crmWorkspaceId).maybeSingle(),
  ])
  if (membersError || workspaceError) throw new Error(membersError?.message ?? workspaceError?.message)

  const allContacts = (members ?? []).filter((member: any) => member.user_id && member.user_id !== userId).map((member: any) => ({
    userId: member.user_id,
    name: member.name || member.email || 'CRM member',
    email: member.email ?? '',
    role: member.role,
    isAdmin: isAdminRole(member.role),
  }))
  if (workspace?.owner_user_id && workspace.owner_user_id !== userId && !allContacts.some((contact: any) => contact.userId === workspace.owner_user_id)) {
    allContacts.unshift({ userId: workspace.owner_user_id, name: 'Workspace admin', email: '', role: 'SUPER_ADMIN', isAdmin: true })
  }
  const contacts = isManager(access) ? allContacts : allContacts.filter((contact: any) => contact.isAdmin)
  const { data: unreadRows, error: unreadError } = await admin.from('crm_team_messages')
    .select('sender_user_id')
    .eq('crm_workspace_id', access.crmWorkspaceId)
    .eq('recipient_user_id', userId)
    .is('read_at', null)
  if (unreadError) throw new Error(unreadError.message)
  const unreadCounts = new Map<string, number>()
  for (const row of unreadRows ?? []) unreadCounts.set(row.sender_user_id, (unreadCounts.get(row.sender_user_id) ?? 0) + 1)
  return contacts.map((contact: any) => ({ ...contact, unreadCount: unreadCounts.get(contact.userId) ?? 0 }))
}

export async function getTeamChatData(workspaceId: string, requestedPeerId?: string) {
  const { user, access, admin } = await getChatContext(workspaceId)
  const contacts = await getAllowedContacts(user.id, access, admin)
  const selected = contacts.find((contact: any) => contact.userId === requestedPeerId) ?? contacts[0] ?? null
  if (!selected) return { currentUserId: user.id, contacts, selectedPeerId: null, messages: [] }

  const { data: messages, error } = await admin.from('crm_team_messages').select('id, sender_user_id, recipient_user_id, body, created_at, read_at')
    .eq('crm_workspace_id', access.crmWorkspaceId)
    .or(`and(sender_user_id.eq.${user.id},recipient_user_id.eq.${selected.userId}),and(sender_user_id.eq.${selected.userId},recipient_user_id.eq.${user.id})`)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)

  const incomingIds = (messages ?? []).filter((message: any) => message.recipient_user_id === user.id && !message.read_at).map((message: any) => message.id)
  if (incomingIds.length) {
    const { error: readError } = await admin.from('crm_team_messages').update({ read_at: new Date().toISOString() })
      .eq('crm_workspace_id', access.crmWorkspaceId).eq('recipient_user_id', user.id).in('id', incomingIds)
    if (readError) throw new Error(readError.message)
  }
  return { currentUserId: user.id, contacts, selectedPeerId: selected.userId, messages: messages ?? [] }
}

export async function sendTeamMessage(workspaceId: string, recipientUserId: string, rawBody: string) {
  const { user, access, admin } = await getChatContext(workspaceId)
  const body = String(rawBody ?? '').trim()
  if (!body || body.length > 4000) throw new Error('Messages must be between 1 and 4,000 characters.')
  const contacts = await getAllowedContacts(user.id, access, admin)
  if (!contacts.some((contact: any) => contact.userId === recipientUserId)) {
    throw new Error(isManager(access) ? 'Choose an active member in this CRM workspace.' : 'You can message CRM admins only.')
  }
  const { error } = await admin.from('crm_team_messages').insert({
    crm_workspace_id: access.crmWorkspaceId,
    sender_user_id: user.id,
    recipient_user_id: recipientUserId,
    body,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/chat`)
}
