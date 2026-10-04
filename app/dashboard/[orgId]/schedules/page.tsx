import { SchedulesWorkspace } from '@/components/schedules-workspace'
import { getSchedulesWorkspace } from './actions'

export default async function SchedulesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const data = await getSchedulesWorkspace(orgId)
  return <SchedulesWorkspace orgId={orgId} {...data} />
}
