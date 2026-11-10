'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getCrmAccess } from '@/utils/crm-access'
import { createAdminClient } from '@/utils/supabase/admin'

function getOptionalFranchiseDetails(formData: FormData) {
  const textFields = [
    'franchise_month', 'model', 'closure_by', 'city', 'state', 'authorization_code',
    'client_name', 'client_number', 'confirmation', 'transaction_details', 'manager_name',
  ] as const
  const dateFields = ['payment_date', 'transaction_date'] as const
  const amountFields = [
    'franchise_fee', 'gst', 'total_franchise_fee', 'amount_received', 'incentive_amount', 'manager_amount',
  ] as const

  const details: Record<string, string | number | null> = {}
  for (const field of textFields) {
    const value = String(formData.get(field) ?? '').trim()
    details[field] = value || null
  }
  for (const field of dateFields) {
    const value = String(formData.get(field) ?? '').trim()
    details[field] = value || null
  }
  for (const field of amountFields) {
    const raw = String(formData.get(field) ?? '').trim()
    if (!raw) {
      details[field] = null
      continue
    }
    const value = Number(raw)
    if (!Number.isFinite(value) || value < 0) throw new Error(`${field.replaceAll('_', ' ')} must be a valid non-negative amount.`)
    details[field] = value
  }

  const rawYear = String(formData.get('franchise_year') ?? '').trim()
  if (!rawYear) {
    details.franchise_year = null
  } else {
    const year = Number(rawYear)
    if (!Number.isInteger(year) || year < 1900 || year > 9999) throw new Error('Year must be between 1900 and 9999.')
    details.franchise_year = year
  }
  return details
}

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
  const franchise_brand = formData.get('franchise_brand') as string
  const affiliation = formData.get('affiliation') as string
  const session_start_date = formData.get('session_start_date') as string
  const session_end_date = formData.get('session_end_date') as string
  const course_type = formData.get('course_type') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  const logoFile = formData.get('logo_file') as File | null
  let logo_url = null

  if (logoFile && logoFile.size > 0) {
    const ext = logoFile.name.split('.').pop()
    const fileName = `new-${Date.now()}.${ext}`
    const uniqueId = crypto.randomUUID()
    const finalFileName = `${uniqueId}.${ext}`
    
    const adminSupabase = createAdminClient()
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('franchise_logos')
      .upload(finalFileName, logoFile, { upsert: true })
      
    if (uploadError) {
      console.error('Error uploading logo:', uploadError)
      throw new Error('Failed to upload logo image. Make sure the bucket "franchise_logos" exists and is public.')
    }
    
    const { data: publicUrlData } = adminSupabase.storage
      .from('franchise_logos')
      .getPublicUrl(finalFileName)
      
    logo_url = publicUrlData.publicUrl
  }

  const { data, error } = await supabase
    .from('organizations')
    .insert([
      {
        owner_id: user.id,
        name,
        franchise_brand,
        affiliation,
        session_start_date,
        session_end_date,
        course_type,
        email,
        phone,
        address,
        ...getOptionalFranchiseDetails(formData),
        ...(logo_url !== null ? { logo_url } : {})
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
  const franchise_brand = formData.get('franchise_brand') as string
  const affiliation = formData.get('affiliation') as string
  const session_start_date = formData.get('session_start_date') as string
  const session_end_date = formData.get('session_end_date') as string
  const course_type = formData.get('course_type') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  
  const logoFile = formData.get('logo_file') as File | null
  let logo_url = formData.get('logo_url') as string | null

  if (logoFile && logoFile.size > 0) {
    const ext = logoFile.name.split('.').pop()
    const fileName = `${orgId}-${Date.now()}.${ext}`
    const adminSupabase = createAdminClient()
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('franchise_logos')
      .upload(fileName, logoFile, { upsert: true })
      
    if (uploadError) {
      console.error('Error uploading logo:', uploadError)
      throw new Error('Failed to upload logo image. Make sure the bucket "franchise_logos" exists and is public.')
    }
    
    const { data: publicUrlData } = adminSupabase.storage
      .from('franchise_logos')
      .getPublicUrl(fileName)
      
    logo_url = publicUrlData.publicUrl
  }

  const { data, error } = await supabase
    .from('organizations')
    .update({
      name,
      franchise_brand,
      affiliation,
      session_start_date,
      session_end_date,
      course_type,
      email,
      phone,
      address,
      ...getOptionalFranchiseDetails(formData),
      ...(logo_url !== null ? { logo_url } : {})
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

export async function deleteOrganization(orgId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', orgId)
    .eq('owner_id', user.id) // Ensure only owner can delete

  if (error) {
    console.error('Error deleting organization:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}
