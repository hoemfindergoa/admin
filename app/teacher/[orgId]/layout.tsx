import { TeacherSidebar } from "@/components/teacher-sidebar"
import { DashboardTopNav } from "@/components/dashboard-top-nav"
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function TeacherLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: org, error: orgError },
    { data: teacherRecord },
  ] = await Promise.all([
    createAdminClient().from('organizations').select('*').eq('id', orgId).single(),
    supabase
      .from('school_teachers')
      .select('id, name, status')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (orgError || !org || !teacherRecord || teacherRecord.status !== 'ACTIVE') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <TeacherSidebar orgId={orgId} />
      <div className="flex min-h-screen flex-col sm:gap-4 sm:py-0 w-full min-w-0 overflow-y-auto">
        <DashboardTopNav orgId={orgId} orgName={org.name} orgLogo={org.logo_url} allOrgs={[{ id: org.id, name: org.name, logo_url: org.logo_url }]} isSuperAdmin={false} />
        <main className="flex-1 items-start p-4 sm:px-6 sm:py-6 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
