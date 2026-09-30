'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getCrmAccess } from '@/utils/crm-access'
import { redirect } from 'next/navigation'

export async function addCampaign(workspaceId: string, formData: FormData) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('No access.')

  const admin = createAdminClient()
  const { error } = await admin.from('crm_campaigns').insert({
    crm_workspace_id: access.crmWorkspaceId,
    name: String(formData.get('name') ?? '').trim(),
    channel: String(formData.get('channel') ?? '').trim() || null,
    status: String(formData.get('status') ?? 'DRAFT'),
    start_date: String(formData.get('start_date') ?? '').trim() || null,
    end_date: String(formData.get('end_date') ?? '').trim() || null,
    budget: Number(formData.get('budget') ?? 0) || null,
    owner_user_id: String(formData.get('owner_user_id') ?? '').trim() || null,
    created_by: user.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/campaigns`)
}

export async function updateCampaignStatus(workspaceId: string, campaignId: string, status: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('No access.')

  const admin = createAdminClient()
  const { error } = await admin.from('crm_campaigns')
    .update({ status })
    .eq('crm_workspace_id', access.crmWorkspaceId)
    .eq('id', campaignId)

  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/campaigns`)
}

export async function deleteCampaign(workspaceId: string, campaignId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('No access.')

  const admin = createAdminClient()
  const { error } = await admin.from('crm_campaigns')
    .delete()
    .eq('crm_workspace_id', access.crmWorkspaceId)
    .eq('id', campaignId)

  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/campaigns`)
}
