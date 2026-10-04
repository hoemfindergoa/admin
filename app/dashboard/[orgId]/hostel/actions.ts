'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function createHostel(orgId: string, formData: FormData) {
  const supabase = createClient(await cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')

  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', orgId).single(),
    supabase.from('organization_users').select('role, permissions').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])

  const isAdmin = org?.owner_id === user.id || member?.role === 'FRANCHISE_ADMIN' || (Array.isArray(member?.permissions) && member?.permissions.includes('hostel'))

  if (!isAdmin) {
    throw new Error('You do not have permission to manage hostels.')
  }

  const name = String(formData.get('name') ?? '').trim()
  const type = String(formData.get('type') ?? '').trim()
  const capacityStr = String(formData.get('capacity') ?? '').trim()
  const warden_name = String(formData.get('warden_name') ?? '').trim()
  const warden_phone = String(formData.get('warden_phone') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim()

  if (!name || !type || !capacityStr) {
    throw new Error('Please fill in Name, Type, and Capacity.')
  }

  const capacity = parseInt(capacityStr, 10)
  if (isNaN(capacity) || capacity < 1) {
    throw new Error('Capacity must be a valid positive number.')
  }

  const admin = createAdminClient()

  const { error } = await admin.from('school_hostels').insert({
    org_id: orgId,
    name,
    type,
    capacity,
    warden_name,
    warden_phone,
    address
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/${orgId}/hostel`)
}
