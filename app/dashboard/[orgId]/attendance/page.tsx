import { getAttendanceWorkspace } from './actions'
import { AttendanceWorkspace } from '@/components/attendance-workspace'

export default async function AttendancePage({ params, searchParams }: { params: Promise<{ orgId: string }>, searchParams: Promise<{ date?: string, classId?: string, sectionId?: string }> }) {
  const { orgId } = await params
  const { date, classId, sectionId } = await searchParams

  // Default to today if no date provided
  const targetDate = date || new Date().toISOString().split('T')[0]!

  const data = await getAttendanceWorkspace(orgId, targetDate, classId, sectionId)
  return <AttendanceWorkspace orgId={orgId} {...data} />
}
