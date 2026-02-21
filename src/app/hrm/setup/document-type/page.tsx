'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const CARD_STYLE =
  'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white rounded-lg';

interface DocumentType {
  id: string;
  name: string;
}

export default function ManageDocumentTypePage() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [documentTypeToDelete, setDocumentTypeToDelete] =
    useState<DocumentType | null>(null);

  const total = documentTypes.length;

  const fetchDocumentTypes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/document-types');
      const data = await res.json();
      if (data.success) {
        setDocumentTypes(data.data);
      } else {
        toast.error(data.message || 'Gagal memuat data document type');
      }
    } catch (error) {
      console.error('Error fetching document types:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const handleAddClick = () => {
    setDialogOpen(true);
    setEditingId(null);
    setName('');
  };

  const handleEditClick = (item: DocumentType) => {
    setDialogOpen(true);
    setEditingId(item.id);
    setName(item.name);
  };

  const openDeleteConfirm = (item: DocumentType) => {
    setDocumentTypeToDelete(item);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentTypeToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/document-types/${documentTypeToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Document type berhasil dihapus');
        fetchDocumentTypes();
      } else {
        toast.error(data.message || 'Gagal menghapus document type');
      }
    } catch (error) {
      console.error('Error deleting document type:', error);
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
      setDeleteAlertOpen(false);
      setDocumentTypeToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama document type wajib diisi');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const url = editingId
        ? `/api/document-types/${editingId}`
        : '/api/document-types';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          data.message ||
            (editingId
              ? 'Document type berhasil diperbarui'
              : 'Document type berhasil dibuat')
        );
        setDialogOpen(false);
        setEditingId(null);
        setName('');
        fetchDocumentTypes();
      } else {
        toast.error(data.message || 'Gagal menyimpan document type');
      }
    } catch (error) {
      console.error('Error saving document type:', error);
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDocumentTypes = useMemo(
    () =>
      documentTypes.filter((dt) =>
        dt.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      ),
    [documentTypes, searchTerm]
  );

  const paginatedDocumentTypes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocumentTypes.slice(start, start + pageSize);
  }, [filteredDocumentTypes, currentPage, pageSize]);

  return (
    <>
      <Card className={CARD_STYLE}>
        <CardContent className="px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div>
                <h4 className="mb-2 text-xl font-semibold">
                  Manage Document Type
                </h4>
                <Breadcrumb>
                  <BreadcrumbList className="text-muted-foreground">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Document Type</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Total Document Types
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {total || '-'}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 px-4 shadow-none bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleAddClick}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Document Type
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={CARD_STYLE}>
        <CardContent className="space-y-4 px-2 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/80 pb-3 px-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>entries per page</span>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search document types..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 pl-9 pr-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
              />
              {searchTerm.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide text-right text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Memuat data...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredDocumentTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDocumentTypes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-4 py-3 text-sm">
                        {item.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 w-7 p-0 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                            onClick={() => handleEditClick(item)}
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 w-7 p-0 bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                            onClick={() => openDeleteConfirm(item)}
                            disabled={isSubmitting}
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingId(null);
            setName('');
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Document Type' : 'Create New Document Type'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Perbarui informasi document type.'
                : 'Tambahkan document type baru.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="document-type-name">
                  Name
                </label>
                <Input
                  id="document-type-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Document type name"
                  className="h-9 bg-white"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="shadow-none bg-blue-500 text-white hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteAlertOpen}
        onOpenChange={(open) => {
          setDeleteAlertOpen(open);
          if (!open) {
            setDocumentTypeToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Document Type?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{documentTypeToDelete?.name}&quot; akan dihapus. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
