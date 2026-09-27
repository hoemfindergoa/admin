import { StudentsWorkspace } from '@/components/students-workspace'
import { getStudentWorkspace } from './actions'

export default async function StudentsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const data = await getStudentWorkspace(orgId)
  return <StudentsWorkspace orgId={orgId} {...data} />
}
