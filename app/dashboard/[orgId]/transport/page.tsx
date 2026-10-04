import { TransportWorkspace } from '@/components/transport-workspace'
import { getTransportWorkspace } from './actions'

export default async function TransportPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const data = await getTransportWorkspace(orgId)
  return <TransportWorkspace orgId={orgId} {...data} />
}
