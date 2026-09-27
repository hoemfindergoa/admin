import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { inviteUser } from "../actions"
import { redirect } from "next/navigation"
import Link from "next/link"

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
  { id: 'settings', label: 'Settings' }
]

export default async function InviteUserPage({
  params
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

  async function handleInvite(formData: FormData) {
    'use server'
    // Extract selected permissions
    const selectedPermissions = PERMISSIONS_LIST
      .map(p => p.id)
      .filter(id => formData.get(`permission_${id}`) === 'on')

    await inviteUser(orgId, formData, selectedPermissions)
    redirect(`/dashboard/${orgId}/users`)
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Invite Staff Member</CardTitle>
          <CardDescription>
            Send an invitation to join this franchise. Assign granular access permissions based on their role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleInvite} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+1 234 567 890" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" required placeholder="john@example.com" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Access Permissions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select which sidebar modules this user can view and manage.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
                {PERMISSIONS_LIST.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`permission_${permission.id}`}
                      name={`permission_${permission.id}`}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={`permission_${permission.id}`} className="font-normal cursor-pointer">
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-6 gap-4 border-t">
              <Link href={`/dashboard/${orgId}/users`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">
                Send Invitation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
