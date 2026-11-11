import { getTeacherClassroom } from '@/app/teacher/[orgId]/actions'
import { TeacherUpdatesWorkspace } from '@/components/teacher-updates-workspace'

export default async function TeacherUpdatesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const data = await getTeacherClassroom(orgId)
  return <div className="mx-auto max-w-6xl space-y-5"><header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Teacher workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Homework &amp; motivation</h1><p className="mt-2 text-sm text-muted-foreground">Share classwork and encouragement with parents in your assigned sections.</p></header><TeacherUpdatesWorkspace orgId={orgId} data={data} /></div>
}
