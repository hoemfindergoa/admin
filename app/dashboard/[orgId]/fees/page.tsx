import { FinancialWorkspace } from '@/components/financial-workspace'
import { getFinanceWorkspace } from '../finance/actions'

export default async function FeesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const data = await getFinanceWorkspace(orgId, 'fees')
  return <FinancialWorkspace orgId={orgId} kind="fees" {...data} />
}
