'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, Send, User, Search, Pencil, Loader2, Paperclip, X, FileText, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type UserOption = {
  id: string
  name: string
  email: string
  image: string | null
  accessProfileName: string | null
  departmentName: string | null
}
type OtherUser = { id: string; name: string; email: string; image: string | null }
type ConversationItem = {
  id: string
  updatedAt: string
  otherUser: OtherUser | null
  lastMessage: { id: string; content: string; createdAt: string; senderId: string; senderName: string } | null
  hasUnread?: boolean
}
type MessageAttachmentItem = {
  id: string
  fileUrl: string
  fileName: string
  mimeType: string | null
  fileSize: number | null
}
type MessageItem = {
  id: string
  content: string
  createdAt: string
  senderId: string
  sender: { id: string; name: string; email: string; image: string | null }
  attachments: MessageAttachmentItem[]
}

function relativeTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24 && d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatMessageTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
}

export default function MessengerPage() {
  const t = useTranslations('messenger')
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [users, setUsers] = useState<UserOption[]>([])
  const [newChatSheetOpen, setNewChatSheetOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [creatingChat, setCreatingChat] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [otherLastSeenAt, setOtherLastSeenAt] = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatScrollContainerRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messenger/conversations')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) setConversations(json.data)
      else setConversations([])
    } catch {
      setConversations([])
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true)
    setOtherLastSeenAt(null)
    try {
      const res = await fetch(`/api/messenger/conversations/${conversationId}/messages?limit=50`)
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        const list = json.data.map((m: MessageItem & { attachments?: MessageAttachmentItem[] }) => ({
          ...m,
          attachments: m.attachments ?? [],
        }))
        setMessages(list)
        setOtherLastSeenAt(json.otherLastSeenAt ?? null)
        const lastId = list.length > 0 ? list[list.length - 1].id : null
        if (lastId) {
          await fetch(`/api/messenger/conversations/${conversationId}/seen`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lastSeenMessageId: lastId }),
          }).catch(() => { })
        }
        fetchConversations()
      } else {
        setMessages([])
      }
    } catch {
      setMessages([])
      toast.error('Failed to load messages')
    } finally {
      setLoadingMessages(false)
    }
  }, [fetchConversations])

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([])
      return
    }
    fetchMessages(selectedConversation.id)
  }, [selectedConversation?.id, fetchMessages])

  // Poll conversation list so new messages / unread update without page refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/messenger/conversations')
        .then((r) => r.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setConversations(json.data)
          }
        })
        .catch(() => { })
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Poll for new messages when conversation is open (full list, less frequent)
  useEffect(() => {
    if (!selectedConversation) return
    const interval = setInterval(() => {
      fetch(`/api/messenger/conversations/${selectedConversation.id}/messages?limit=50`)
        .then((r) => r.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setMessages(json.data.map((m: MessageItem & { attachments?: MessageAttachmentItem[] }) => ({ ...m, attachments: m.attachments ?? [] })))
            setOtherLastSeenAt(json.otherLastSeenAt ?? null)
          }
        })
        .catch(() => { })
    }, 12000)
    return () => clearInterval(interval)
  }, [selectedConversation?.id])

  // Poll for "seen" status frequently so "Seen" indicator updates without page refresh
  useEffect(() => {
    if (!selectedConversation) return
    const pollSeen = () => {
      fetch(`/api/messenger/conversations/${selectedConversation.id}/seen`)
        .then((r) => r.json())
        .then((json) => {
          if (json?.success) {
            setOtherLastSeenAt(json.otherLastSeenAt ?? null)
          }
        })
        .catch(() => { })
    }
    pollSeen()
    const interval = setInterval(pollSeen, 2500)
    return () => clearInterval(interval)
  }, [selectedConversation?.id])

  // Scroll chat area to bottom when opening a conversation or when messages finish loading.
  // Defer scroll until after layout: double rAF + short timeout fallback so scrollHeight is correct.
  useEffect(() => {
    if (!selectedConversation) return
    if (loadingMessages) return
    const scrollToBottom = () => {
      const container = chatScrollContainerRef.current
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToBottom)
    })
    const t = setTimeout(scrollToBottom, 50)
    return () => {
      cancelAnimationFrame(raf1)
      clearTimeout(t)
    }
  }, [selectedConversation?.id, messages, loadingMessages])

  // Focus message input when a conversation is selected so user can type immediately
  useEffect(() => {
    if (!selectedConversation) return
    const t = setTimeout(() => messageInputRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [selectedConversation?.id])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/messenger/users')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) setUsers(json.data)
      else setUsers([])
    } catch {
      setUsers([])
    }
  }, [])

  useEffect(() => {
    if (newChatSheetOpen) fetchUsers()
  }, [newChatSheetOpen, fetchUsers])

  const filteredConversations = useMemo(() => {
    if (!listSearch.trim()) return conversations
    const q = listSearch.trim().toLowerCase()
    return conversations.filter((c) => {
      const name = c.otherUser?.name?.toLowerCase() ?? ''
      const email = c.otherUser?.email?.toLowerCase() ?? ''
      const last = c.lastMessage?.content?.toLowerCase() ?? ''
      return name.includes(q) || email.includes(q) || last.includes(q)
    })
  }, [conversations, listSearch])

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users
    const q = userSearch.trim().toLowerCase()
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.accessProfileName?.toLowerCase().includes(q) ?? false) ||
        (u.departmentName?.toLowerCase().includes(q) ?? false)
    )
  }, [users, userSearch])

  const userSubtitle = (u: UserOption) => {
    if (u.accessProfileName) return u.accessProfileName
    if (u.departmentName) return u.departmentName
    return u.email
  }

  const handleStartChat = async (userId?: string) => {
    const id = userId ?? selectedUserId
    if (!id) {
      toast.error('Please select a user')
      return
    }
    setCreatingChat(true)
    try {
      const res = await fetch('/api/messenger/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: id }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        const conv = json.data
        const item: ConversationItem = {
          id: conv.id,
          updatedAt: conv.updatedAt,
          otherUser: conv.otherUser,
          lastMessage: null,
        }
        setConversations((prev) => [item, ...prev.filter((c) => c.id !== conv.id)])
        setSelectedConversation(item)
        setNewChatSheetOpen(false)
        setSelectedUserId('')
        setUserSearch('')
      } else {
        toast.error(json.message ?? 'Failed to start conversation')
      }
    } catch {
      toast.error('Failed to start conversation')
    } finally {
      setCreatingChat(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedConversation) return
    const content = messageInput.trim()
    const hasContent = content.length > 0
    const hasFiles = pendingFiles.length > 0
    if (!hasContent && !hasFiles) return
    setMessageInput('')
    const filesToSend = [...pendingFiles]
    setPendingFiles([])
    setSending(true)

    const tempId = `opt-${Date.now()}`
    const optimisticMessage: MessageItem = {
      id: tempId,
      content: content || (hasFiles ? '' : ''),
      createdAt: new Date().toISOString(),
      senderId: 'me',
      sender: { id: 'me', name: 'You', email: '', image: null },
      attachments: filesToSend.map((f, i) => ({
        id: `${tempId}-a-${i}`,
        fileUrl: '/placeholder.svg', // Fallback image while uploading
        fileName: f.name,
        mimeType: f.type || null,
        fileSize: f.size,
      })),
    }
    setMessages((prev) => [...prev, optimisticMessage])
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

    try {
      let res: Response
      if (filesToSend.length > 0) {
        const form = new FormData()
        form.set('content', content)
        filesToSend.forEach((f) => form.append('files', f))
        res = await fetch(`/api/messenger/conversations/${selectedConversation.id}/messages`, {
          method: 'POST',
          body: form,
        })
      } else {
        res = await fetch(`/api/messenger/conversations/${selectedConversation.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        })
      }
      const json = await res.json()
      if (json.success && json.data) {
        const msg = { ...json.data, attachments: json.data.attachments ?? [] }
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? msg : m))
        )
        // Refresh conversation list in background so send flow feels instant
        queueMicrotask(() => fetchConversations())
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        toast.error(json.message ?? 'Failed to send')
        setMessageInput(content)
        setPendingFiles((prev) => [...filesToSend, ...prev])
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      toast.error('Failed to send message')
      setMessageInput(content)
      setPendingFiles((prev) => [...filesToSend, ...prev])
    } finally {
      setSending(false)
      // Ensure focus remains on the input after send
      setTimeout(() => messageInputRef.current?.focus(), 10)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    const maxSize = 15 * 1024 * 1024
    const valid = files.filter((f) => f.size <= maxSize)
    if (valid.length < files.length) toast.error('Some files exceed 15MB and were skipped')
    setPendingFiles((prev) => [...prev, ...valid].slice(-10))
    e.target.value = ''
  }

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const isFromMe = (m: MessageItem) => selectedConversation && m.senderId !== selectedConversation.otherUser?.id

  return (
    <SidebarProvider
      className="max-h-svh overflow-hidden"
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div
            className="flex flex-col min-h-0 overflow-hidden bg-background"
            style={{
              height: 'calc(100svh - var(--header-height, 3rem))',
              maxHeight: 'calc(100svh - var(--header-height, 3rem))',
              overflow: 'hidden',
            }}
          >
            <div className="flex-1 min-h-0 flex pt-2 px-4 pb-4 overflow-hidden">
              <div className="flex flex-1 min-h-0 rounded-lg overflow-hidden bg-card shadow-sm ring-1 ring-inset ring-slate-200/80 dark:ring-slate-700/50 isolate flex overflow-hidden">
                {/* Left: conversation list */}
                <aside className="w-full max-w-[360px] flex flex-col border-r border-border/50 bg-slate-50/80 dark:bg-slate-900/30 rounded-l-lg overflow-hidden shrink-0 min-h-0">
                  <div className="p-3 bg-white/90 dark:bg-slate-900/80">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <Input
                          placeholder="Search conversations..."
                          value={listSearch}
                          onChange={(e) => setListSearch(e.target.value)}
                          className="pl-9 h-9 bg-slate-100 dark:bg-slate-800/50 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 rounded-lg placeholder:text-slate-400"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg shrink-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 dark:hover:text-blue-400"
                        onClick={() => setNewChatSheetOpen(true)}
                        title="New conversation"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div
                    className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
                    data-messenger-scroll
                  >
                    {loading ? (
                      <div className="p-3 space-y-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <Skeleton key={i} className="h-14 w-full rounded-xl" />
                        ))}
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="rounded-full bg-blue-50 dark:bg-blue-950/50 p-4 mb-3">
                          <MessageSquare className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No conversations yet</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                          {listSearch.trim() ? 'No matches for your search.' : 'Start a conversation from the compose icon above.'}
                        </p>
                        {!listSearch.trim() && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-4 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            onClick={() => setNewChatSheetOpen(true)}
                          >
                            Start a conversation
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 space-y-0.5">
                        {filteredConversations.map((c) => {
                          const isUnread = c.hasUnread === true
                          const isSelected = selectedConversation?.id === c.id
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedConversation(c)
                                if (c.hasUnread) {
                                  setConversations((prev) =>
                                    prev.map((conv) =>
                                      conv.id === c.id ? { ...conv, hasUnread: false } : conv
                                    )
                                  )
                                }
                              }}
                              className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 cursor-pointer',
                                isSelected
                                  ? 'bg-blue-50 dark:bg-blue-950/40'
                                  : isUnread
                                    ? 'bg-blue-50/70 dark:bg-blue-950/25 hover:bg-blue-50 dark:hover:bg-blue-950/35'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                              )}
                            >
                              <div className="relative shrink-0">
                                <Avatar className={cn(
                                  'h-11 w-11 ring-2',
                                  isSelected ? 'ring-blue-200 dark:ring-blue-800' : 'ring-background'
                                )}>
                                  <AvatarImage src={c.otherUser?.image ?? undefined} />
                                  <AvatarFallback className="text-sm bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                    {c.otherUser ? getInitials(c.otherUser.name) : <User className="h-4 w-4" />}
                                  </AvatarFallback>
                                </Avatar>
                                {isUnread && !isSelected && (
                                  <span
                                    className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-slate-50 dark:ring-slate-900"
                                    title="New messages"
                                    aria-hidden
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={cn(
                                    'text-sm truncate',
                                    isUnread && !isSelected ? 'font-semibold text-foreground' : 'font-medium text-foreground'
                                  )}>
                                    {c.otherUser?.name ?? 'Unknown'}
                                  </p>
                                  {c.lastMessage && (
                                    <span className={cn(
                                      'text-[11px] shrink-0 tabular-nums',
                                      isUnread && !isSelected ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-muted-foreground'
                                    )}>
                                      {relativeTime(c.lastMessage.createdAt)}
                                    </span>
                                  )}
                                </div>
                                <p className={cn(
                                  'text-xs truncate mt-0.5',
                                  isUnread && !isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'
                                )}>
                                  {c.lastMessage
                                    ? (c.lastMessage.senderId !== c.otherUser?.id ? 'You: ' : '') + (c.lastMessage.content || 'Attachment')
                                    : 'No messages yet'}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </aside>

                {/* Right: chat area */}
                <main className="flex-1 flex flex-col min-w-0 bg-background rounded-r-lg overflow-hidden min-h-0">
                  {!selectedConversation ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-slate-50/50 to-background dark:from-slate-900/20 dark:to-background">
                      <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 p-8 mb-4">
                        <MessageSquare className="h-14 w-14 text-blue-500 dark:text-blue-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground">Your messages</h2>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Search or choose a conversation from the list to open it.
                      </p>
                      <button
                        type="button"
                        onClick={() => setNewChatSheetOpen(true)}
                        className="mt-6 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        Start a new conversation
                      </button>
                      <p className="mt-6 text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                        <Lock className="h-3 w-3 shrink-0" aria-hidden />
                        {t('messagesEncrypted')}
                      </p>
                    </div>
                  ) : (
                    <>
                      <header className="shrink-0 flex items-center gap-3 p-3 border-b border-blue-100 dark:border-blue-900/40 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm">
                        <Avatar className="h-10 w-10 ring-2 ring-blue-100 dark:ring-blue-900/50">
                          <AvatarImage src={selectedConversation.otherUser?.image ?? undefined} />
                          <AvatarFallback className="text-sm bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                            {selectedConversation.otherUser
                              ? getInitials(selectedConversation.otherUser.name)
                              : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {selectedConversation.otherUser?.name ?? 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {selectedConversation.otherUser?.email}
                          </p>
                        </div>
                      </header>

                      <div
                        ref={chatScrollContainerRef}
                        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain"
                        data-messenger-scroll
                      >
                        <div className="px-4 py-6 space-y-1">
                          {loadingMessages ? (
                            <div className="space-y-4">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    'flex',
                                    i % 2 === 0 ? 'justify-end' : 'justify-start'
                                  )}
                                >
                                  <Skeleton
                                    className={cn(
                                      'h-12 rounded-2xl',
                                      i % 2 === 0 ? 'w-48 ml-auto' : 'w-56'
                                    )}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              {messages.map((m) => {
                                const seen = isFromMe(m) && otherLastSeenAt && new Date(m.createdAt).getTime() <= new Date(otherLastSeenAt).getTime()
                                return (
                                  <div
                                    key={m.id}
                                    className={cn(
                                      'flex transition-opacity',
                                      isFromMe(m) ? 'justify-end' : 'justify-start'
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                                        isFromMe(m)
                                          ? 'bg-blue-500 text-white rounded-br-md shadow-blue-200/50 dark:shadow-blue-900/20'
                                          : 'bg-slate-100 dark:bg-slate-800 text-foreground rounded-bl-md border border-slate-200/50 dark:border-slate-700'
                                      )}
                                    >
                                      {m.content ? <p className="whitespace-pre-wrap break-words">{m.content}</p> : null}
                                      {(m.attachments?.length ?? 0) > 0 && (
                                        <div className="mt-2 space-y-2">
                                          {m.attachments!.map((a) => {
                                            const isImage = (a.mimeType ?? '').startsWith('image/')
                                            return (
                                              <div key={a.id} className="rounded-lg overflow-hidden bg-black/10 dark:bg-white/10">
                                                {isImage ? (
                                                  <a href={a.fileUrl} target={a.fileUrl === '/placeholder.svg' ? undefined : '_blank'} rel="noopener noreferrer" className="block">
                                                    {a.fileUrl === '/placeholder.svg' ? (
                                                      <div className="w-48 h-48 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center text-xs text-muted-foreground">Uploading...</div>
                                                    ) : (
                                                      <img src={a.fileUrl} alt={a.fileName} className="max-w-full max-h-48 object-contain" />
                                                    )}
                                                  </a>
                                                ) : (
                                                  <a
                                                    href={a.fileUrl}
                                                    target={a.fileUrl === '/placeholder.svg' ? undefined : '_blank'}
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-2 text-sm hover:underline"
                                                  >
                                                    <FileText className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">{a.fileName}</span>
                                                  </a>
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span
                                          className={cn(
                                            'text-[11px] tabular-nums',
                                            isFromMe(m) ? 'text-blue-100' : 'text-muted-foreground'
                                          )}
                                        >
                                          {formatMessageTime(m.createdAt)}
                                        </span>
                                        {seen && (
                                          <span className="text-[10px] text-blue-100 flex items-center gap-0.5" title="Seen">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                                            Seen
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                              <div ref={messagesEndRef} />
                            </>
                          )}
                        </div>
                      </div>

                      <footer className="shrink-0 border-t border-blue-100 dark:border-blue-900/30 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-br-lg">
                        <form
                          onSubmit={handleSend}
                          className="p-4 pt-2"
                        >
                          {pendingFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {pendingFiles.map((f, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm"
                                >
                                  <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                                  <span className="truncate max-w-[120px]">{f.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => removePendingFile(i)}
                                    className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                    aria-label="Remove"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 items-end">
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              className="hidden"
                              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
                              onChange={handleFileSelect}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11 rounded-full shrink-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={sending}
                              title="Attach files"
                            >
                              <Paperclip className="h-5 w-5" />
                            </Button>
                            <Input
                              ref={messageInputRef}
                              placeholder="Type a message..."
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              className="flex-1 rounded-2xl h-11 px-4 border-slate-200 dark:border-slate-700 focus-visible:ring-1 focus-visible:ring-blue-400/50 focus-visible:border-blue-400/60 bg-background/80"
                            // removed disabled={sending} to maintain smooth typing flow UX
                            />
                            <Button
                              type="submit"
                              size="icon"
                              className="h-11 w-11 rounded-full shrink-0 bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/25"
                              disabled={sending || (!messageInput.trim() && pendingFiles.length === 0)}
                            >
                              {sending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </form>
                      </footer>
                    </>
                  )}
                </main>
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </SidebarInset>

      {/* New conversation sheet */}
      <Sheet open={newChatSheetOpen} onOpenChange={setNewChatSheetOpen}>
        <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col border-l border-slate-200 dark:border-slate-800">
          <SheetHeader className="p-4 border-b border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20">
            <SheetTitle className="text-left text-foreground">New message</SheetTitle>
          </SheetHeader>
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search people..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden" data-messenger-scroll>
            <div className="p-2">
              {filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {users.length === 0 ? 'Loading...' : 'No people found.'}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(u.id)
                        handleStartChat(u.id)
                      }}
                      disabled={creatingChat}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors text-left disabled:opacity-50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.image ?? undefined} />
                        <AvatarFallback className="text-sm bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                          {getInitials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {u.name}
                          {userSubtitle(u) !== u.email && (
                            <span className="text-muted-foreground font-normal"> — {userSubtitle(u)}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      {creatingChat && selectedUserId === u.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  )
}
