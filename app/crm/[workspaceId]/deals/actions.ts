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

const VALID_STAGES = ['QUALIFICATION', 'NEEDS_ANALYSIS', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']

export async function addDeal(workspaceId: string, formData: FormData) {
  const { user, access, admin } = await getCtx(workspaceId)
  const { error } = await admin.from('crm_deals').insert({
    crm_workspace_id: access.crmWorkspaceId,
    name: String(formData.get('name') ?? '').trim(),
    value: Number(formData.get('value') ?? 0) || 0,
    stage: String(formData.get('stage') ?? 'QUALIFICATION'),
    probability: Number(formData.get('probability') ?? 20) || 20,
    close_date: String(formData.get('close_date') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
    owner_user_id: user.id,
    created_by: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/deals`)
}

export async function updateDealStage(workspaceId: string, dealId: string, stage: string) {
  const { access, admin } = await getCtx(workspaceId)
  if (!VALID_STAGES.includes(stage)) throw new Error('Invalid stage.')
  const { error } = await admin.from('crm_deals').update({ stage }).eq('crm_workspace_id', access.crmWorkspaceId).eq('id', dealId)
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/deals`)
}

export async function deleteDeal(workspaceId: string, id: string) {
  const { access, admin } = await getCtx(workspaceId)
  const { error } = await admin.from('crm_deals').delete().eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/deals`)
}
