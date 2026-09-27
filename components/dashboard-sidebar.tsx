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
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Maps nav items to permission IDs from organization_users.permissions[]
// `permissionKey: null` means the item is always visible (no permission required)
const ALL_NAV_ITEMS = [
  { name: 'Dashboard',       href: (id: string) => `/dashboard/${id}`,             icon: LayoutDashboard, permissionKey: null },
  { name: 'Manage School',   href: (id: string) => `/dashboard/${id}/school`,       icon: School,          permissionKey: 'manage_school' },
  { name: 'Admission',       href: (id: string) => `/dashboard/${id}/admission`,    icon: FileText,        permissionKey: 'students' },
  { name: 'Students',        href: (id: string) => `/dashboard/${id}/students`,     icon: GraduationCap,   permissionKey: 'students' },
  { name: 'Staff & Teachers',href: (id: string) => `/dashboard/${id}/staff`,        icon: Users,           permissionKey: 'manage_school' },
  { name: 'User Management', href: (id: string) => `/dashboard/${id}/users`,        icon: Users,           permissionKey: 'manage_school' },
  { name: 'Attendance',      href: (id: string) => `/dashboard/${id}/attendance`,   icon: CalendarCheck,   permissionKey: 'attendance' },
  { name: 'Fees',            href: (id: string) => `/dashboard/${id}/fees`,         icon: CreditCard,      permissionKey: 'fees' },
  { name: 'Communication',   href: (id: string) => `/dashboard/${id}/communication`,icon: MessageSquare,   permissionKey: 'communication' },
  { name: 'Expenses',        href: (id: string) => `/dashboard/${id}/expenses`,     icon: Receipt,         permissionKey: 'expenses' },
  { name: 'Payroll',         href: (id: string) => `/dashboard/${id}/payroll`,      icon: Banknote,        permissionKey: 'payroll' },
  { name: 'Schedules',       href: (id: string) => `/dashboard/${id}/schedules`,    icon: Calendar,        permissionKey: 'schedules' },
  { name: 'Transport',       href: (id: string) => `/dashboard/${id}/transport`,    icon: Bus,             permissionKey: 'transport' },
  { name: 'Hostel',          href: (id: string) => `/dashboard/${id}/hostel`,       icon: Building,        permissionKey: 'hostel' },
  { name: 'Settings',        href: (id: string) => `/dashboard/${id}/settings`,     icon: Settings,        permissionKey: 'settings' },
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
        "group flex flex-col border-r bg-background transition-all duration-300 ease-in-out h-screen sticky top-0 z-50",
        isExpanded ? "w-64" : "w-[68px]"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex h-14 items-center border-b px-4 shrink-0 overflow-hidden justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-white shrink-0">
            <School className="h-5 w-5" />
          </div>
          <span className={cn(
            "font-semibold whitespace-nowrap transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0"
          )}>
            {isOwner ? 'Franchise Admin' : 'Staff Portal'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden no-scrollbar">
        <nav className="grid gap-1 px-3">
          {/* Back link — only for owners who can switch orgs */}
          {isOwner && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-secondary/50 mb-4"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className={cn(
                "whitespace-nowrap transition-opacity duration-300",
                isExpanded ? "opacity-100" : "opacity-0"
              )}>
                Back to All Franchises
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
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative overflow-hidden",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-primary"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className={cn(
                  "whitespace-nowrap transition-opacity duration-300",
                  isExpanded ? "opacity-100" : "opacity-0"
                )}>
                  {item.name}
                </span>
                {isActive && isExpanded && (
                  <ChevronRight className="h-4 w-4 absolute right-2 opacity-50" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
