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
}

interface DashboardTopNavProps {
  orgId: string
  orgName?: string
  allOrgs?: OrgOption[]
}

export function DashboardTopNav({ orgId, orgName = "Franchise", allOrgs = [] }: DashboardTopNavProps) {
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
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6 shrink-0">
      <div className="flex flex-1 items-center gap-4">
        {/* ── Franchise Switcher ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed max-w-[260px]">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-medium text-sm truncate hidden sm:inline-block">{orgName}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">{o.name}</span>
                    </div>
                    {isCurrent && <Check className="h-4 w-4 shrink-0 text-primary" />}
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

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm hidden sm:inline-block">2025-2026</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>2025-2026</DropdownMenuItem>
            <DropdownMenuItem>2026-2027</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary">
              <User className="h-4 w-4 text-secondary-foreground" />
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
