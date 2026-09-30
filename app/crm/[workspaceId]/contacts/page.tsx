import { getCrmData } from '../actions'
import { ContactsPage } from './contacts-page'
export default async function ContactsRoute({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params
  const data = await getCrmData(workspaceId)
  return <ContactsPage workspaceId={workspaceId} contacts={data.contacts} accounts={data.accounts} />
}
