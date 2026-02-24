'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { MainContentWrapper } from '@/components/main-content-wrapper';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Download,
  Eye,
  Building2,
  X,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

interface CompanyPolicy {
  id: number;
  branch: string;
  title: string;
  description: string | null;
  attachment?: string | null;
}

type PolicyFormData = {
  branch: string;
  title: string;
  description: string;
  attachment: File | null;
};

type BranchOption = {
  id: number;
  name: string;
};

const defaultFormData: PolicyFormData = {
  branch: '',
  title: '',
  description: '',
  attachment: null,
};

const statCardClass =
  'rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';

function getBranchLabel(value: string, branchOptions: BranchOption[]): string {
  if (!value) return '-';
  return (branchOptions.find((b) => b.name === value)?.name ?? value) || '-';
}

export default function CompanyPolicyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PolicyFormData>(defaultFormData);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<CompanyPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [policies, setPolicies] = useState<CompanyPolicy[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [currentAttachmentPath, setCurrentAttachmentPath] = useState<string | null>(null);
  const [attachmentRemoved, setAttachmentRemoved] = useState(false);
  const [isDraggingAttachment, setIsDraggingAttachment] = useState(false);

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/hrm/policies');
      const json = await res.json();
      if (json.success) {
        setPolicies(json.data ?? []);
      } else {
        toast.error(json.message || 'Gagal memuat company policy');
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Gagal memuat company policy');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      const json = await res.json();
      if (json.success) {
        setBranches(json.data ?? []);
      } else {
        toast.error(json.message || 'Gagal memuat data branch');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Gagal memuat data branch');
    }
  };

  useEffect(() => {
    fetchPolicies();
    fetchBranches();
  }, []);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setFormData({ ...defaultFormData });
      setCurrentAttachmentPath(null);
      setAttachmentRemoved(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...defaultFormData });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.branch) {
      toast.error('Branch wajib dipilih');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Title wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      const url =
        editingId !== null ? `/api/hrm/policies/${editingId}` : '/api/hrm/policies';
      const method = editingId !== null ? 'PUT' : 'POST';

      const payload = new FormData();
      payload.append('branch', formData.branch);
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      if (formData.attachment instanceof File) {
        payload.append('attachment', formData.attachment);
      }
      if (editingId !== null) {
        payload.append('attachmentRemoved', attachmentRemoved ? 'true' : 'false');
      }

      const res = await fetch(url, {
        method,
        body: payload,
      });
      const json = await res.json();

      if (json.success) {
        toast.success(
          json.message ||
            (editingId !== null ? 'Company policy updated' : 'Company policy created'),
        );
        await fetchPolicies();
        handleDialogOpenChange(false);
      } else {
        toast.error(json.message || 'Gagal menyimpan company policy');
      }
    } catch (error) {
      console.error('Error submitting company policy:', error);
      toast.error('Gagal menyimpan company policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (policy: CompanyPolicy) => {
    setFormData({
      branch: policy.branch,
      title: policy.title,
      description: policy.description ?? '',
      attachment: null,
    });
    setCurrentAttachmentPath(policy.attachment ?? null);
    setAttachmentRemoved(false);
    setEditingId(policy.id);
    setDialogOpen(true);
  };

  const openDeleteConfirm = (policy: CompanyPolicy) => {
    setPolicyToDelete(policy);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    (async () => {
      if (!policyToDelete) {
        setDeleteAlertOpen(false);
        return;
      }
      try {
        const res = await fetch(`/api/hrm/policies/${policyToDelete.id}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (json.success) {
          toast.success(json.message || 'Company policy deleted');
          await fetchPolicies();
        } else {
          toast.error(json.message || 'Gagal menghapus company policy');
        }
      } catch (error) {
        console.error('Error deleting company policy:', error);
        toast.error('Gagal menghapus company policy');
      } finally {
        setDeleteAlertOpen(false);
        setPolicyToDelete(null);
      }
    })();
  };

  const filteredPolicies = useMemo(
    () =>
      policies.filter((p) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return (
          p.title.toLowerCase().includes(term) ||
          getBranchLabel(p.branch, branches).toLowerCase().includes(term) ||
          (p.description ?? '').toLowerCase().includes(term)
        );
      }),
    [policies, branches, searchTerm],
  );

  const totalPolicies = policies.length;
  const withAttachments = policies.filter((p) => p.attachment).length;
  const branchCount = new Set(policies.map((p) => p.branch)).size;

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
        <div className="flex flex-1 flex-col">
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
              {/* Title Card - reference: Manage Company Policy */}
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="px-6">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-semibold">Company Policy</CardTitle>
                    <CardDescription>
                      Manage Company Policy. Kelola kebijakan perusahaan per branch, lampiran, dan deskripsi.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className={statCardClass}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Policies</p>
                        <p className="text-2xl font-bold">{totalPolicies}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-sky-100">
                        <FileText className="w-5 h-5 text-sky-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={statCardClass}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">With Attachments</p>
                        <p className="text-2xl font-bold text-blue-600">{withAttachments}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                        <Download className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={statCardClass}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Branches Covered</p>
                        <p className="text-2xl font-bold text-green-600">{branchCount}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                        <Building2 className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Table Card - reference: Branch, Title, Description, Attachment, Action */}
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 py-3.5">
                  <div className="flex w-full max-w-md items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search policies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 pl-9 pr-9 border-0 bg-gray-50 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0"
                      />
                      {searchTerm.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                          onClick={() => setSearchTerm('')}
                          aria-label="Clear search"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                    onClick={handleAdd}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-6">Branch</TableHead>
                          <TableHead className="px-6">Title</TableHead>
                          <TableHead className="px-6">Description</TableHead>
                          <TableHead className="px-6">Attachment</TableHead>
                          <TableHead className="px-6 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="px-6 text-center py-8 text-muted-foreground"
                            >
                              Loading policies...
                            </TableCell>
                          </TableRow>
                        ) : filteredPolicies.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="px-6 text-center py-8 text-muted-foreground"
                            >
                              No policies found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPolicies.map((policy) => (
                            <TableRow key={policy.id}>
                              <TableCell className="px-6">
                                {getBranchLabel(policy.branch, branches)}
                              </TableCell>
                              <TableCell className="px-6 font-medium">{policy.title}</TableCell>
                              <TableCell className="px-6 max-w-xs">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {policy.description ?? '-'}
                                </p>
                              </TableCell>
                              <TableCell className="px-6">
                                {policy.attachment ? (
                                  (() => {
                                    const fileUrl = policy.attachment!.startsWith('/')
                                      ? policy.attachment!
                                      : `/uploads/companyPolicy/${policy.attachment}`;
                                    return (
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200"
                                          title="Download"
                                          asChild
                                        >
                                          <a href={fileUrl} download>
                                            <Download className="w-3.5 h-3.5" />
                                          </a>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0 shadow-none bg-amber-100 text-amber-800 hover:bg-amber-200"
                                          title="Preview"
                                          asChild
                                        >
                                          <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <Eye className="w-3.5 h-3.5" />
                                          </a>
                                        </Button>
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="px-6">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                                    onClick={() => handleEdit(policy)}
                                    title="Edit"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 p-0 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                                    onClick={() => openDeleteConfirm(policy)}
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </MainContentWrapper>
        </div>
      </SidebarInset>

      {/* Create/Edit Dialog - reference: Branch (required), Title (required), Description, Attachment (file) */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? 'Edit Company Policy' : 'Create New Company Policy'}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null
                ? 'Ubah kebijakan perusahaan.'
                : 'Tambah kebijakan baru. Isi Branch dan Title yang wajib.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">
                    Branch <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) => setFormData({ ...formData, branch: value })}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.length === 0 ? (
                        <SelectItem value="__no-branch__" disabled>
                          No branches available
                        </SelectItem>
                      ) : (
                        branches.map((b) => (
                          <SelectItem key={b.id} value={b.name}>
                            {b.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create branch here.{' '}
                    <Link
                      href="/hrm/setup/branch"
                      className="font-medium text-primary hover:underline"
                    >
                      Create branch
                    </Link>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter Title"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter Description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attachment">Attachment</Label>
                <div className="relative">
                  <label
                    htmlFor="attachment"
                    className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      formData.attachment || isDraggingAttachment
                        ? 'border-blue-400 bg-blue-50/50'
                        : 'border-muted-foreground/25 bg-muted/5 hover:bg-muted/10'
                    }`}
                    onDragOver={(e: React.DragEvent<HTMLLabelElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isDraggingAttachment) {
                        setIsDraggingAttachment(true);
                      }
                    }}
                    onDragLeave={(e: React.DragEvent<HTMLLabelElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isDraggingAttachment) {
                        setIsDraggingAttachment(false);
                      }
                    }}
                    onDrop={(e: React.DragEvent<HTMLLabelElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingAttachment(false);
                      const file = e.dataTransfer.files?.[0] ?? null;
                      if (file) {
                        setFormData({
                          ...formData,
                          attachment: file,
                        });
                        setAttachmentRemoved(false);
                      }
                    }}
                  >
                    {formData.attachment ? (
                      <div className="flex items-center gap-2 px-3 w-full">
                        <FileText className="w-6 h-6 text-blue-500 shrink-0" />
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate w-full max-w-[220px]">
                            {formData.attachment.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(formData.attachment.size / 1024 < 1024
                              ? `${(formData.attachment.size / 1024).toFixed(1)} KB`
                              : `${(formData.attachment.size / (1024 * 1024)).toFixed(2)} MB`)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-2 text-muted-foreground hover:text-red-500 shrink-0 z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const input = document.getElementById(
                              'attachment',
                            ) as HTMLInputElement | null;
                            if (input) input.value = '';
                            setFormData({ ...formData, attachment: null });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Upload className="w-4 h-4 mb-1 text-blue-500" />
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, JPG, PNG (MAX. 10MB)
                        </p>
                      </div>
                    )}
                    <Input
                      id="attachment"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setFormData({
                          ...formData,
                          attachment: file,
                        });
                        if (file) {
                          setAttachmentRemoved(false);
                        }
                      }}
                    />
                  </label>
                </div>
                {currentAttachmentPath && !attachmentRemoved && !formData.attachment && (
                  <div className="mt-2 flex items-center justify-between rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-600" />
                      <span className="text-xs text-muted-foreground break-all">
                        {currentAttachmentPath.split('/').pop()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const fileUrl = currentAttachmentPath.startsWith('/')
                          ? currentAttachmentPath
                          : `/uploads/companyPolicy/${currentAttachmentPath}`;
                        return (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200"
                              title="Download attachment"
                              asChild
                            >
                              <a href={fileUrl} download>
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 p-0 shadow-none text-rose-700 hover:bg-rose-100"
                              title="Remove attachment"
                              onClick={() => {
                                setAttachmentRemoved(true);
                                setCurrentAttachmentPath(null);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
                {formData.attachment && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {formData.attachment.name}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="blue" className="shadow-none" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Update'
                    : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Company Policy?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{policyToDelete?.title}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
