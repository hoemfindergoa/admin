import { SchoolManager } from '@/components/school-manager'
import { getSchoolData } from './actions'

export default async function ManageSchoolPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const data = await getSchoolData(orgId)
  return <SchoolManager orgId={orgId} initialData={data} />
}
