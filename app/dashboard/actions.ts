'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getCrmAccess } from '@/utils/crm-access'

export async function getOrganizations() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: orgs, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organizations:', error)
    return []
  }

  return orgs
}

export async function getOrganizationById(orgId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  if (error) {
    console.error('Error fetching organization:', error)
    return null
  }

  return org
}

export async function createOrganization(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const crmAccess = await getCrmAccess(user.id)
  if (crmAccess.isCrmMember) throw new Error('CRM team accounts cannot create school franchises.')

  const name = formData.get('name') as string
  const affiliation = formData.get('affiliation') as string
  const session_start_date = formData.get('session_start_date') as string
  const session_end_date = formData.get('session_end_date') as string
  const course_type = formData.get('course_type') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  const { data, error } = await supabase
    .from('organizations')
    .insert([
      {
        owner_id: user.id,
        name,
        affiliation,
        session_start_date,
        session_end_date,
        course_type,
        email,
        phone,
        address,
      }
    ])
    .select()

  if (error) {
    console.error('Error creating organization:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  return data[0]
}

export async function updateOrganization(orgId: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string
  const affiliation = formData.get('affiliation') as string
  const session_start_date = formData.get('session_start_date') as string
  const session_end_date = formData.get('session_end_date') as string
  const course_type = formData.get('course_type') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  const { data, error } = await supabase
    .from('organizations')
    .update({
      name,
      affiliation,
      session_start_date,
      session_end_date,
      course_type,
      email,
      phone,
      address,
    })
    .eq('id', orgId)
    .eq('owner_id', user.id) // security check
    .select()

  if (error) {
    console.error('Error updating organization:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  return data[0]
}
