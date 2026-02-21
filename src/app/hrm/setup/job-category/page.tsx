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
import {
  BriefcaseBusiness,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const CARD_STYLE =
  'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white rounded-lg';

interface JobCategory {
  id: string;
  name: string;
}

export default function ManageJobCategoryPage() {
  const [items, setItems] = useState<JobCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<JobCategory | null>(null);

  const total = items.length;

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/job-categories');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      } else {
        toast.error(data.message || 'Gagal memuat job category');
      }
    } catch (error) {
      console.error('Error fetching job categories:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddClick = () => {
    setDialogOpen(true);
    setEditingId(null);
    setName('');
  };

  const handleEditClick = (item: JobCategory) => {
    setDialogOpen(true);
    setEditingId(item.id);
    setName(item.name);
  };

  const openDeleteConfirm = (item: JobCategory) => {
    setItemToDelete(item);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/job-categories/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Job category berhasil dihapus');
        fetchItems();
      } else {
        toast.error(data.message || 'Gagal menghapus job category');
      }
    } catch (error) {
      console.error('Error deleting job category:', error);
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
      setDeleteAlertOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama job category wajib diisi');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const url = editingId
        ? `/api/job-categories/${editingId}`
        : '/api/job-categories';
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
              ? 'Job category berhasil diperbarui'
              : 'Job category berhasil dibuat')
        );
        setDialogOpen(false);
        setEditingId(null);
        setName('');
        fetchItems();
      } else {
        toast.error(data.message || 'Gagal menyimpan job category');
      }
    } catch (error) {
      console.error('Error saving job category:', error);
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      ),
    [items, searchTerm]
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  return (
    <>
      <Card className={CARD_STYLE}>
        <CardContent className="px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div>
                <h4 className="mb-2 text-xl font-semibold">Manage Job Category</h4>
                <Breadcrumb>
                  <BreadcrumbList className="text-muted-foreground">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Job Category</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BriefcaseBusiness className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Total Job Categories
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
              Add Job Category
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
                placeholder="Search job categories..."
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
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item) => (
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

          {filteredItems.length > pageSize && (
            <div className="flex items-center justify-between border-t border-gray-200/80 pt-3 px-2 text-xs text-muted-foreground">
              <div>
                Page {currentPage} of{' '}
                {Math.max(1, Math.ceil(filteredItems.length / pageSize))}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3"
                  disabled={
                    currentPage === Math.ceil(filteredItems.length / pageSize)
                  }
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        Math.ceil(filteredItems.length / pageSize) || 1,
                        prev + 1
                      )
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Job Category' : 'Add Job Category'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Perbarui informasi job category.'
                : 'Tambahkan job category baru untuk HRM system.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="job-category-name"
                className="text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <Input
                id="job-category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Full-time, Part-time"
                className="bg-white"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isSubmitting) return;
                  setDialogOpen(false);
                  setEditingId(null);
                  setName('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 text-white hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingId ? 'Save Changes' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus job category?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data job category akan dihapus
              permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
