'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MessageSquare, Send, Search, User, UserCircle } from 'lucide-react'
import { getStudentMessages, sendMessage } from '@/app/dashboard/[orgId]/communication/actions'

export function CommunicationWorkspace({ orgId, students, parents, teachers, currentUserId }: any) {
  const [pending, startTransition] = useTransition()
  const [sending, setSending] = useState(false)
  
  const [search, setSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  
  const [messages, setMessages] = useState<any[]>([])
  const [messageBody, setMessageBody] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredStudents = students.filter((s: any) => 
    s.student_name.toLowerCase().includes(search.toLowerCase()) || 
    (s.admission_number || '').toLowerCase().includes(search.toLowerCase())
  )

  const selectedStudent = students.find((s: any) => s.id === selectedStudentId)
  const studentParents = parents.filter((p: any) => p.student_id === selectedStudentId)

  // Fetch messages when student is selected
  useEffect(() => {
    if (!selectedStudentId) {
      setMessages([])
      return
    }
    startTransition(async () => {
      try {
        const msgs = await getStudentMessages(orgId, selectedStudentId)
        setMessages(msgs)
      } catch (error: any) {
        toast.error('Failed to load messages')
      }
    })
  }, [selectedStudentId, orgId])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!messageBody.trim() || !selectedStudentId) return
    if (studentParents.length === 0) {
      toast.error('This student has no parents attached.')
      return
    }

    // Default to first parent for simplicity if multiple exist
    const parentId = studentParents[0].parent_id
    
    setSending(true)
    try {
      // Find if current user is a teacher
      const isTeacher = teachers.find((t: any) => t.user_id === currentUserId)
      const teacherId = isTeacher ? isTeacher.id : null

      await sendMessage(orgId, selectedStudentId, parentId, teacherId, messageBody)
      setMessageBody('')
      
      // Reload messages
      const msgs = await getStudentMessages(orgId, selectedStudentId)
      setMessages(msgs)
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Communication</h1>
          <p className="mt-1 text-[14px] font-medium text-zinc-500">Chat with parents and guardians.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 flex-1 min-h-[600px]">
        {/* Left Sidebar: Student List */}
        <Card className="rounded-2xl border-zinc-200 shadow-sm overflow-hidden flex flex-col bg-white h-[600px]">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search students..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10 text-[13px] border-zinc-200 shadow-sm bg-white"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredStudents.length === 0 ? (
              <div className="p-6 text-center text-[13px] font-medium text-zinc-500">No students found.</div>
            ) : (
              filteredStudents.map((student: any) => {
                const isSelected = selectedStudentId === student.id
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      isSelected ? 'bg-blue-50 border border-blue-100 ring-1 ring-blue-200' : 'hover:bg-zinc-50 border border-transparent'
                    }`}
                  >
                    <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-[14px] ${
                      isSelected ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {student.student_name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className={`font-bold truncate text-[13px] ${isSelected ? 'text-blue-900' : 'text-zinc-900'}`}>
                        {student.student_name}
                      </div>
                      <div className="text-[11px] font-medium text-zinc-500 truncate mt-0.5">
                        {student.school_classes?.name} {student.school_sections?.name ? `(${student.school_sections.name})` : ''}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </Card>

        {/* Right Area: Chat Window */}
        <Card className="rounded-2xl border-zinc-200 shadow-sm overflow-hidden flex flex-col bg-white h-[600px]">
          {selectedStudentId ? (
            <>
              <div className="p-4 border-b border-zinc-100 bg-blue-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center ring-1 ring-blue-200 text-blue-700 font-bold">
                    {selectedStudent?.student_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-zinc-900 text-[14px]">{selectedStudent?.student_name}</h2>
                    <p className="text-[12px] font-medium text-zinc-500 mt-0.5">
                      {studentParents.length > 0 
                        ? `Parent: ${studentParents.map((p:any) => p.school_parents.name).join(', ')}` 
                        : <span className="text-rose-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> No parent linked</span>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/30">
                {pending ? (
                  <div className="flex justify-center py-8"><div className="h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /></div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <MessageSquare className="h-12 w-12 text-zinc-400 mb-4" />
                    <p className="text-[14px] font-bold text-zinc-900">No messages yet</p>
                    <p className="text-[13px] text-zinc-500 max-w-xs mt-1">Start the conversation by sending a message below.</p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isStaff = msg.sender_role === 'TEACHER'
                    return (
                      <div key={msg.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                          isStaff 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white border border-zinc-200 text-zinc-900 rounded-tl-none'
                        }`}>
                          <p className="text-[13px] whitespace-pre-wrap">{msg.body}</p>
                          <div className={`text-[10px] mt-2 font-medium ${isStaff ? 'text-blue-100 text-right' : 'text-zinc-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-zinc-100 bg-white shrink-0">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-end gap-3"
                >
                  <div className="flex-1">
                    <Input
                      disabled={sending || studentParents.length === 0}
                      placeholder={studentParents.length === 0 ? "Cannot send message (no parent linked)" : "Type a message..."}
                      value={messageBody}
                      onChange={e => setMessageBody(e.target.value)}
                      className="min-h-[44px] text-[13px] rounded-xl border-zinc-200 shadow-sm"
                    />
                  </div>
                  <Button 
                    type="submit"
                    disabled={!messageBody.trim() || sending || studentParents.length === 0} 
                    className="h-[44px] w-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 p-0 flex items-center justify-center"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 p-6">
              <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-[15px] font-bold text-zinc-900">Select a conversation</h3>
              <p className="text-[13px] text-zinc-500 max-w-sm mt-1">Choose a student from the sidebar to view or send messages to their parents.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}
