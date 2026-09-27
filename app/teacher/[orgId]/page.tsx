import { redirect } from 'next/navigation'
import { TeacherClassroom } from '@/components/teacher-classroom'
import { getTeacherClassroom } from './actions'

export default async function TeacherPortalPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  try {
    const data = await getTeacherClassroom(orgId)
    return <TeacherClassroom orgId={orgId} data={data} />
  } catch {
    redirect('/login?message=This+account+does+not+have+an+active+teacher+profile')
  }
}
