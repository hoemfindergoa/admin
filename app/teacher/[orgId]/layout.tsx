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
    { data: allOrgs },
    { data: teacherRecord },
  ] = await Promise.all([
    createAdminClient().from('organizations').select('*').eq('id', orgId).single(),
    supabase.from('organizations').select('id, name, logo_url').order('created_at', { ascending: true }),
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
    <div className="flex min-h-screen w-full bg-muted/40 absolute inset-0 z-50 bg-background">
      <TeacherSidebar orgId={orgId} />
      <div className="flex flex-col sm:gap-4 sm:py-0 w-full min-w-0 h-screen overflow-y-auto">
        <DashboardTopNav orgId={orgId} orgName={org.name} orgLogo={org.logo_url} allOrgs={allOrgs ?? []} isSuperAdmin={false} />
        <main className="flex-1 items-start p-4 sm:px-6 sm:py-6 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
