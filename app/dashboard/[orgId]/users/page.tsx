import { getOrganizationUsers, getOrganizationUserContext, removeUser } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Shield, MoreHorizontal, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InviteUserSheet } from '@/components/invite-user-sheet'
import { EditUserPermissionsSheet } from '@/components/edit-user-permissions-sheet'

export default async function OrganizationUsersPage({
  params
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const [users, userContext] = await Promise.all([
    getOrganizationUsers(orgId),
    getOrganizationUserContext(orgId),
  ])
  const canManageUsers = userContext.canManageUsers

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage staff access and permissions for this franchise.
          </p>
        </div>
        {canManageUsers && <InviteUserSheet orgId={orgId} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>
            All active and pending staff invitations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mb-4 opacity-50" />
              <p>No staff members found.</p>
              <div className="mt-4">
                {canManageUsers && <InviteUserSheet
                  orgId={orgId}
                  trigger={
                    <Button variant="outline" size="sm">
                      Invite your first staff member
                    </Button>
                  }
                />}
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b bg-muted/50">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Permissions</th>
                      {canManageUsers && <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {users.map((user: any) => {
                      const isCurrentUser = user.user_id === userContext.userId || (
                        !!userContext.email && user.email?.toLowerCase() === userContext.email.toLowerCase()
                      )
                      return (
                      <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">{user.name}</td>
                        <td className="p-4 align-middle text-muted-foreground">{user.email}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            {user.role}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            user.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-muted-foreground text-xs">
                          {user.permissions && Array.isArray(user.permissions) 
                            ? user.permissions.join(', ')
                            : 'None'
                          }
                        </td>
                        {canManageUsers && <td className="p-4 align-middle text-right">
                          {!isCurrentUser && <>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <EditUserPermissionsSheet orgId={orgId} user={user} />
                              <DropdownMenuSeparator />
                              <form action={async () => {
                                'use server'
                                await removeUser(orgId, user.id)
                              }}>
                                <button type="submit" className="w-full text-left text-red-600 flex items-center px-2 py-1.5 text-sm">
                                  <Trash className="w-4 h-4 mr-2" />
                                  Remove User
                                </button>
                              </form>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          </>}
                        </td>}
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
