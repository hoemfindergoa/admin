'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, Send } from 'lucide-react'
import { sendTeamMessage } from '@/app/crm/[workspaceId]/chat/actions'
import { toast } from 'sonner'

type Contact = { userId: string; name: string; email: string; role: string; isAdmin: boolean; unreadCount: number }
type Message = { id: string; sender_user_id: string; body: string; created_at: string }

export function CrmTeamChat({
  workspaceId,
  data,
}: {
  workspaceId: string
  data: { currentUserId: string; contacts: Contact[]; selectedPeerId: string | null; messages: Message[] }
}) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [showContacts, setShowContacts] = useState(!data.selectedPeerId)
  const [pending, startTransition] = useTransition()
  const endRef = useRef<HTMLDivElement>(null)
  const base = `/crm/${workspaceId}/chat`
  const selected = data.contacts.find((contact) => contact.userId === data.selectedPeerId)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [data.messages.length, data.selectedPeerId])

  useEffect(() => {
    const refresh = window.setInterval(() => router.refresh(), 12000)
    return () => window.clearInterval(refresh)
  }, [router, data.selectedPeerId])

  function selectContact(userId: string) {
    setShowContacts(false)
    router.push(`${base}?with=${encodeURIComponent(userId)}`)
  }

  function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || !body.trim()) return
    const message = body.trim()
    setError('')
    startTransition(async () => {
      try {
        await sendTeamMessage(workspaceId, selected.userId, message)
        toast.success('Message sent.')
        setBody('')
        router.refresh()
      } catch (cause) {
        toast.error(cause instanceof Error ? cause.message : 'Could not send message.')
        setError(cause instanceof Error ? cause.message : 'Could not send your message.')
      }
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">Workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-base-content">Team chat</h1>
        <p className="mt-1 text-sm text-base-content/60">Quick, private conversations with your CRM team.</p>
      </div>
      <section className="card card-border h-[min(70vh,760px)] min-h-[480px] overflow-hidden bg-base-100 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={`border-b border-base-300 bg-base-100 lg:border-b-0 lg:border-r ${showContacts ? 'block' : 'hidden lg:block'}`}>
          <div className="border-b border-base-300 px-4 py-4">
            <h2 className="text-sm font-semibold">Conversations</h2>
            <p className="mt-1 text-xs text-base-content/55">{data.contacts.length} available</p>
          </div>
          {data.contacts.length ? <ul className="menu menu-sm max-h-[180px] gap-1 overflow-y-auto p-2 lg:max-h-[calc(70vh-88px)]">
            {data.contacts.map((contact) => <li key={contact.userId}>
              <button type="button" onClick={() => selectContact(contact.userId)} className={`min-h-[58px] gap-3 rounded-xl text-left ${data.selectedPeerId === contact.userId ? 'menu-active' : ''}`}>
                <span className="avatar placeholder"><span className="w-9 rounded-full bg-primary/10 text-xs font-bold text-primary">{contact.name.slice(0, 2).toUpperCase()}</span></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{contact.name}</span><span className="block truncate text-[11px] font-normal text-base-content/55">{contact.role.toLowerCase().replaceAll('_', ' ')}</span></span>
                {contact.unreadCount > 0 && <span className="badge badge-primary badge-sm">{contact.unreadCount}</span>}
              </button>
            </li>)}
          </ul> : <div className="px-4 py-8 text-center"><MessageCircle className="mx-auto mb-2 h-5 w-5 text-base-content/35" /><p className="text-sm font-medium">No contacts available</p><p className="mt-1 text-xs leading-5 text-base-content/55">Ask a CRM admin to join this workspace so you can start a conversation.</p></div>}
        </aside>

        <div className={`min-h-0 flex-col ${showContacts ? 'hidden lg:flex' : 'flex'}`}>
          {selected ? <>
            <header className="flex min-h-[68px] items-center gap-3 border-b border-base-300 px-4 sm:px-6">
              <button type="button" onClick={() => setShowContacts(true)} className="btn btn-ghost btn-square btn-sm lg:hidden" aria-label="Back to conversations"><ArrowLeft className="h-4 w-4" /></button>
              <span className="avatar placeholder"><span className="w-9 rounded-full bg-primary/10 text-xs font-bold text-primary">{selected.name.slice(0, 2).toUpperCase()}</span></span>
              <div className="min-w-0"><h2 className="truncate text-sm font-semibold">{selected.name}</h2><p className="text-xs capitalize text-base-content/55">{selected.role.toLowerCase().replaceAll('_', ' ')}</p></div>
              <span className="badge badge-success badge-soft ml-auto">Workspace chat</span>
            </header>
            <div className="flex-1 space-y-4 overflow-y-auto bg-base-200/40 px-4 py-5 sm:px-6">
              {data.messages.length ? data.messages.map((message) => {
                const mine = message.sender_user_id === data.currentUserId
                return <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <article className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[72%] ${mine ? 'rounded-br-md bg-primary text-primary-content' : 'rounded-bl-md border border-base-300 bg-base-100 text-base-content'}`}>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>
                    <time className={`mt-1.5 block text-right text-[10px] ${mine ? 'text-primary-content/70' : 'text-base-content/45'}`} dateTime={message.created_at}>{new Date(message.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</time>
                  </article>
                </div>
              }) : <div className="grid h-full place-items-center text-center"><div><MessageCircle className="mx-auto mb-2 h-7 w-7 text-base-content/30" /><p className="text-sm font-medium text-base-content/70">Start the conversation</p><p className="mt-1 text-xs text-base-content/50">Send a message to {selected.name}.</p></div></div>}
              <div ref={endRef} />
            </div>
            <div className="border-t border-base-300 bg-base-100 p-3 sm:p-4">
              {error && <p role="alert" className="mb-2 rounded-lg bg-error/10 px-3 py-2 text-xs font-medium text-error">{error}</p>}
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <label className="min-w-0 flex-1"><span className="sr-only">Write a message</span><textarea className="textarea min-h-12 max-h-32 w-full resize-y border-base-300 bg-base-100 text-sm focus:border-primary" value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} rows={1} placeholder="Write a message…" /></label>
                <button type="submit" disabled={pending || !body.trim()} className="btn btn-primary min-h-12 gap-2"><Send className="h-4 w-4" /><span className="hidden sm:inline">{pending ? 'Sending…' : 'Send'}</span></button>
              </form>
              <p className="mt-2 text-[10px] text-base-content/45">Messages refresh automatically every 12 seconds.</p>
            </div>
          </> : <div className="hidden flex-1 items-center justify-center text-center text-sm text-base-content/55 lg:flex">Select a conversation to begin.</div>}
        </div>
      </section>
    </div>
  )
}
