'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addContact, deleteContact } from './actions'
import { Users, Plus, Trash2, Phone, Mail, Building } from 'lucide-react'

export function ContactsPage({ workspaceId, contacts, accounts }: { workspaceId: string, contacts: any[], accounts: any[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setSuccess('')
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    if (!name) { setError('Contact name is required.'); return }

    startTransition(async () => {
      try {
        await addContact(workspaceId, formData)
        setSuccess('Contact created!')
        setShowForm(false)
        ;(e.target as HTMLFormElement).reset()
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to create contact.')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this contact?')) return
    startTransition(async () => {
      try {
        await deleteContact(workspaceId, id)
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to delete.')
      }
    })
  }

  const filtered = contacts.filter(c => 
    !search || 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-indigo-600">CRM</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Contacts</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{contacts.length} total contacts</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Contact
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">{success}</div>}

      {showForm && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
            <h2 className="text-[15px] font-bold text-zinc-900">New Contact</h2>
          </div>
          <form onSubmit={handleAdd} className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Name <span className="text-red-500">*</span></label>
                <input name="name" required placeholder="e.g. Jane Doe" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Title</label>
                <input name="title" placeholder="e.g. CEO" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Email</label>
                <input name="email" type="email" placeholder="jane@example.com" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Phone</label>
                <input name="phone" placeholder="+1 234 567 890" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="submit" disabled={pending} className="h-10 rounded-full bg-indigo-600 px-6 text-[14px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-all">{pending ? 'Saving...' : 'Save Contact'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="h-10 rounded-full border border-zinc-200 px-6 text-[14px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex">
        <input type="text" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-full max-w-sm rounded-full border border-zinc-200 bg-white px-4 text-[13px] shadow-sm" />
      </div>

      <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-zinc-500">
            <Users className="mb-3 h-10 w-10 text-zinc-200" />
            <p className="text-[15px] font-semibold text-zinc-700">No contacts found</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filtered.map(c => {
              const account = accounts.find(a => a.id === c.account_id)
              return (
                <div key={c.id} className="grid grid-cols-[1fr_auto] gap-4 px-6 py-4 hover:bg-zinc-50/50">
                  <div>
                    <p className="text-[15px] font-bold text-zinc-900">{c.name}</p>
                    <p className="text-[13px] text-zinc-500 mt-0.5">{c.title || 'No title'}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-zinc-500">
                      {account && <span className="flex items-center gap-1 font-medium text-zinc-700"><Building className="h-3 w-3" /> {account.name}</span>}
                      {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</span>}
                      {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(c.id)} disabled={pending} className="text-zinc-400 hover:text-red-500 self-start p-2"><Trash2 className="h-4 w-4" /></button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
