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
  if (!access.canAccessCrm || !access.isSuperAdmin) throw new Error('Only the workspace owner can manage automation rules.')
  return { user, access, admin: createAdminClient() }
}

export async function addAutomationRule(workspaceId: string, formData: FormData) {
  const { user, access, admin } = await getCtx(workspaceId)
  const { error } = await admin.from('crm_automation_rules').insert({
    crm_workspace_id: access.crmWorkspaceId,
    name: String(formData.get('name') ?? '').trim(),
    trigger_event: String(formData.get('trigger_event') ?? 'LEAD_CREATED'),
    task_subject: String(formData.get('task_subject') ?? '').trim(),
    days_after: Number(formData.get('days_after') ?? 1) || 1,
    enabled: true,
    owner_user_id: user.id,
    created_by: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/automation`)
}

export async function toggleAutomationRule(workspaceId: string, id: string, enabled: boolean) {
  const { access, admin } = await getCtx(workspaceId)
  const { error } = await admin.from('crm_automation_rules').update({ enabled }).eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/automation`)
}

export async function deleteAutomationRule(workspaceId: string, id: string) {
  const { access, admin } = await getCtx(workspaceId)
  const { error } = await admin.from('crm_automation_rules').delete().eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/automation`)
}
