import { FinancialWorkspace } from '@/components/financial-workspace'
import { getFinanceWorkspace } from '../finance/actions'

export default async function ExpensesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const data = await getFinanceWorkspace(orgId, 'expenses')
  return <FinancialWorkspace orgId={orgId} kind="expenses" {...data} />
}
