'use client'

import { FormEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, ShieldCheck, UserPlus, UserRoundX, Users } from 'lucide-react'
import { inviteCrmMember, removeCrmMember, updateCrmMemberRole } from '@/app/crm/[workspaceId]/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type CrmMember = { id: string; name: string; email: string; role: string; status: string; invited_by_email: string | null; created_at: string }

export function CrmMembersWorkspace({ members, workspaceId }: { members: CrmMember[], workspaceId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('')
    const form = event.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      try { const result = await inviteCrmMember(workspaceId, formData); form.reset(); setNotice(result.existingAccount ? 'A CRM setup link was sent to the existing account.' : 'CRM invitation sent.'); router.refresh() }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not invite this CRM user.') }
    })
  }

  function remove(member: CrmMember) {
    if (!window.confirm(`Remove ${member.name} from the sales CRM?`)) return
    startTransition(async () => { try { await removeCrmMember(workspaceId, member.id); setNotice(`${member.name} no longer has CRM access.`); router.refresh() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not remove this CRM member.') } })
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">People & permissions</p>
        <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-zinc-900">Team access</h1>
        <p className="mt-1 text-[13px] text-zinc-500">Invite sales teammates and choose which records they can manage.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-[12px] text-zinc-400">Active teammates</p>
          <p className="mt-1.5 text-2xl font-semibold text-zinc-900">{members.filter((m) => m.status === 'ACTIVE').length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-[12px] text-zinc-400">Sales managers</p>
          <p className="mt-1.5 text-2xl font-semibold text-zinc-900">{members.filter((m) => m.role === 'SALES_MANAGER').length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-[12px] text-zinc-400">Pending invites</p>
          <p className="mt-1.5 text-2xl font-semibold text-zinc-900">{members.filter((m) => m.status !== 'ACTIVE').length}</p>
        </div>
      </div>

      {error && <p role="alert" className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-[13px] text-zinc-700">{error}</p>}
      {notice && <p role="status" className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-[13px] text-zinc-600">{notice}</p>}

      <div className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-4">
          <p className="text-[13px] font-semibold text-zinc-900 flex items-center gap-2">
            <UserPlus className="h-3.5 w-3.5" /> Invite sales teammate
          </p>
          <p className="text-[12px] text-zinc-400">They receive an invitation email to set a password and join this CRM only.</p>
        </div>
        <div className="px-5 py-4">
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="member-name" className="text-[12px] text-zinc-600">Name</Label>
              <Input id="member-name" name="name" required placeholder="Teammate name" className="h-9 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-email" className="text-[12px] text-zinc-600">Work email</Label>
              <Input id="member-email" name="email" type="email" required placeholder="name@company.com" className="h-9 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-role" className="text-[12px] text-zinc-600">CRM role</Label>
              <select id="member-role" name="role" className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 focus:border-zinc-400 focus:outline-none">
                <option value="SALES_REP">Sales representative</option>
                <option value="SALES_MANAGER">Sales manager</option>
              </select>
            </div>
            <button disabled={pending} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-black px-3 text-[13px] font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50">
              <Mail className="h-3.5 w-3.5" />
              {pending ? 'Sending…' : 'Send invitation'}
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-4">
          <p className="text-[13px] font-semibold text-zinc-900 flex items-center gap-2">
            <Users className="h-3.5 w-3.5" /> CRM teammates
          </p>
          <p className="text-[12px] text-zinc-400">Sales reps work assigned prospects. Managers can see and assign team records.</p>
        </div>
        
        {members.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-zinc-500">No teammates invited yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Invited by</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-t border-zinc-100 hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-[13px] font-medium text-zinc-900">{member.name}</p>
                      <p className="text-[11px] text-zinc-400">{new Date(member.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-zinc-600">{member.email}</td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`Role for ${member.name}`}
                        value={member.role}
                        disabled={pending}
                        onChange={(event) => startTransition(async () => {
                          try { await updateCrmMemberRole(workspaceId, member.id, event.target.value); setNotice(`${member.name}'s role updated.`); router.refresh() }
                          catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update role.') }
                        })}
                        className="h-7 rounded-md border border-zinc-200 bg-white px-2 text-[11px] font-medium text-zinc-700 focus:outline-none"
                      >
                        <option value="SALES_REP">Sales representative</option>
                        <option value="SALES_MANAGER">Sales manager</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${
                        member.status === 'ACTIVE'
                          ? 'border-zinc-200 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-500'
                      }`}>
                        {member.status === 'ACTIVE' ? 'Active' : 'Invite pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-zinc-400">{member.invited_by_email || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        disabled={pending}
                        onClick={() => remove(member)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors disabled:opacity-50"
                      >
                        <UserRoundX className="h-3.5 w-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
        <div>
          <p className="text-[13px] font-medium text-zinc-900">Role access</p>
          <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed">
            Super admins control invitations and access. Sales managers can see and assign all sales records. Sales representatives see records assigned to them and unassigned prospects.
          </p>
        </div>
      </div>
    </div>
  )
}
