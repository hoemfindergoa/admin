import { createAdminClient } from '@/utils/supabase/admin'

export async function getCrmNotificationSnapshotForUser(workspaceId: string, userId: string) {
  const admin = createAdminClient()
  const [{ count: activityCount, error: activityError }, { count: unreadMessages, error: unreadError }, { data: latestAssignment, error: latestAssignmentError }, { data: latestMessage, error: latestMessageError }] = await Promise.all([
    admin.from('crm_activities').select('id', { count: 'exact', head: true }).eq('crm_workspace_id', workspaceId).eq('owner_user_id', userId).is('completed_at', null),
    admin.from('crm_team_messages').select('id', { count: 'exact', head: true }).eq('crm_workspace_id', workspaceId).eq('recipient_user_id', userId).is('read_at', null),
    admin.from('crm_lead_performance_events').select('id, created_at').eq('crm_workspace_id', workspaceId).eq('assigned_to_user_id', userId).neq('actor_user_id', userId).eq('event_type', 'ASSIGNED').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('crm_team_messages').select('id, created_at').eq('crm_workspace_id', workspaceId).eq('recipient_user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])
  const error = activityError ?? unreadError ?? latestAssignmentError ?? latestMessageError
  if (error) throw new Error(error.message)
  return {
    activityCount: activityCount ?? 0,
    unreadMessages: unreadMessages ?? 0,
    latestAssignmentId: latestAssignment?.id ?? null,
    latestAssignmentAt: latestAssignment?.created_at ?? null,
    latestMessageId: latestMessage?.id ?? null,
    latestMessageAt: latestMessage?.created_at ?? null,
  }
}
