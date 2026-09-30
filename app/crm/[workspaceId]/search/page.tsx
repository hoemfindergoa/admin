import { getCrmData } from '../actions'
import { CrmSearchResults } from '@/components/crm-search-results'
export default async function SearchPage({ params, searchParams }: { params: Promise<{ workspaceId: string }>; searchParams: Promise<{ q?: string }> | { q?: string } }) {
  const [{ workspaceId }, { q }] = await Promise.all([params, searchParams])
  const data = await getCrmData(workspaceId)
  return <CrmSearchResults data={data} query={q ?? ''} />
}
