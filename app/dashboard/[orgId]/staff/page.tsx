import { StaffTeachersWorkspace } from '@/components/staff-teachers-workspace'
import { getTeacherAssignments } from '../school/actions'

export default async function StaffTeachersPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const data = await getTeacherAssignments(orgId)
  return <StaffTeachersWorkspace orgId={orgId} data={data} />
}
