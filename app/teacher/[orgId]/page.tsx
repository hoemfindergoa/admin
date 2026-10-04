import { redirect } from 'next/navigation'

export default async function TeacherPortalPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  redirect(`/teacher/${orgId}/classes`)
}
