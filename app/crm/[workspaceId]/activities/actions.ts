'use server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getCrmAccess } from '@/utils/crm-access'
import { redirect } from 'next/navigation'

async function getCtx(workspaceId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('No access.')
  return { user, access, admin: createAdminClient() }
}

function canManageTeamActivities(access: any) {
  return access.isSuperAdmin || ['CRM_ADMIN', 'SALES_MANAGER'].includes(access.crmUser?.role)
}

async function getOwnedActivity(workspaceId: string, id: string) {
  const context = await getCtx(workspaceId)
  const { data: activity, error } = await context.admin.from('crm_activities')
    .select('id, owner_user_id, reminder_at')
    .eq('crm_workspace_id', context.access.crmWorkspaceId)
    .eq('id', id)
    .maybeSingle()
  if (error || !activity) throw new Error(error?.message ?? 'Reminder not found.')
  if (activity.reminder_at && activity.owner_user_id !== context.user.id) {
    throw new Error('Only the assigned teammate can update this lead reminder.')
  }
  if (!canManageTeamActivities(context.access) && activity.owner_user_id !== context.user.id) {
    throw new Error('You can only update reminders assigned to you.')
  }
  return context
}

export async function addActivity(workspaceId: string, formData: FormData) {
  const { user, access, admin } = await getCtx(workspaceId)
  const { error } = await admin.from('crm_activities').insert({
    crm_workspace_id: access.crmWorkspaceId,
    kind: String(formData.get('kind') ?? 'TASK'),
    subject: String(formData.get('subject') ?? '').trim(),
    details: String(formData.get('details') ?? '').trim() || null,
    due_at: String(formData.get('due_at') ?? '').trim() || null,
    owner_user_id: user.id,
    created_by: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/activities`)
}

export async function completeActivity(workspaceId: string, id: string) {
  const { access, admin } = await getOwnedActivity(workspaceId, id)
  const { error } = await admin.from('crm_activities')
    .update({ completed_at: new Date().toISOString() })
    .eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}`)
  revalidatePath(`/crm/${workspaceId}/activities`)
}

export async function deleteActivity(workspaceId: string, id: string) {
  const { access, admin } = await getOwnedActivity(workspaceId, id)
  const { error } = await admin.from('crm_activities').delete().eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}`)
  revalidatePath(`/crm/${workspaceId}/activities`)
}
