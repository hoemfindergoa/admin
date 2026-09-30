import { getCrmData } from '../actions'
import { CrmReports } from '@/components/crm-reports'
export default async function ReportsPage({ params }: { params: Promise<{ workspaceId: string }> }) { const { workspaceId } = await params; const data = await getCrmData(workspaceId); return <CrmReports data={data} /> }
