'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  BarChart3, Bell, Briefcase, Building2, CalendarCheck, Contact,
  LayoutDashboard, LogOut, Megaphone, Menu, MessageCircle, Plus, Settings2, Users, Home,
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { getCrmNotificationSnapshot } from '@/app/crm/[workspaceId]/notification-actions'

function playChime(context: AudioContext, frequency: number) {
  const now = context.currentTime
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.32, now + 0.025)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.31)
}

export function CrmShell({
  children,
  workspaceId,
  isSuperAdmin,
  role,
  name,
  email,
  avatarUrl,
  notificationCount,
  unreadMessageCount,
  initialLatestMessageId,
  initialLatestAssignmentId,
  initialNotificationSnapshotReady,
}: {
  children: React.ReactNode
  workspaceId: string
  isSuperAdmin: boolean
  role: string
  name: string
  email?: string
  avatarUrl?: string | null
  notificationCount?: number
  unreadMessageCount?: number
  initialLatestMessageId?: string | null
  initialLatestAssignmentId?: string | null
  initialNotificationSnapshotReady?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const [notice, setNotice] = useState('')
  const [liveCounts, setLiveCounts] = useState({ activityCount: notificationCount ?? 0, unreadMessages: unreadMessageCount ?? 0 })
  const eventIds = useRef({ message: initialLatestMessageId ?? null, assignment: initialLatestAssignmentId ?? null })
  const hasNotificationBaseline = useRef(!!initialNotificationSnapshotReady)
  const audioContext = useRef<AudioContext | null>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const expanded = hovered
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const base = `/crm/${workspaceId}`
  const drawerId = `crm-navigation-${workspaceId}`
  const roleLabel = isSuperAdmin ? 'Super Admin' : ['SALES_MANAGER', 'CRM_ADMIN'].includes(role) ? 'Sales Manager' : 'Sales Rep'
  const primaryLinks = [
    { href: base, label: 'Overview', icon: LayoutDashboard },
    { href: `${base}/leads`, label: 'Leads', icon: Contact },
    { href: `${base}/accounts`, label: 'Accounts', icon: Building2 },
    { href: `${base}/contacts`, label: 'Contacts', icon: Users },
    { href: `${base}/deals`, label: 'Deals', icon: Briefcase },
    { href: `${base}/activities`, label: 'Activities', icon: CalendarCheck },
    { href: `${base}/chat`, label: 'Team chat', icon: MessageCircle },
  ]
  const insightLinks = [
    { href: `${base}/campaigns`, label: 'Campaigns', icon: Megaphone },
    { href: `${base}/reports`, label: 'Reports', icon: BarChart3 },
  ]
  const manager = isSuperAdmin || ['SALES_MANAGER', 'CRM_ADMIN'].includes(role)

  useEffect(() => {
    const unlockAudio = () => {
      try {
        if (!audioContext.current) audioContext.current = new window.AudioContext()
        if (audioContext.current.state === 'suspended') void audioContext.current.resume()
      } catch { /* Some browsers disable audio contexts. */ }
    }
    window.addEventListener('pointerdown', unlockAudio)
    window.addEventListener('keydown', unlockAudio)
    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
      if (noticeTimer.current) clearTimeout(noticeTimer.current)
      if (audioContext.current) void audioContext.current.close()
    }
  }, [])

  useEffect(() => {
    let active = true
    async function refreshNotifications() {
      try {
        const snapshot = await getCrmNotificationSnapshot(workspaceId)
        if (!active) return
        setLiveCounts({ activityCount: snapshot.activityCount, unreadMessages: snapshot.unreadMessages })
        if (!hasNotificationBaseline.current) {
          eventIds.current = { message: snapshot.latestMessageId, assignment: snapshot.latestAssignmentId }
          hasNotificationBaseline.current = true
          return
        }
        const newMessage = !!snapshot.latestMessageId && snapshot.latestMessageId !== eventIds.current.message
        const newAssignment = !!snapshot.latestAssignmentId && snapshot.latestAssignmentId !== eventIds.current.assignment
        eventIds.current = { message: snapshot.latestMessageId, assignment: snapshot.latestAssignmentId }
        if (newMessage || newAssignment) {
          const message = [newMessage ? 'You have a new team message.' : '', newAssignment ? 'A lead was assigned to you.' : ''].filter(Boolean).join(' ')
          setNotice(message)
          if (noticeTimer.current) clearTimeout(noticeTimer.current)
          noticeTimer.current = setTimeout(() => setNotice(''), 6500)
          try {
            if (!audioContext.current) audioContext.current = new window.AudioContext()
            const context = audioContext.current
            if (context.state === 'suspended') void context.resume().then(() => {
              if (newAssignment) playChime(context, 660)
              if (newMessage) setTimeout(() => {
                if (context.state === 'running') {
                  playChime(context, 880)
                  setTimeout(() => { if (context.state === 'running') playChime(context, 1046) }, 140)
                }
              }, newAssignment ? 180 : 0)
            })
            else {
              if (newAssignment) playChime(context, 660)
              if (newMessage) setTimeout(() => {
                if (context.state === 'running') {
                  playChime(context, 880)
                  setTimeout(() => { if (context.state === 'running') playChime(context, 1046) }, 140)
                }
              }, newAssignment ? 180 : 0)
            }
          } catch { /* Sound is best-effort; the live notice still appears. */ }
        }
      } catch { /* A schema upgrade may be pending; keep the shell usable. */ }
    }
    void refreshNotifications()
    const interval = window.setInterval(() => void refreshNotifications(), 15000)
    return () => { active = false; window.clearInterval(interval) }
  }, [workspaceId])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  function NavLinks({ links }: { links: typeof primaryLinks }) {
    return <ul className="menu menu-sm gap-1 px-2">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === base ? pathname === href : pathname.startsWith(href)
        return <li key={href}>
          <Link href={href} title={!expanded ? label : undefined} aria-label={!expanded && label === 'Team chat' && liveCounts.unreadMessages > 0 ? `${label}, ${liveCounts.unreadMessages} unread` : !expanded ? label : undefined} aria-current={active ? 'page' : undefined} onClick={() => { const input = document.getElementById(drawerId) as HTMLInputElement | null; if (input) input.checked = false }} className={`${active ? 'menu-active bg-white/10 font-semibold text-white' : 'text-neutral-content/70 hover:bg-white/5 hover:text-white'} min-h-10 gap-3 rounded-xl ${expanded ? '' : 'lg:justify-center lg:px-0 lg:relative'}`}>
            <Icon className="h-[18px] w-[18px] shrink-0" /><span className={`truncate ${expanded ? '' : 'lg:hidden'}`}>{label}</span>
            {label === 'Activities' && liveCounts.activityCount > 0 && <span className={`badge badge-primary badge-sm ${expanded ? 'ml-auto' : 'lg:absolute lg:-right-1 lg:-top-1 lg:badge-xs'}`}>{liveCounts.activityCount > 99 ? '99+' : liveCounts.activityCount}</span>}
            {label === 'Team chat' && liveCounts.unreadMessages > 0 && <span className={`badge badge-primary ${expanded ? 'badge-sm ml-auto' : 'badge-xs lg:absolute lg:-right-1 lg:-top-1'}`}>{liveCounts.unreadMessages > 99 ? '99+' : liveCounts.unreadMessages}</span>}
          </Link>
        </li>
      })}
    </ul>
  }

  const rawName = (name || email || '').trim()
  const emailPrefix = rawName.includes('@') ? (rawName.split('@')[0] ?? '') : rawName
  const initialsSource = emailPrefix.replace(/[._-]+/g, ' ').trim()
  const initialsParts = initialsSource.split(/\s+/).filter(Boolean)
  const firstPart = initialsParts[0]
  const secondPart = initialsParts[1]
  const initials = firstPart && secondPart
    ? `${firstPart.charAt(0)}${secondPart.charAt(0)}`.toUpperCase()
    : (firstPart?.slice(0, 2) || 'U').toUpperCase()
  const manageLinks = [
    ...(manager ? [{ href: `${base}/performance`, label: 'Performance', icon: BarChart3 }] : []),
    ...(isSuperAdmin ? [{ href: `${base}/automation`, label: 'Automation', icon: Settings2 }, { href: `${base}/team`, label: 'Team & access', icon: Users }] : []),
  ]
  const pageTitle = [...primaryLinks, ...insightLinks, ...manageLinks].find(({ href }) => href === base ? pathname === href : pathname.startsWith(href))?.label ?? 'CRM'

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200/50 text-base-content" data-theme="light">
      <input id={drawerId} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex min-h-screen min-w-0 flex-col">
        <header className="navbar flex justify-between sticky top-0 z-30 min-h-16 border-b border-base-300 bg-base-100/95 px-3 backdrop-blur sm:px-6">
          <div className="flex-none lg:hidden">
            <label htmlFor={drawerId} className="btn btn-ghost btn-square drawer-button" aria-label="Open CRM navigation"><Menu className="h-5 w-5" /></label>
          </div>
          <h1 className="truncate py-4 text-lg font-semibold">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-2">
            <Link href={`${base}/activities`} className="btn btn-ghost btn-square relative" aria-label="View activities and reminders">
              <Bell className="h-[18px] w-[18px]" />
              {liveCounts.activityCount > 0 && <span className="badge badge-error badge-xs absolute right-1 top-1" />}
            </Link>
            <Link href={`${base}/leads?new=1`} className="btn btn-primary btn-sm gap-2"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Add lead</span><span className="sm:hidden">Lead</span></Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 pb-8 sm:px-6 sm:py-7 xl:px-8">{children}</main>
      </div>

      {notice && <div role="status" aria-live="polite" className="alert alert-info fixed right-4 top-20 z-[90] w-[min(24rem,calc(100vw-2rem))] border border-info/20 bg-base-100 text-sm shadow-xl"><Bell className="h-4 w-4 shrink-0 text-info" /><span>{notice}</span><button type="button" className="btn btn-ghost btn-xs" onClick={() => setNotice('')}>Dismiss</button></div>}

      <div className="drawer-side z-40 lg:w-[76px] lg:overflow-visible">
        <label htmlFor={drawerId} aria-label="Close CRM navigation" className="drawer-overlay" />
        <aside onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={`flex min-h-full flex-col border-r border-white/10 bg-neutral text-neutral-content shadow-xl transition-[width] duration-200 ${expanded ? 'w-72' : 'w-72 lg:w-[76px]'}`}>
          <div className={`relative flex h-[76px] shrink-0 items-center border-b border-white/10 ${expanded ? 'gap-3 px-4' : 'justify-center px-2'}`}>
            <Link href={base} title={!expanded ? 'Sales CRM' : undefined} className={`flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${expanded ? 'flex-1' : ''}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5"><img src="/logonew.png" alt="" className="h-full w-full object-contain" /></span>
              <span className={`min-w-0 ${expanded ? '' : 'lg:hidden'}`}><span className="block whitespace-nowrap text-base font-bold tracking-tight text-white">Sales CRM</span><span className="block whitespace-nowrap text-xs text-neutral-content/60">Lead management</span></span>
            </Link>
          </div>
          <nav aria-label="CRM navigation" className="flex flex-1 flex-col justify-start gap-3 overflow-y-auto py-4">
            <div><div className={`menu-title px-5 pb-1 pt-1 text-neutral-content/45 ${expanded ? '' : 'lg:hidden'}`}>Workspace</div><NavLinks links={primaryLinks} /></div>
            <div><div className={`menu-title px-5 pb-1 pt-1 text-neutral-content/45 ${expanded ? '' : 'lg:hidden'}`}>Insights</div><NavLinks links={insightLinks} /></div>
            {manageLinks.length > 0 && <div><div className={`menu-title px-5 pb-1 pt-1 text-neutral-content/45 ${expanded ? '' : 'lg:hidden'}`}>Manage</div><ul className="menu menu-sm gap-1 px-2">
              {manageLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href)
                return <li key={href}><Link href={href} title={!expanded ? label : undefined} aria-label={!expanded ? label : undefined} aria-current={active ? 'page' : undefined} onClick={() => { const input = document.getElementById(drawerId) as HTMLInputElement | null; if (input) input.checked = false }} className={`${active ? 'menu-active bg-white/10 font-semibold text-white' : 'text-neutral-content/70 hover:bg-white/5 hover:text-white'} min-h-10 gap-3 rounded-xl ${expanded ? '' : 'lg:justify-center lg:px-0'}`}><Icon className="h-[18px] w-[18px] shrink-0" /><span className={`${expanded ? '' : 'lg:hidden'}`}>{label}</span></Link></li>
              })}
            </ul></div>}
          </nav>
          {isSuperAdmin && <div className="border-t border-white/10 px-3 py-2"><Link href="/dashboard" title={!expanded ? 'School dashboard' : undefined} className={`btn btn-ghost btn-sm w-full gap-3 text-neutral-content/70 hover:bg-white/10 hover:text-white ${expanded ? 'justify-start' : 'lg:justify-center lg:px-0'}`}><Home className="h-4 w-4 shrink-0" />{expanded && <span>School dashboard</span>}</Link></div>}
          <div className="border-t border-white/10 p-3">
            <div className={`flex min-h-12 min-w-0 items-center ${expanded ? 'gap-2.5' : 'justify-center'}`}>
              <div className="avatar placeholder shrink-0"><div className="relative w-10 rounded-full bg-primary text-primary-content ring-1 ring-white/15"><span className="text-xs font-bold">{initials}</span>{avatarUrl && <img src={avatarUrl} alt={`${name || email || 'User'} profile`} className="absolute inset-0 h-full w-full rounded-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none' }} />}</div></div>
              <div className={`min-w-0 flex-1 ${expanded ? '' : 'lg:hidden'}`}><div className="truncate text-sm font-semibold leading-5 text-white" title={name || email}>{name || email || 'CRM member'}</div><div className="mt-0.5 truncate text-xs text-neutral-content/60">{roleLabel}</div></div>
              <button onClick={signOut} className={`btn btn-ghost btn-square btn-sm shrink-0 self-center text-neutral-content hover:bg-white/10 hover:text-white ${expanded ? '' : 'lg:hidden'}`} aria-label="Sign out" title="Sign out"><LogOut className="h-4 w-4" /></button>
            </div>
          </div>
        </aside>
      </div>
      {notice && <div role="status" aria-live="polite" className="alert alert-info fixed right-4 top-20 z-[90] w-[min(24rem,calc(100vw-2rem))] border border-info/20 bg-base-100 text-sm shadow-xl"><Bell className="h-4 w-4 shrink-0 text-info" /><span>{notice}</span><button type="button" className="btn btn-ghost btn-xs" onClick={() => setNotice('')}>Dismiss</button></div>}
    </div>
  )
}
