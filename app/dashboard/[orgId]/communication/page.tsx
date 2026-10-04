import { getCommunicationWorkspace } from './actions'
import { CommunicationWorkspace } from '@/components/communication-workspace'

export default async function CommunicationPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const data = await getCommunicationWorkspace(orgId)
  return <CommunicationWorkspace orgId={orgId} {...data} />
}
