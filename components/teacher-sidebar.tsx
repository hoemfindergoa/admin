"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CalendarCheck,
  ChevronRight,
  ArrowLeft,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { name: 'Dashboard',       href: (id: string) => `/teacher/${id}`,             icon: LayoutDashboard, color: 'text-indigo-600' },
  { name: 'My Classes',      href: (id: string) => `/teacher/${id}/classes`,     icon: BookOpen,        color: 'text-emerald-600' },
  { name: 'Attendance',      href: (id: string) => `/teacher/${id}/attendance`,  icon: CalendarCheck,   color: 'text-teal-600' },
  { name: 'Communication',   href: (id: string) => `/teacher/${id}/communication`,icon: MessageSquare,   color: 'text-blue-600' },
]

export function TeacherSidebar({ orgId }: { orgId: string }) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={cn(
        "group flex flex-col border-r border-zinc-200/80 bg-white transition-all duration-300 ease-in-out h-screen sticky top-0 z-30 shrink-0 shadow-sm",
        isExpanded ? "w-[240px]" : "w-[72px]"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex h-14 items-center border-b border-zinc-200/80 px-4 shrink-0 overflow-hidden justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-zinc-200/80 shadow-sm shrink-0 overflow-hidden">
            <img src="/logonew.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <span className={cn(
            "font-bold text-[14px] text-zinc-900 whitespace-nowrap transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0"
          )}>
            Teacher Portal
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5 overflow-x-hidden no-scrollbar">
        <nav className="grid gap-1.5 px-3">
          {NAV_ITEMS.map((item) => {
            const href = item.href(orgId)
            const isActive = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={item.name}
                href={href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group/item overflow-hidden",
                  isActive
                    ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center transition-transform duration-200",
                  isActive ? "text-white" : item.color,
                  !isActive && "group-hover/item:scale-110"
                )}>
                  <item.icon className="h-4 w-4 shrink-0" />
                </div>
                
                <span className={cn(
                  "whitespace-nowrap transition-opacity duration-300",
                  isExpanded ? "opacity-100" : "opacity-0"
                )}>
                  {item.name}
                </span>

                {isActive && (
                  <div className="absolute inset-y-1 left-1 w-1 rounded-full bg-white/20" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-200/80 overflow-hidden mt-auto shrink-0">
        <div className={cn(
          "flex items-center gap-3 px-1",
          !isExpanded && "justify-center"
        )}>
          <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
            <Users className="h-4 w-4 text-zinc-500" />
          </div>
          <div className={cn(
            "flex flex-col min-w-0 transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0"
          )}>
            <span className="text-[13px] font-medium text-zinc-900 truncate">Teacher</span>
            <span className="text-[11px] text-zinc-500 truncate">Account</span>
          </div>
        </div>
      </div>
    </div>
  )
}
