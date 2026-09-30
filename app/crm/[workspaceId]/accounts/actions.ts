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

export async function addAccount(workspaceId: string, formData: FormData) {
  const { user, access, admin } = await getCtx(workspaceId)
  const { error } = await admin.from('crm_accounts').insert({
    crm_workspace_id: access.crmWorkspaceId,
    name: String(formData.get('name') ?? '').trim(),
    website: String(formData.get('website') ?? '').trim() || null,
    industry: String(formData.get('industry') ?? '').trim() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    email: String(formData.get('email') ?? '').trim() || null,
    address: String(formData.get('address') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
    owner_user_id: user.id,
    created_by: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/accounts`)
}

export async function deleteAccount(workspaceId: string, id: string) {
  const { access, admin } = await getCtx(workspaceId)
  const { error } = await admin.from('crm_accounts').delete().eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/accounts`)
}
