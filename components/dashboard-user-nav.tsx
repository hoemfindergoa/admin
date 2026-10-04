'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from "next/navigation"
import { LogOut, User as UserIcon, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'

export function DashboardUserNav({ email, avatarUrl, showCrmButton }: { email?: string, avatarUrl?: string, showCrmButton?: boolean }) {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 ring-2 ring-white shadow-sm overflow-hidden p-0">
          <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-indigo-700 font-semibold text-[15px]">
            {email ? email.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-1 shadow-md border-zinc-200">
        <DropdownMenuLabel className="font-normal py-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-zinc-900">Account</p>
            <p className="text-xs leading-none text-zinc-500 mt-1 truncate">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showCrmButton && (
          <>
            <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium">
              <Link href="/crm" className="flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-zinc-500" />
                Sales CRM
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem className="cursor-pointer text-sm font-medium">Profile Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 cursor-pointer font-medium focus:text-red-700 focus:bg-red-50" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
