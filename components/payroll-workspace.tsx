'use client'

import { useState } from 'react'
import { Banknote, FileText, Settings, Users, CheckCircle2, AlertCircle, Plus, Upload, Download, DollarSign, Building } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateStaffCompensation, updatePayrollSettings, runPayroll } from '@/app/dashboard/[orgId]/payroll/actions'
import { useTransition } from 'react'

export function PayrollWorkspace({ orgId, data }: { orgId: string, data: any }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [isStaffSheetOpen, setIsStaffSheetOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleRunPayroll = () => {
    startTransition(async () => {
      try {
        await runPayroll(orgId)
        toast.success('Payroll run completed successfully. Slips have been generated.')
      } catch (e: any) {
        toast.error(e.message)
      }
    })
  }

  const handleSyncBank = () => {
    toast.success('Bank integration synced successfully.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="mt-1 text-muted-foreground">Automated payroll, tax calculations, and bank integration.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSyncBank} disabled={isPending}>
            <Building className="mr-2 h-4 w-4" />
            Sync Bank
          </Button>
          <Button onClick={handleRunPayroll} disabled={isPending}>
            <Banknote className="mr-2 h-4 w-4" />
            Run Payroll
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff Salaries</TabsTrigger>
          <TabsTrigger value="runs">Pay Runs</TabsTrigger>
          <TabsTrigger value="taxes">Taxes & Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Payroll (Oct)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹1,16,500</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Next Run Date</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Oct 31, 2026</div>
                <p className="text-xs text-muted-foreground">Draft mode</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">All clear</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.staff.length}</div>
                <p className="text-xs text-muted-foreground">Registered on payroll</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Pay Runs</CardTitle>
              <CardDescription>A summary of your latest payroll cycles.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {data.payRuns.map((run: any) => (
                  <div key={run.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{run.month}</p>
                      <p className="text-sm text-muted-foreground">{run.date}</p>
                    </div>
                    <div className="ml-auto font-medium text-right">
                      <div className="mb-1">₹{run.totalAmount.toLocaleString()}</div>
                      <Badge variant={run.status === 'Paid' ? 'secondary' : 'outline'} className={run.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : ''}>
                        {run.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff Salaries & Compensation</CardTitle>
              <CardDescription>Manage base salaries, allowances, and deductions for your team.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-4 text-left font-medium">Employee</th>
                      <th className="p-4 text-left font-medium">Base Salary</th>
                      <th className="p-4 text-left font-medium">Allowances</th>
                      <th className="p-4 text-left font-medium">Deductions</th>
                      <th className="p-4 text-left font-medium">Net Salary</th>
                      <th className="p-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.staff.map((employee: any) => (
                      <tr key={employee.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">{employee.role}</div>
                        </td>
                        <td className="p-4">₹{employee.baseSalary.toLocaleString()}</td>
                        <td className="p-4 text-emerald-600">+₹{employee.allowances.toLocaleString()}</td>
                        <td className="p-4 text-rose-600">-₹{employee.deductions.toLocaleString()}</td>
                        <td className="p-4 font-semibold">₹{employee.netSalary.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedStaff(employee)
                            setIsStaffSheetOpen(true)
                          }}>
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs" className="space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>View past pay runs and download salary slips.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.payRuns.map((run: any) => (
                  <div key={run.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-semibold">{run.month} Payroll</h4>
                      <p className="text-sm text-muted-foreground">Processed on {run.date} · {data.staff.length} Employees</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold">₹{run.totalAmount.toLocaleString()}</div>
                        <Badge variant={run.status === 'Paid' ? 'secondary' : 'outline'}>{run.status}</Badge>
                      </div>
                      <Button variant="outline" size="sm" title="Download Reports">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-6">
          <Card>
            <form action={(formData) => {
              const pfPercentage = Number(formData.get('pfPercentage')) || 12
              const ptRule = String(formData.get('ptRule') || 'state')
              startTransition(async () => {
                try {
                  await updatePayrollSettings(orgId, { pfPercentage, ptRule })
                  toast.success('Settings saved successfully.')
                } catch (e: any) {
                  toast.error(e.message)
                }
              })
            }}>
              <CardHeader>
                <CardTitle>Tax & Statutory Settings</CardTitle>
                <CardDescription>Configure PF, TDS, Professional Tax and other compliance settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>PF Deduction Percentage</Label>
                    <Input defaultValue={data.settings?.pf_percentage || "12"} name="pfPercentage" type="number" step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <Label>Professional Tax Setup</Label>
                    <Select defaultValue={data.settings?.pt_rule || "state"} name="ptRule">
                      <SelectTrigger>
                        <SelectValue placeholder="Select rule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="state">State Default (Auto)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="none">Not Applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="mb-2 font-medium">Bank Integration</h4>
                  <p className="text-sm text-muted-foreground mb-4">Connect your corporate bank account for automated payouts and compliance payments.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" type="button">Connect Bank Account</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isPending}>Save Settings</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Staff Sheet */}
      <Sheet open={isStaffSheetOpen} onOpenChange={setIsStaffSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Compensation</SheetTitle>
            <SheetDescription>Update salary components for {selectedStaff?.name}.</SheetDescription>
          </SheetHeader>
          {selectedStaff && (
            <form action={(formData) => {
              const baseSalary = Number(formData.get('baseSalary')) || 0
              const allowances = Number(formData.get('allowances')) || 0
              const deductions = Number(formData.get('deductions')) || 0
              const bankAccount = String(formData.get('bankAccount') || '')
              const taxRegime = String(formData.get('taxRegime') || 'new')
              
              startTransition(async () => {
                try {
                  await updateStaffCompensation(orgId, selectedStaff.id, { baseSalary, allowances, deductions, bankAccount, taxRegime })
                  toast.success('Compensation updated successfully.')
                  setIsStaffSheetOpen(false)
                } catch (e: any) {
                  toast.error(e.message)
                }
              })
            }} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label>Base Salary (Monthly)</Label>
                <Input defaultValue={selectedStaff.baseSalary} name="baseSalary" type="number" />
              </div>
              <div className="space-y-2">
                <Label>Allowances (HRA, Travel, etc.)</Label>
                <Input defaultValue={selectedStaff.allowances} name="allowances" type="number" />
              </div>
              <div className="space-y-2">
                <Label>Deductions (PF, TDS, etc.)</Label>
                <Input defaultValue={selectedStaff.deductions} name="deductions" type="number" />
              </div>
              <div className="space-y-2">
                <Label>Bank Account Number</Label>
                <Input defaultValue={selectedStaff.bankAccount} name="bankAccount" type="text" />
              </div>
              <div className="space-y-2">
                <Label>Tax Regime</Label>
                <Select defaultValue={selectedStaff.taxRegime} name="taxRegime">
                  <SelectTrigger>
                    <SelectValue placeholder="Select regime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Tax Regime</SelectItem>
                    <SelectItem value="old">Old Tax Regime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" type="submit" disabled={isPending}>
                Save Changes
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
