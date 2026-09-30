import { DashboardTopNav } from "@/components/dashboard-top-nav"
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCrmAccess } from '@/utils/crm-access'

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const access = await getCrmAccess(user.id)
    if (access.isCrmMember) redirect('/crm')
  }
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-0 w-full min-w-0">
        {/* We can have a simplified top nav here or reuse the existing one without org context */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 justify-between">
          <div className="font-semibold text-lg tracking-tight">Admin Portal</div>
          <div className="flex items-center gap-4">
             {/* User Profile Dropdown could go here */}
          </div>
        </header>
        <main className="flex-1 items-start p-4 sm:px-6 sm:py-6 w-full max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
