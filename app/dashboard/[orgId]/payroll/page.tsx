import { PayrollWorkspace } from '@/components/payroll-workspace'
import { getPayrollData } from './actions'

export default async function PayrollPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  
  // Fetch real data from the database via action
  const data = await getPayrollData(orgId)

  return <PayrollWorkspace orgId={orgId} data={data} />
}
