"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Receipt,
  Banknote,
  Calendar,
  FileText,
  Bus,
  Building,
  Settings,
  ChevronRight,
  ArrowLeft,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Maps nav items to permission IDs from organization_users.permissions[]
// `permissionKey: null` means the item is always visible (no permission required)
const ALL_NAV_ITEMS = [
  { name: 'Dashboard',       href: (id: string) => `/dashboard/${id}`,             icon: LayoutDashboard, permissionKey: null, color: 'text-indigo-600' },
  { name: 'Manage School',   href: (id: string) => `/dashboard/${id}/school`,       icon: School,          permissionKey: 'manage_school', color: 'text-emerald-600' },
  { name: 'Admission',       href: (id: string) => `/dashboard/${id}/admission`,    icon: FileText,        permissionKey: 'students', color: 'text-amber-600' },
  { name: 'Students',        href: (id: string) => `/dashboard/${id}/students`,     icon: GraduationCap,   permissionKey: 'students', color: 'text-sky-600' },
  { name: 'Staff & Teachers',href: (id: string) => `/dashboard/${id}/staff`,        icon: Users,           permissionKey: 'manage_school', color: 'text-rose-600' },
  { name: 'User Management', href: (id: string) => `/dashboard/${id}/users`,        icon: Users,           permissionKey: 'manage_school', color: 'text-fuchsia-600' },
  { name: 'Attendance',      href: (id: string) => `/dashboard/${id}/attendance`,   icon: CalendarCheck,   permissionKey: 'attendance', color: 'text-teal-600' },
  { name: 'Fees',            href: (id: string) => `/dashboard/${id}/fees`,         icon: CreditCard,      permissionKey: 'fees', color: 'text-green-600' },
  { name: 'Communication',   href: (id: string) => `/dashboard/${id}/communication`,icon: MessageSquare,   permissionKey: 'communication', color: 'text-blue-600' },
  { name: 'Expenses',        href: (id: string) => `/dashboard/${id}/expenses`,     icon: Receipt,         permissionKey: 'expenses', color: 'text-orange-600' },
  { name: 'Payroll',         href: (id: string) => `/dashboard/${id}/payroll`,      icon: Banknote,        permissionKey: 'payroll', color: 'text-violet-600' },
  { name: 'Schedules',       href: (id: string) => `/dashboard/${id}/schedules`,    icon: Calendar,        permissionKey: 'schedules', color: 'text-cyan-600' },
  { name: 'Transport',       href: (id: string) => `/dashboard/${id}/transport`,    icon: Bus,             permissionKey: 'transport', color: 'text-yellow-600' },
  { name: 'Hostel',          href: (id: string) => `/dashboard/${id}/hostel`,       icon: Building,        permissionKey: 'hostel', color: 'text-pink-600' },
  { name: 'Student Kits',    href: (id: string) => `/dashboard/${id}/student-kits`, icon: Package,         permissionKey: 'manage_school', color: 'text-lime-600' },
  { name: 'Settings',        href: (id: string) => `/dashboard/${id}/settings`,     icon: Settings,        permissionKey: 'settings', color: 'text-zinc-600' },
]

interface DashboardSidebarProps {
  orgId: string
  /** null = owner (show everything); string[] = staff (show only matching items) */
  permissions: string[] | null
  isOwner: boolean
}

export function DashboardSidebar({ orgId, permissions, isOwner }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  // Filter nav items based on role
  const navigation = ALL_NAV_ITEMS.filter((item) => {
    if (permissions === null) return true           // owner → show all
    if (item.permissionKey === null) return true    // always visible (Dashboard)
    return permissions.includes(item.permissionKey) // staff → permission check
  }).map((item) => ({
    ...item,
    href: item.href(orgId),
  }))

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
            {isOwner ? 'Franchise Admin' : 'Staff Portal'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5 overflow-x-hidden no-scrollbar">
        <nav className="grid gap-1.5 px-3">
          {/* Back link — only for owners who can switch orgs */}
          {isOwner && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className={cn(
                "whitespace-nowrap transition-opacity duration-300",
                isExpanded ? "opacity-100" : "opacity-0"
              )}>
                All Franchises
              </span>
            </Link>
          )}

          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all relative overflow-hidden group/item",
                  isActive
                    ? "bg-indigo-50/80 text-indigo-700 shadow-sm ring-1 ring-indigo-200/50"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                )}
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
                {isActive && isExpanded && (
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
