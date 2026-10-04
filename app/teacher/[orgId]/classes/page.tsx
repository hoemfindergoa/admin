import { TeacherClassroom } from '@/components/teacher-classroom'
import { getTeacherClassroom } from '@/app/teacher/[orgId]/actions'
import { redirect } from 'next/navigation'

export default async function TeacherClassesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  try {
    const data = await getTeacherClassroom(orgId)
    return <TeacherClassroom orgId={orgId} data={data} />
  } catch (error: any) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-6 py-4 text-center text-destructive max-w-md">
          <p className="font-semibold mb-1">Failed to load classroom</p>
          <p className="text-sm opacity-90">{error?.message ?? 'An unknown error occurred.'}</p>
        </div>
      </div>
    )
  }
}
