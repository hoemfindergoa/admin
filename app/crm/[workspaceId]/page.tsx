import { getCrmData } from './actions'
import { CrmHome } from '@/components/crm-home'

export default async function CrmWorkspaceHomePage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params
  const data = await getCrmData(workspaceId)
  return <CrmHome data={data} />
}
