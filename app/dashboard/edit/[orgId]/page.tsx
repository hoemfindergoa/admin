import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getOrganizationById, updateOrganization } from "../../actions"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function EditOrganizationPage({
  params
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const org = await getOrganizationById(orgId)
  
  if (!org) {
    redirect('/dashboard')
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateOrganization(orgId, formData)
    redirect('/dashboard')
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Franchise Settings</CardTitle>
          <CardDescription>
            Update the details for {org.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Franchise Name</Label>
                <Input id="name" name="name" required defaultValue={org.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliation">Affiliation / Board</Label>
                <Input id="affiliation" name="affiliation" defaultValue={org.affiliation || ''} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course_type">Course Type</Label>
                <select 
                  id="course_type" 
                  name="course_type" 
                  defaultValue={org.course_type || 'Pre Primary'}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Pre Primary">Pre Primary</option>
                  <option value="Primary">Primary</option>
                  <option value="Middle School">Middle School</option>
                  <option value="Secondary School">Secondary School</option>
                  <option value="Senior Secondary School">Senior Secondary School</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_start_date">Session Start Date</Label>
                <Input type="date" id="session_start_date" name="session_start_date" defaultValue={org.session_start_date || ''} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_end_date">Session End Date</Label>
                <Input type="date" id="session_end_date" name="session_end_date" defaultValue={org.session_end_date || ''} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Official Email</Label>
                <Input type="email" id="email" name="email" defaultValue={org.email || ''} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Official Phone</Label>
                <Input type="tel" id="phone" name="phone" defaultValue={org.phone || ''} />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" defaultValue={org.address || ''} />
              </div>

            </div>

            <div className="flex justify-end pt-6 gap-4">
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
