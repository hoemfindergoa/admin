import { FeeWorkspace } from '@/components/fee-workspace'
import { getFinanceWorkspace } from '../finance/actions'

export default async function FeesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const data = await getFinanceWorkspace(orgId, 'fees')
  return <FeeWorkspace orgId={orgId} {...data} />
}
