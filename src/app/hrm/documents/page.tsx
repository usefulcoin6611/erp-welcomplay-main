'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { Search, Plus, Pencil, Trash2, Download, Eye, X, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUpload {
  id: number;
  name: string;
  document: string | null;
  role: string;
  description: string | null;
}

const ROLES = [
  { value: '0', label: 'All' },
  { value: '1', label: 'Admin' },
  { value: '2', label: 'Employee' },
  { value: '3', label: 'HR Manager' },
  { value: '4', label: 'Manager' },
];

const defaultFormData = {
  name: '',
  role: '0',
  description: '',
  document: null as File | null,
};

function getRoleLabel(value: string): string {
  return (ROLES.find((r) => r.value === value)?.label ?? value) || 'All';
}

export default function DocumentSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentUpload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDocumentPath, setCurrentDocumentPath] = useState<string | null>(null);
  const [documentRemoved, setDocumentRemoved] = useState(false);
  const [isDraggingDocument, setIsDraggingDocument] = useState(false);

  const [documents, setDocuments] = useState<DocumentUpload[]>([]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/hrm/documents');
      const json = await res.json();
      if (json.success) {
        setDocuments(json.data ?? []);
      } else {
        toast.error(json.message || 'Gagal memuat data document');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Gagal memuat data document');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setFormData({ ...defaultFormData });
      setCurrentDocumentPath(null);
      setDocumentRemoved(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...defaultFormData });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name wajib diisi');
      return;
    }
    const documentName =
      formData.document instanceof File ? formData.document.name : editingId ? undefined : '';
    if (!editingId && !documentName) {
      toast.error('Document wajib dipilih');
      return;
    }

    try {
      setIsSubmitting(true);
      const url =
        editingId !== null ? `/api/hrm/documents/${editingId}` : '/api/hrm/documents';
      const method = editingId !== null ? 'PUT' : 'POST';

      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('role', formData.role);
      payload.append('description', formData.description.trim());
      if (formData.document instanceof File) {
        payload.append('file', formData.document);
      }
      if (editingId !== null) {
        payload.append('documentRemoved', documentRemoved ? 'true' : 'false');
      }

      const res = await fetch(url, {
        method,
        body: payload,
      });
      const json = await res.json();

      if (json.success) {
        toast.success(json.message || (editingId !== null ? 'Document updated' : 'Document created'));
        await fetchDocuments();
        handleDialogOpenChange(false);
      } else {
        toast.error(json.message || 'Gagal menyimpan document');
      }
    } catch (error) {
      console.error('Error submitting document:', error);
      toast.error('Gagal menyimpan document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (doc: DocumentUpload) => {
    setFormData({
      name: doc.name,
      role: doc.role,
      description: doc.description ?? '',
      document: null,
    });
    setCurrentDocumentPath(doc.document);
    setDocumentRemoved(false);
    setEditingId(doc.id);
    setDialogOpen(true);
  };

  const openDeleteConfirm = (doc: DocumentUpload) => {
    setDocToDelete(doc);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    (async () => {
      if (!docToDelete) {
        setDeleteAlertOpen(false);
        return;
      }
      try {
        const res = await fetch(`/api/hrm/documents/${docToDelete.id}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (json.success) {
          toast.success(json.message || 'Document deleted');
          await fetchDocuments();
        } else {
          toast.error(json.message || 'Gagal menghapus document');
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Gagal menghapus document');
      } finally {
        setDeleteAlertOpen(false);
        setDocToDelete(null);
      }
    })();
  };

  const filteredDocuments = useMemo(
    () =>
      documents.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          getRoleLabel(doc.role).toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          (doc.description ?? '').toLowerCase().includes(searchTerm.trim().toLowerCase())
      ),
    [documents, searchTerm]
  );

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
              {/* Title Card - reference-erp documentUpload: Manage Document */}
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="px-6">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-semibold">Manage Document</CardTitle>
                    <CardDescription>
                      Document. Kolom: Name, Document, Role, Description, Action.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              {/* Table Card - reference-erp: Name, Document, Role, Description, Action */}
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 py-3.5">
                  <div className="flex w-full max-w-md items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search documents..."
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
                          <TableHead className="px-6">Name</TableHead>
                          <TableHead className="px-6">Document</TableHead>
                          <TableHead className="px-6">Role</TableHead>
                          <TableHead className="px-6">Description</TableHead>
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
                              Loading documents...
                            </TableCell>
                          </TableRow>
                        ) : filteredDocuments.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="px-6 text-center py-8 text-muted-foreground"
                            >
                              No documents found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDocuments.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell className="px-6 font-medium">{doc.name}</TableCell>
                              <TableCell className="px-6">
                                {doc.document ? (
                                  (() => {
                                    const fileUrl = doc.document.startsWith('/')
                                      ? doc.document
                                      : `/uploads/documentUpload/${doc.document}`;
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
                              <TableCell className="px-6">{getRoleLabel(doc.role)}</TableCell>
                              <TableCell className="px-6 max-w-xs">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {doc.description}
                                </p>
                              </TableCell>
                              <TableCell className="px-6">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                                    onClick={() => handleEdit(doc)}
                                    title="Edit"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 p-0 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                                    onClick={() => openDeleteConfirm(doc)}
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

      {/* Create/Edit Dialog - reference: Name (required), Role (select + Create role link), Description, Document (file required on create) */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? 'Edit Document' : 'Create New Document'}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null
                ? 'Ubah dokumen.'
                : 'Upload dokumen baru. Isi Name dan pilih file Document.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create role here.{' '}
                    <Link href="/users" className="font-medium text-primary hover:underline">
                      Create role
                    </Link>
                  </p>
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
                <Label htmlFor="document">
                  Document {!editingId && <span className="text-red-500">*</span>}
                </Label>
                <div className="relative">
                  <label
                    htmlFor="document"
                    className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      formData.document || isDraggingDocument
                        ? 'border-blue-400 bg-blue-50/50'
                        : 'border-muted-foreground/25 bg-muted/5 hover:bg-muted/10'
                    }`}
                    onDragOver={(e: React.DragEvent<HTMLLabelElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isDraggingDocument) {
                        setIsDraggingDocument(true);
                      }
                    }}
                    onDragLeave={(e: React.DragEvent<HTMLLabelElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isDraggingDocument) {
                        setIsDraggingDocument(false);
                      }
                    }}
                    onDrop={(e: React.DragEvent<HTMLLabelElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingDocument(false);
                      const file = e.dataTransfer.files?.[0] ?? null;
                      if (file) {
                        setFormData({ ...formData, document: file });
                        if (editingId) {
                          setDocumentRemoved(false);
                        }
                      }
                    }}
                  >
                    {formData.document ? (
                      <div className="flex items-center gap-2 px-3 w-full">
                        <FileText className="w-6 h-6 text-blue-500 shrink-0" />
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate w-full max-w-[220px]">
                            {formData.document.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(formData.document.size / 1024 < 1024
                              ? `${(formData.document.size / 1024).toFixed(1)} KB`
                              : `${(formData.document.size / (1024 * 1024)).toFixed(2)} MB`)}
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
                            const input = document.getElementById('document') as HTMLInputElement | null;
                            if (input) input.value = '';
                            setFormData({ ...formData, document: null });
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
                      id="document"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      required={!editingId}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setFormData({ ...formData, document: file });
                      }}
                    />
                  </label>
                </div>
                {editingId && currentDocumentPath && !documentRemoved && !formData.document && (
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center justify-between rounded-md border border-dashed px-3 py-2 bg-slate-50">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-xs truncate max-w-[200px] font-medium">
                            {currentDocumentPath.split('/').filter(Boolean).slice(-1)[0] ||
                              currentDocumentPath}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Existing File
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => {
                            const fileUrl = currentDocumentPath.startsWith('/')
                              ? currentDocumentPath
                              : `/uploads/documentUpload/${currentDocumentPath}`;
                            window.open(fileUrl, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={() => setDocumentRemoved(true)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Kosongkan upload di atas jika tidak ingin mengganti file.
                    </p>
                  </div>
                )}
                {editingId && documentRemoved && !formData.document && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 rounded border border-red-100">
                    <span className="text-xs text-red-600">
                      Dokumen lama akan dihapus saat disimpan.
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setDocumentRemoved(false)}
                    >
                      Batal Hapus
                    </Button>
                  </div>
                )}
                {formData.document instanceof File && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {formData.document.name}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="blue" className="shadow-none" disabled={isSubmitting}>
                {editingId !== null ? (isSubmitting ? 'Updating...' : 'Update') : isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Document?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{docToDelete?.name}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-rose-600 hover:bg-rose-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
