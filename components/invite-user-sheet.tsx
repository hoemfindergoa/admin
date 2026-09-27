'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { inviteUser } from '@/app/dashboard/[orgId]/users/actions'

const PERMISSIONS_LIST = [
  { id: 'manage_school', label: 'Manage School' },
  { id: 'students', label: 'Students' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'fees', label: 'Fees' },
  { id: 'communication', label: 'Communication' },
  { id: 'expenses', label: 'Expense Manager' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'schedules', label: 'Schedules' },
  { id: 'transport', label: 'Transport' },
  { id: 'hostel', label: 'Hostel' },
  { id: 'settings', label: 'Settings' },
]

interface InviteUserSheetProps {
  orgId: string
  trigger?: React.ReactNode
}

export function InviteUserSheet({ orgId, trigger }: InviteUserSheetProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    const selectedPermissions = PERMISSIONS_LIST
      .map((p) => p.id)
      .filter((id) => formData.get(`permission_${id}`) === 'on')

    startTransition(async () => {
      try {
        await inviteUser(orgId, formData, selectedPermissions)
        setOpen(false)
        formRef.current?.reset()
        router.refresh()
      } catch (err: any) {
        setError(err?.message ?? 'Something went wrong. Please try again.')
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Invite User
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">Invite Staff Member</SheetTitle>
          <SheetDescription>
            Send an invitation to join this franchise. Assign granular access permissions based on their role.
          </SheetDescription>
        </SheetHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          {/* Name + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iu-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="iu-name"
                name="name"
                required
                placeholder="John Doe"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iu-phone">Phone Number</Label>
              <Input
                id="iu-phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="iu-email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="iu-email"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              disabled={isPending}
            />
          </div>

          {/* Permissions */}
          <div className="space-y-3 pt-2 border-t">
            <div>
              <h3 className="text-sm font-semibold">Access Permissions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select which modules this user can view and manage.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 bg-muted/30 p-4 rounded-lg border">
              {PERMISSIONS_LIST.map((permission) => (
                <div key={permission.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`iu-permission_${permission.id}`}
                    name={`permission_${permission.id}`}
                    disabled={isPending}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                  />
                  <Label
                    htmlFor={`iu-permission_${permission.id}`}
                    className="font-normal cursor-pointer text-sm"
                  >
                    {permission.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <SheetFooter className="pt-4 gap-3 flex-row justify-end border-t">
            <SheetClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? 'Sending…' : 'Send Invitation'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
