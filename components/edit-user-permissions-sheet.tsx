'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { updateUserPermissions } from '@/app/dashboard/[orgId]/users/actions'

const PERMISSIONS = [
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

export function EditUserPermissionsSheet({
  orgId,
  user,
}: {
  orgId: string
  user: { id: string; name: string; permissions: string[] | null }
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(user.permissions ?? [])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      try {
        await updateUserPermissions(orgId, user.id, selected)
        setOpen(false)
        router.refresh()
      } catch (err: any) {
        setError(err?.message ?? 'Could not update permissions.')
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen)
      if (nextOpen) setSelected(user.permissions ?? [])
    }}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-2 py-1.5 font-normal">Edit Permissions</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Edit permissions</SheetTitle>
          <SheetDescription>Choose the modules {user.name} can access in this franchise.</SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-4">
          {PERMISSIONS.map((permission) => (
            <div key={permission.id} className="flex items-center gap-2">
              <input
                id={`permission-${user.id}-${permission.id}`}
                type="checkbox"
                checked={selected.includes(permission.id)}
                disabled={isPending}
                onChange={(event) => setSelected((current) => event.target.checked
                  ? [...current, permission.id]
                  : current.filter((id) => id !== permission.id))}
                className="h-4 w-4 accent-primary"
              />
              <Label htmlFor={`permission-${user.id}-${permission.id}`} className="cursor-pointer text-sm font-normal">{permission.label}</Label>
            </div>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <SheetFooter className="mt-6">
          <Button onClick={save} disabled={isPending} className="gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? 'Saving…' : 'Save permissions'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
