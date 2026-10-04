import { DashboardTopNav } from "@/components/dashboard-top-nav"
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCrmAccess } from '@/utils/crm-access'
import { DashboardUserNav } from '@/components/dashboard-user-nav'

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  let isOwner = false;
  if (user) {
    const access = await getCrmAccess(user.id)
    if (access.isCrmMember) redirect('/crm')
      
    const { count } = await supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('owner_id', user.id);
    isOwner = count ? count > 0 : false;
  }
  return (
    <div className="flex min-h-screen w-full bg-zinc-50/50">
      <div className="flex flex-col sm:gap-4 sm:py-0 w-full min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-zinc-200 bg-white/90 px-6 justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1 shadow-sm ring-1 ring-zinc-200 overflow-hidden">
              <img src="/logonew.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div className="font-semibold text-[15px] tracking-tight text-zinc-900">Admin Portal</div>
          </div>
          <div className="flex items-center gap-4">
             <DashboardUserNav 
               email={user?.email} 
               avatarUrl={user?.user_metadata?.avatar_url} 
               showCrmButton={isOwner}
             />
          </div>
        </header>
        <main className="flex-1 items-start p-4 sm:px-8 sm:py-8 w-full max-w-[1800px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
