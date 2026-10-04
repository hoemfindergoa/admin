'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function getSchedulesAccess(orgId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  
  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', orgId).maybeSingle(),
    supabase.from('organization_users').select('role, permissions, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])
  
  const allowed = org?.owner_id === user.id || (member?.status === 'ACTIVE' && (
    member.role === 'FRANCHISE_ADMIN' || (Array.isArray(member.permissions) && member.permissions.includes('schedules'))
  ))
  
  if (!allowed) throw new Error('You do not have permission to manage schedules.')
  return { supabase, user }
}

export async function getSchedulesWorkspace(orgId: string) {
  await getSchedulesAccess(orgId)
  const admin = createAdminClient()
  
  const [
    { data: events, error: eventsError },
    { data: slots, error: slotsError },
    { data: classes },
    { data: sections },
    { data: subjects },
  ] = await Promise.all([
    admin.from('school_events').select('*').eq('org_id', orgId).order('start_date', { ascending: true }),
    admin.from('school_timetable_slots').select('*').eq('org_id', orgId).order('start_time', { ascending: true }),
    admin.from('school_classes').select('id, name').eq('org_id', orgId).order('name'),
    admin.from('school_sections').select('id, class_id, name').eq('org_id', orgId).order('name'),
    admin.from('school_subjects').select('id, class_id, name, color_code').eq('org_id', orgId).order('name'),
  ])
  
  if (eventsError || slotsError) {
    return { events: [], slots: [], classes: classes ?? [], sections: sections ?? [], subjects: subjects ?? [], schemaReady: false }
  }
  
  return { 
    events: events ?? [], 
    slots: slots ?? [],
    classes: classes ?? [],
    sections: sections ?? [],
    subjects: subjects ?? [],
    schemaReady: true
  }
}

export async function createEvent(orgId: string, formData: FormData) {
  const { supabase } = await getSchedulesAccess(orgId)
  
  const title = String(formData.get('title') ?? '').trim()
  const scope = String(formData.get('scope') ?? 'ALL')
  const classId = formData.get('class_id') ? String(formData.get('class_id')) : null
  const sectionId = formData.get('section_id') ? String(formData.get('section_id')) : null
  const startDate = String(formData.get('start_date') ?? '')
  const endDate = String(formData.get('end_date') ?? '')
  const isFullDay = formData.get('is_full_day') === 'on'
  const isRecurring = formData.get('is_recurring') === 'on'
  const eventType = String(formData.get('event_type') ?? 'EVENT')

  if (!title || !startDate || !endDate) throw new Error('Title, start date, and end date are required.')

  const { error } = await supabase.from('school_events').insert({
    org_id: orgId,
    title,
    scope,
    class_id: classId,
    section_id: sectionId,
    start_date: startDate,
    end_date: endDate,
    is_full_day: isFullDay,
    is_recurring: isRecurring,
    event_type: eventType,
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/schedules`)
}

export async function updateEvent(orgId: string, eventId: string, formData: FormData) {
  const { supabase } = await getSchedulesAccess(orgId)
  
  const title = String(formData.get('title') ?? '').trim()
  const scope = String(formData.get('scope') ?? 'ALL')
  const classId = formData.get('class_id') ? String(formData.get('class_id')) : null
  const sectionId = formData.get('section_id') ? String(formData.get('section_id')) : null
  const startDate = String(formData.get('start_date') ?? '')
  const endDate = String(formData.get('end_date') ?? '')
  const isFullDay = formData.get('is_full_day') === 'on'
  const isRecurring = formData.get('is_recurring') === 'on'
  const eventType = String(formData.get('event_type') ?? 'EVENT')

  if (!title || !startDate || !endDate) throw new Error('Title, start date, and end date are required.')

  const { error } = await supabase.from('school_events').update({
    title, scope, class_id: classId, section_id: sectionId,
    start_date: startDate, end_date: endDate,
    is_full_day: isFullDay, is_recurring: isRecurring, event_type: eventType,
    updated_at: new Date().toISOString()
  }).eq('id', eventId).eq('org_id', orgId)

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/schedules`)
}

export async function deleteEvent(orgId: string, eventId: string) {
  const { supabase } = await getSchedulesAccess(orgId)
  const { error } = await supabase.from('school_events').delete().eq('id', eventId).eq('org_id', orgId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/schedules`)
}

export async function addTimetableSlot(orgId: string, data: any) {
  const { supabase } = await getSchedulesAccess(orgId)
  
  const { error } = await supabase.from('school_timetable_slots').insert({
    org_id: orgId,
    class_id: data.class_id,
    section_id: data.section_id,
    day_of_week: data.day_of_week,
    start_time: data.start_time,
    end_time: data.end_time,
    slot_type: data.slot_type,
    subject_id: data.subject_id || null,
    label: data.label || null
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/schedules`)
}

export async function deleteTimetableSlot(orgId: string, slotId: string) {
  const { supabase } = await getSchedulesAccess(orgId)
  const { error } = await supabase.from('school_timetable_slots').delete().eq('id', slotId).eq('org_id', orgId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/schedules`)
}
