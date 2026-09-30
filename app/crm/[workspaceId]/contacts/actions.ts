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

export async function addContact(workspaceId: string, formData: FormData) {
  const { user, access, admin } = await getCtx(workspaceId)
  const { error } = await admin.from('crm_contacts').insert({
    crm_workspace_id: access.crmWorkspaceId,
    name: String(formData.get('name') ?? '').trim(),
    title: String(formData.get('title') ?? '').trim() || null,
    email: String(formData.get('email') ?? '').trim() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
    owner_user_id: user.id,
    created_by: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/contacts`)
}

export async function deleteContact(workspaceId: string, id: string) {
  const { access, admin } = await getCtx(workspaceId)
  const { error } = await admin.from('crm_contacts').delete().eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/contacts`)
}
