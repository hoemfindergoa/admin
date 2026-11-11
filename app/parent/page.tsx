import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ArrowRight, School } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import AuthButton from '@/components/AuthButton'
import { createAdminClient } from '@/utils/supabase/admin'

export default async function ParentPortalPicker() {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: parents, error } = await supabase.from('school_parents').select('id, org_id, name').eq('user_id', user.id).eq('status', 'ACTIVE')
  if (error || !parents?.length) redirect('/login?message=Parent+portal+access+not+found')
  const orgIds = [...new Set(parents.map((parent) => parent.org_id))]
  if (orgIds.length === 1) redirect(`/parent/${orgIds[0]}`)
  const { data: orgs } = await createAdminClient().from('organizations').select('id, name, logo_url').in('id', orgIds)
  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl space-y-6 px-4 py-12">
      <header className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Family portal</p><h1 className="mt-1 text-3xl font-bold">Choose a school</h1><p className="mt-2 text-sm text-base-content/70">Open the school space linked to your family account.</p></div><AuthButton /></header>
      <div className="grid gap-3 sm:grid-cols-2">{(orgs ?? []).map((org) => <Link key={org.id} href={`/parent/${org.id}`} className="card card-border bg-base-100 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><div className="card-body flex-row items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">{org.logo_url ? <img src={org.logo_url} alt="" className="h-9 w-9 rounded-lg object-contain" /> : <School className="h-5 w-5" />}</span><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{org.name}</span><span className="text-sm text-base-content/65">Parent portal</span></span><ArrowRight className="h-4 w-4" /></div></Link>)}</div>
    </main>
  )
}
