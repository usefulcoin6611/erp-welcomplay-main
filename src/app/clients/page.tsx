"use client"

import { useState, useCallback, useEffect } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, MoreVertical, Pencil, Trash2, Lock, Unlock, Calendar, Clock, Briefcase } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

interface Client {
  id: string
  name: string
  email: string
  avatar?: string | null
  is_enable_login: boolean
  last_login_at: string
  delete_status: number
  deals_count: number
  projects_count: number
}

export default function ClientsPage() {
  const { isLoading: authLoading } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    login_enable: false,
  })

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/clients')
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? 'Failed to load clients')
        return
      }
      const list = Array.isArray(json.data) ? json.data : []
      setClients(
        list.map(
          (r: {
            id: string
            name: string
            email: string
            avatar?: string | null
            lastLoginAt?: string | null
            lastActivityAt?: string | null
            is_enable_login?: boolean
            deals_count?: number
            projects_count?: number
          }) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            avatar: r.avatar ?? undefined,
            is_enable_login: r.is_enable_login ?? false,
            last_login_at: r.lastLoginAt ?? r.lastActivityAt ?? '',
            delete_status: 1,
            deals_count: r.deals_count ?? 0,
            projects_count: r.projects_count ?? 0,
          })
        )
      )
    } catch (err) {
      console.error(err)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    fetchClients()
  }, [authLoading, fetchClients])

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        login_enable: false,
      })
    }
  }

  const handleEdit = (client: Client) => {
    setEditingId(client.id)
    setFormData({
      name: client.name,
      email: client.email,
      password: '',
      login_enable: client.is_enable_login,
    })
    setDialogOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim() || !formData.email?.trim()) {
      toast.error('Name and email are required')
      return
    }
    if (formData.login_enable && !formData.password?.trim()) {
      toast.error('Password is required when login is enabled')
      return
    }

    setSaving(true)
    try {
      const url = editingId ? `/api/clients/${editingId}` : '/api/clients'
      const method = editingId ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        login_enable: formData.login_enable,
      }
      if (formData.password?.trim()) body.password = formData.password.trim()

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? (editingId ? 'Failed to update client' : 'Failed to create client'))
        return
      }
      toast.success(editingId ? 'Client updated' : 'Client created')
      handleDialogOpenChange(false)
      fetchClients()
    } catch (err) {
      console.error(err)
      toast.error(editingId ? 'Failed to update client' : 'Failed to create client')
    } finally {
      setSaving(false)
    }
  }

  const openDeleteConfirm = (client: Client) => {
    setClientToDelete(client)
    requestAnimationFrame(() => {
      setDeleteDialogOpen(true)
    })
  }

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return
    const idToDelete = clientToDelete.id
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${idToDelete}`, { method: 'DELETE' })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? 'Failed to delete client')
        return
      }
      toast.success('Client deleted')
      setDeleteDialogOpen(false)
      setClientToDelete(null)
      await fetchClients()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete client')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (isoOrEmpty: string) => {
    if (!isoOrEmpty) return '-'
    const date = new Date(isoOrEmpty)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const formatTime = (isoOrEmpty: string) => {
    if (!isoOrEmpty) return '-'
    const date = new Date(isoOrEmpty)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <SidebarProvider
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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            {loading ? (
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-8 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading clients...</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Title Page */}
                <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                  <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1 flex-1">
                      <CardTitle className="text-lg font-semibold">Manage Client</CardTitle>
                      <CardDescription>
                        Create and manage clients in your system. Track client information, deals, and projects.
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                        <DialogTrigger asChild>
                          <Button variant="blue" size="sm" className="shadow-none h-7 px-4" title="Create Client">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Client
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Client' : 'Create New Client'}</DialogTitle>
                            <DialogDescription>
                              {editingId
                                ? 'Update client information.'
                                : 'Add a new client to your system. Fill in the required information.'}
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleCreateSubmit}>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">
                                  Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="name"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  placeholder="Enter Client Name"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email">
                                  E-Mail Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                  placeholder="Enter Client Email"
                                  required
                                  disabled={!!editingId}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="login_enable">Login is enable</Label>
                                <Switch
                                  id="login_enable"
                                  checked={formData.login_enable}
                                  onCheckedChange={(checked) =>
                                    setFormData({ ...formData, login_enable: checked })
                                  }
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </div>
                              {formData.login_enable && (
                                <div className="space-y-2">
                                  <Label htmlFor="password">
                                    Password {editingId ? '(leave blank to keep current)' : ''}{' '}
                                    {!editingId && <span className="text-red-500">*</span>}
                                  </Label>
                                  <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={editingId ? 'Enter new password' : 'Enter Client Password'}
                                    minLength={6}
                                    required={!editingId && formData.login_enable}
                                  />
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleDialogOpenChange(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" variant="blue" className="shadow-none" disabled={saving}>
                                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                </Card>

                {/* Client Cards Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {clients.map((client) => (
                    <Card
                      key={client.id}
                      className="group flex flex-col h-full rounded-xl border-0 shadow-sm overflow-hidden bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/70 hover:shadow-md transition-all duration-200"
                    >
                      <CardContent className="p-3 flex flex-col flex-1 gap-2">
                        {/* Top: avatar + name/email + menu — pastel block */}
                        <div className="flex items-start gap-3 rounded-xl bg-white/80 backdrop-blur-sm px-4 py-3">
                          <Avatar className="h-14 w-14 shrink-0 rounded-full ring-2 ring-blue-200/50 ring-offset-2 bg-gradient-to-br from-blue-100 to-blue-200/60">
                            <AvatarImage src={client.avatar ?? undefined} alt={client.name} className="object-cover" />
                            <AvatarFallback className="rounded-full text-base font-semibold bg-blue-400/20 text-blue-700">
                              {getInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-[15px] truncate leading-tight">{client.name}</h5>
                            <p className="text-sm text-muted-foreground truncate mt-0.5">{client.email}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg opacity-70 group-hover:opacity-100">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(client)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => openDeleteConfirm(client)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(client)}>
                                {client.is_enable_login ? (
                                  <><Unlock className="mr-2 h-4 w-4" /> Login Disable</>
                                ) : (
                                  <><Lock className="mr-2 h-4 w-4" /> Login Enable</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(client)}>
                                <Lock className="mr-2 h-4 w-4" /> Reset Password
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Deals & Projects — pastel block */}
                        <div className="flex items-center gap-3 rounded-xl bg-blue-100/40 px-4 py-2.5" title="Deals and projects">
                          <Briefcase className="h-5 w-5 shrink-0 text-blue-600" />
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span className="text-xs text-muted-foreground">Deals & Projects</span>
                            <span className="text-sm tabular-nums">
                              {client.deals_count} Deals · {client.projects_count} Projects
                            </span>
                          </div>
                        </div>

                        {/* Last Login — pastel block */}
                        <div className="flex items-center gap-3 rounded-xl bg-blue-100/40 px-4 py-2.5" title="Last login">
                          <Clock className="h-5 w-5 shrink-0 text-blue-600" />
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span className="text-xs text-muted-foreground">Last Login</span>
                            <span className="text-sm tabular-nums">
                              {formatDate(client.last_login_at)} {formatTime(client.last_login_at) !== '-' ? formatTime(client.last_login_at) : ''}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={(open) => {
                    setDeleteDialogOpen(open)
                    if (!open) setClientToDelete(null)
                  }}
                >
                  <AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete client?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the client{' '}
                        {clientToDelete?.name ?? clientToDelete?.email ?? ''}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
                      <Button
                        type="button"
                        variant="destructive"
                        className="bg-destructive text-white hover:bg-destructive/90"
                        disabled={saving}
                        onClick={() => void handleConfirmDelete()}
                      >
                        {saving ? 'Deleting...' : 'Delete'}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
