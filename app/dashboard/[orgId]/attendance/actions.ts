'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

async function getAttendanceAccess(orgId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  const [{ data: org }, { data: member }, { data: teacher }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', orgId).maybeSingle(),
    supabase.from('organization_users').select('role, permissions, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
    supabase.from('school_teachers').select('status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])
  const allowed = org?.owner_id === user.id || (member?.status === 'ACTIVE' && (member?.role === 'FRANCHISE_ADMIN' || (
    Array.isArray(member.permissions) && (member.permissions.includes('attendance') || member.permissions.includes('manage_school') || member.permissions.includes('teacher'))
  ))) || teacher?.status === 'ACTIVE'
  if (!allowed) throw new Error('You do not have permission to manage attendance.')
  return supabase
}

export async function getAttendanceWorkspace(orgId: string, date: string, classId?: string, sectionId?: string) {
  const supabase = await getAttendanceAccess(orgId)
  
  // Get all classes and sections
  const [{ data: classes }, { data: sections }] = await Promise.all([
    supabase.from('school_classes').select('id, name, sort_order').eq('org_id', orgId).order('sort_order').order('name'),
    supabase.from('school_sections').select('id, class_id, name').eq('org_id', orgId).order('name'),
  ])
  
  let students: any[] = []
  let attendance: any[] = []
  
  if (classId && sectionId) {
    const [{ data: studentsData }, { data: attendanceData }] = await Promise.all([
      supabase.from('students').select('id, student_name, admission_number').eq('org_id', orgId).eq('class_id', classId).eq('section_id', sectionId).order('student_name'),
      supabase.from('school_attendance').select('*').eq('org_id', orgId).eq('class_id', classId).eq('section_id', sectionId).eq('date', date)
    ])
    students = studentsData ?? []
    attendance = attendanceData ?? []
  }

  return {
    classes: classes ?? [],
    sections: sections ?? [],
    students,
    attendance,
    date,
    classId,
    sectionId
  }
}

export async function saveAttendance(orgId: string, classId: string, sectionId: string, date: string, attendanceData: { student_id: string, status: string, notes?: string }[]) {
  const supabase = await getAttendanceAccess(orgId)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Prepare records for upsert
  const records = attendanceData.map(record => ({
    org_id: orgId,
    class_id: classId,
    section_id: sectionId,
    date: date,
    student_id: record.student_id,
    status: record.status,
    notes: record.notes || null,
    recorded_by: user.id,
    updated_at: new Date().toISOString()
  }))

  if (records.length === 0) return

  const { error } = await supabase.from('school_attendance').upsert(records, { onConflict: 'org_id, student_id, date' })
  
  if (error) {
    if (error.code === '42P01') {
      throw new Error("The attendance table has not been created in your Supabase project yet. Please run the provided SQL in your Supabase dashboard.")
    }
    throw new Error(error.message)
  }
  
  revalidatePath(`/dashboard/${orgId}/attendance`)
}
