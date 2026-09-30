'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3, Bell, Briefcase, Building2, CalendarCheck,
  Contact, LayoutDashboard, LogOut, Megaphone, Search, Settings2, Users, Home
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useRef } from 'react'

export function CrmShell({
  children,
  workspaceId,
  isSuperAdmin,
  role,
  name,
}: {
  children: React.ReactNode
  workspaceId: string
  isSuperAdmin: boolean
  role: string
  name: string
}) {
  const [hovered, setHovered] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const roleLabel = isSuperAdmin ? 'Super Admin' : ['SALES_MANAGER', 'CRM_ADMIN'].includes(role) ? 'Sales Manager' : 'Sales Rep'
  const base = `/crm/${workspaceId}`

  const primaryLinks = [
    { href: base, label: 'Overview', icon: LayoutDashboard },
    { href: `${base}/leads`, label: 'Leads', icon: Contact },
    { href: `${base}/accounts`, label: 'Accounts', icon: Building2 },
    { href: `${base}/contacts`, label: 'Contacts', icon: Users },
    { href: `${base}/deals`, label: 'Deals', icon: Briefcase },
    { href: `${base}/activities`, label: 'Activities', icon: CalendarCheck },
  ]
  const insightLinks = [
    { href: `${base}/campaigns`, label: 'Campaigns', icon: Megaphone },
    { href: `${base}/reports`, label: 'Reports', icon: BarChart3 },
  ]

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  function handleMouseEnter() {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setHovered(true)
  }

  function handleMouseLeave() {
    hoverTimeout.current = setTimeout(() => setHovered(false), 120)
  }

  function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
    const active = href === base ? pathname === href : pathname.startsWith(href)
    return (
      <Link
        href={href}
        title={!hovered ? label : undefined}
        className={cn(
          'flex items-center gap-3 rounded-md py-2 text-[13px] font-medium transition-all duration-150',
          hovered ? 'px-3' : 'justify-center px-0',
          active
            ? 'bg-white/10 text-white'
            : 'text-zinc-400 hover:bg-white/8 hover:text-zinc-100'
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span
          className={cn(
            'overflow-hidden whitespace-nowrap transition-all duration-200',
            hovered ? 'w-auto opacity-100' : 'w-0 opacity-0'
          )}
        >
          {label}
        </span>
      </Link>
    )
  }

  const initials = name.slice(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans">
      {/* Sidebar — always 64px wide, expands to 220px on hover, floats over content */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col border-r border-[#242424] bg-[#0C0C0C] transition-[width] duration-200 ease-in-out will-change-[width]',
          hovered ? 'w-[220px] shadow-2xl shadow-black/50' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center border-b border-[#242424] px-[18px]">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md ring-1 ring-white/20">
            <BarChart3 className="h-3.5 w-3.5 text-white" />
          </div>
          <span
            className={cn(
              'ml-3 overflow-hidden whitespace-nowrap text-[14px] font-bold text-white transition-all duration-200',
              hovered ? 'w-auto opacity-100' : 'w-0 opacity-0'
            )}
          >
            Sales CRM
          </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-5 space-y-5">
          {/* Workspace group */}
          <div>
            {hovered && (
              <p className="mb-1.5 pl-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Workspace
              </p>
            )}
            <nav className="space-y-0.5">
              {primaryLinks.map(link => <NavLink key={link.href} {...link} />)}
            </nav>
          </div>

          {/* Insights group */}
          <div>
            {hovered && (
              <p className="mb-1.5 pl-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Insights
              </p>
            )}
            <nav className="space-y-0.5">
              {insightLinks.map(link => <NavLink key={link.href} {...link} />)}
            </nav>
          </div>

          {/* Admin group */}
          {isSuperAdmin && (
            <div>
              {hovered && (
                <p className="mb-1.5 pl-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Manage
                </p>
              )}
              <nav className="space-y-0.5">
                <NavLink href={`${base}/automation`} label="Automation" icon={Settings2} />
                <NavLink href={`${base}/team`} label="Team & Access" icon={Users} />
              </nav>
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
        {isSuperAdmin && (
          <div className="border-t border-[#242424] px-2 py-2">
            <Link
              href="/dashboard"
              title={!hovered ? 'School Dashboard' : undefined}
              className="flex items-center gap-3 rounded-md py-2 text-zinc-500 hover:bg-white/5 hover:text-zinc-200 transition-colors duration-150 px-[10px]"
            >
              <Home className="h-[18px] w-[18px] shrink-0" />
              <span
                className={cn(
                  'overflow-hidden whitespace-nowrap text-[13px] font-medium transition-all duration-200',
                  hovered ? 'w-auto opacity-100' : 'w-0 opacity-0'
                )}
              >
                School Dashboard
              </span>
            </Link>
          </div>
        )}

        {/* User Footer */}
        <div className="border-t border-[#242424] px-2 py-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
              {initials}
            </div>
            <div
              className={cn(
                'flex min-w-0 flex-1 items-center justify-between overflow-hidden transition-all duration-200',
                hovered ? 'w-auto opacity-100' : 'w-0 opacity-0'
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-zinc-200">{name}</p>
                <p className="text-[10px] text-zinc-500">{roleLabel}</p>
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="ml-2 shrink-0 rounded-md p-1 text-zinc-500 hover:bg-white/10 hover:text-white transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main — always offset by collapsed sidebar width (64px) */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-16">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-5">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <BarChart3 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[14px] font-bold">Sales CRM</span>
          </div>

          {/* Search bar */}
          <div className="relative hidden w-full max-w-sm sm:block">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search leads, accounts, contacts…"
              className="h-8 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Right */}
          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href={`${base}/activities`}
              className="relative rounded-full p-2 text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-1.5 top-1.5 flex h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white" />
            </Link>
            <Link
              href={`${base}/leads?new=1`}
              className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-full bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
            >
              + New Lead
            </Link>
            <button
              onClick={signOut}
              className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 transition-colors lg:hidden"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page content — full width, no max-width clamp */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-zinc-200 bg-white/95 backdrop-blur-md py-2 lg:hidden">
        {[...primaryLinks.slice(0, 4), { href: `${base}/activities`, label: 'Tasks', icon: Bell }].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-semibold transition-colors',
              pathname === href || (href !== base && pathname.startsWith(href))
                ? 'text-indigo-600'
                : 'text-zinc-400'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
