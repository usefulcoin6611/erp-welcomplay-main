"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { IconArrowLeft, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import { toast } from "sonner"

type FormField = {
  id: string
  name: string
  type: string
  required: boolean
}

type FormDetail = {
  id: string
  name: string
  code: string
  isActive: boolean
  isLeadActive: boolean
  responses: number
  fields: FormField[]
}

interface FormDetailClientProps {
  initialForm: FormDetail
}

export function FormDetailClient({ initialForm }: FormDetailClientProps) {
  const router = useRouter()
  const [form, setForm] = useState<FormDetail>(initialForm)
  const [fields, setFields] = useState<FormField[]>(initialForm.fields)
  
  // Create Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createType, setCreateType] = useState("text")
  const [createRequired, setCreateRequired] = useState(false)
  const [creating, setCreating] = useState(false)

  // Edit Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [editName, setEditName] = useState("")
  const [editType, setEditType] = useState("text")
  const [editRequired, setEditRequired] = useState(false)
  const [saving, setSaving] = useState(false)

  // Delete Alert State
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleCreateField = async () => {
    if (!createName.trim()) {
      toast.error("Nama field harus diisi")
      return
    }

    try {
      setCreating(true)
      const res = await fetch(`/api/form-builder/${form.id}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          type: createType,
          required: createRequired,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal membuat field")
        return
      }

      setFields([...fields, json.data])
      setCreateName("")
      setCreateType("text")
      setCreateRequired(false)
      setCreateDialogOpen(false)
      toast.success("Field berhasil dibuat")
      router.refresh()
    } catch (error) {
      toast.error("Terjadi kesalahan saat membuat field")
    } finally {
      setCreating(false)
    }
  }

  const openEditDialog = (field: FormField) => {
    setEditingField(field)
    setEditName(field.name)
    setEditType(field.type)
    setEditRequired(field.required)
    setEditDialogOpen(true)
  }

  const handleUpdateField = async () => {
    if (!editingField || !editName.trim()) return

    try {
      setSaving(true)
      const res = await fetch(`/api/form-builder/${form.id}/fields/${editingField.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          type: editType,
          required: editRequired,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal memperbarui field")
        return
      }

      setFields(fields.map(f => f.id === editingField.id ? json.data : f))
      setEditDialogOpen(false)
      setEditingField(null)
      toast.success("Field berhasil diperbarui")
      router.refresh()
    } catch (error) {
      toast.error("Terjadi kesalahan saat memperbarui field")
    } finally {
      setSaving(false)
    }
  }

  const openDeleteAlert = (id: string) => {
    setDeletingFieldId(id)
    setDeleteAlertOpen(true)
  }

  const handleDeleteField = async () => {
    if (!deletingFieldId) return

    try {
      setDeleting(true)
      const res = await fetch(`/api/form-builder/${form.id}/fields/${deletingFieldId}`, {
        method: "DELETE",
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal menghapus field")
        return
      }

      setFields(fields.filter(f => f.id !== deletingFieldId))
      setDeleteAlertOpen(false)
      setDeletingFieldId(null)
      toast.success("Field berhasil dihapus")
      router.refresh()
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus field")
    } finally {
      setDeleting(false)
    }
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
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Title Card */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <CardTitle className="text-lg font-semibold">{form.name}</CardTitle>
                  <CardDescription>
                    {form.code} · {form.id}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                    asChild
                  >
                    <Link href={`/form_builder/${form.id}/edit`}>
                      <IconPencil className="mr-1 h-4 w-4" />
                      Edit Form
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 shadow-none bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200"
                    asChild
                  >
                    <Link href={`/form_builder/${form.id}/response`}>
                      View Responses
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 px-3 bg-blue-500 hover:bg-blue-600 shadow-none"
                    asChild
                  >
                    <Link href={`/form_builder/${form.id}/preview`} target="_blank" rel="noopener noreferrer">
                      Preview
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 shadow-none bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                  >
                    <Link href="/form_builder">
                      <IconArrowLeft className="mr-1 h-4 w-4" />
                      Back
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge
                    className={
                      form.isActive
                        ? 'bg-green-100 text-green-700 border-none'
                        : 'bg-gray-100 text-gray-700 border-none'
                    }
                  >
                    {form.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Convert to Lead:{' '}
                    <span className="font-medium">
                      {form.isLeadActive ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Responses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {form.responses}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fields</CardTitle>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 shadow-none">
                      <IconPlus className="mr-2 h-4 w-4" />
                      Add Field
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Form Field</DialogTitle>
                      <DialogDescription>
                        Create a new field for this form.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Field Name</Label>
                        <Input
                          id="name"
                          value={createName}
                          onChange={(e) => setCreateName(e.target.value)}
                          placeholder="e.g. Full Name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="type">Field Type</Label>
                        <Select value={createType} onValueChange={setCreateType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="radio">Radio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="required"
                          checked={createRequired}
                          onCheckedChange={(checked) => setCreateRequired(checked as boolean)}
                        />
                        <Label htmlFor="required">Required field</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateField} disabled={creating || !createName}>
                        {creating ? "Creating..." : "Create Field"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.length > 0 ? fields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">{field.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {field.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {field.required ? (
                            <Badge className="bg-red-100 text-red-700 border-none">
                              Required
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 border-none">
                              Optional
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                              onClick={() => openEditDialog(field)}
                            >
                              <IconPencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => openDeleteAlert(field.id)}
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <div className="flex h-24 flex-col items-center justify-center text-muted-foreground">
                            <p>No fields found.</p>
                            <p className="text-sm">Add a field to get started.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
        </MainContentWrapper>
      </SidebarInset>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Form Field</DialogTitle>
            <DialogDescription>
              Update the field details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Field Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Field Type</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="textarea">Text Area</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="radio">Radio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-required"
                checked={editRequired}
                onCheckedChange={(checked) => setEditRequired(checked as boolean)}
              />
              <Label htmlFor="edit-required">Required field</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateField} disabled={saving || !editName}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form field.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteField} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
