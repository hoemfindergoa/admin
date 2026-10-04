'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function createAdmissionForm(orgId: string, formData: FormData) {
  const supabase = createClient(await cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')

  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', orgId).single(),
    supabase.from('organization_users').select('role, permissions').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])

  const isAdmin = org?.owner_id === user.id || member?.role === 'FRANCHISE_ADMIN' || (Array.isArray(member?.permissions) && member?.permissions.includes('students'))

  if (!isAdmin) {
    throw new Error('You do not have permission to create admission forms.')
  }

  const name = String(formData.get('name') ?? '').trim()
  const deadline = String(formData.get('deadline') ?? '').trim()
  const classes = JSON.parse(String(formData.get('classes') ?? '[]'))

  if (!name || !deadline || !classes.length) {
    throw new Error('Please fill in all required fields.')
  }

  const admin = createAdminClient()

  const { error } = await admin.from('school_admission_forms').insert({
    org_id: orgId,
    name,
    deadline,
    classes
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/${orgId}/admission`)
}
