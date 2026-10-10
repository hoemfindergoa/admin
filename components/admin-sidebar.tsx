"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  Wrench,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { name: 'Insights & Franchises', href: '/dashboard', icon: LayoutDashboard, color: 'text-indigo-600' },
  { name: 'Kit Orders', href: '/dashboard/student-kits', icon: Package, color: 'text-lime-600' },
  { name: 'Tools (Coming Soon)', href: '#', icon: Wrench, color: 'text-zinc-400', disabled: true },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={cn(
        "group flex flex-col border-r border-zinc-200/80 bg-white transition-all duration-300 ease-in-out h-screen sticky top-0 z-50 shadow-sm",
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
            Admin Portal
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5 overflow-x-hidden no-scrollbar">
        <nav className="grid gap-1.5 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.disabled ? '#' : item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all relative overflow-hidden group/item",
                  isActive
                    ? "bg-indigo-50/80 text-indigo-700 shadow-sm ring-1 ring-indigo-200/50"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                  item.disabled && "opacity-60 cursor-not-allowed hover:bg-transparent hover:text-zinc-500"
                )}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <item.icon className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-indigo-600" : cn(item.color, "opacity-80 group-hover/item:opacity-100")
                )} />
                <span className={cn(
                  "whitespace-nowrap transition-opacity duration-300",
                  isExpanded ? "opacity-100" : "opacity-0"
                )}>
                  {item.name}
                </span>
                {isActive && isExpanded && !item.disabled && (
                  <ChevronRight className="h-3.5 w-3.5 absolute right-3 opacity-60 text-indigo-600" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
