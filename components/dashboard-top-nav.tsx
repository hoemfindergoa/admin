"use client"

import { Building2, Calendar, ChevronDown, User, LogOut, Check, LayoutGrid } from "lucide-react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface OrgOption {
  id: string
  name: string
  logo_url?: string | null
}

interface DashboardTopNavProps {
  orgId: string
  orgName?: string
  orgLogo?: string | null
  allOrgs?: OrgOption[]
  isSuperAdmin?: boolean
}

export function DashboardTopNav({ orgId, orgName = "Franchise", orgLogo = null, allOrgs = [], isSuperAdmin = false }: DashboardTopNavProps) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-zinc-200/80 bg-white/90 px-4 sm:px-6 shrink-0 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4">
        {/* ── Franchise Switcher ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2.5 border-zinc-200 bg-white hover:bg-zinc-50 hover:text-zinc-900 shadow-sm max-w-[260px] rounded-lg pl-2">
              {orgLogo ? (
                <img src={orgLogo} alt={orgName} className="h-5 w-5 shrink-0 rounded object-contain bg-zinc-50 border border-zinc-100" />
              ) : (
                <div className="h-5 w-5 shrink-0 rounded bg-zinc-100 flex items-center justify-center border border-zinc-200">
                  <Building2 className="h-3 w-3 text-zinc-500" />
                </div>
              )}
              <span className="font-semibold text-[13px] text-zinc-900 truncate hidden sm:inline-block">{orgName}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400 ml-1" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-[260px]">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal uppercase tracking-wider">
              Switch Franchise
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {allOrgs.length === 0 ? (
              <DropdownMenuItem disabled className="text-muted-foreground text-sm">
                No other franchises
              </DropdownMenuItem>
            ) : (
              allOrgs.map((o) => {
                const isCurrent = o.id === orgId
                return (
                  <DropdownMenuItem
                    key={o.id}
                    className={cn(
                      "flex items-center justify-between gap-2 cursor-pointer",
                      isCurrent && "bg-muted/60 font-medium"
                    )}
                    onClick={() => {
                      if (!isCurrent) router.push(`/dashboard/${o.id}`)
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {o.logo_url ? (
                        <img src={o.logo_url} alt={o.name} className="h-4 w-4 shrink-0 rounded object-contain" />
                      ) : (
                        <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate text-[13px] font-medium">{o.name}</span>
                    </div>
                    {isCurrent && <Check className="h-4 w-4 shrink-0 text-indigo-600" />}
                  </DropdownMenuItem>
                )
              })
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Manage Franchises
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3">
        {isSuperAdmin && (
          <Button asChild variant="outline" size="sm" className="h-8 text-[13px] font-medium border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors hidden sm:flex">
            <Link href="/crm">Sales CRM</Link>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 border-zinc-200 bg-white hover:bg-zinc-50 hover:text-zinc-900 shadow-sm rounded-lg px-2.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              <span className="font-semibold text-[12px] text-zinc-900 hidden sm:inline-block">2025-2026</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem className="text-[13px]">2025-2026</DropdownMenuItem>
            <DropdownMenuItem className="text-[13px]">2026-2027</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 ring-1 ring-white">
              <User className="h-4 w-4 text-zinc-600" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Global Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
