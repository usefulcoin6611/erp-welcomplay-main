'use client';

import { useState, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Pencil, Trash2, X, ArrowUpDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Branch {
  id: string;
  name: string;
}

const defaultFormData = { name: '' };

type BranchTabVariant = 'tab' | 'page';

type BranchTabProps = {
  variant?: BranchTabVariant;
  onCountChange?: (count: number) => void;
};

export type BranchTabRef = { openCreate: () => void };

const BranchTabInner = function BranchTabInner(
  { variant = 'tab', onCountChange }: BranchTabProps,
  ref: React.Ref<BranchTabRef>
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const isPageMode = variant === 'page';

  // Fetch branches on mount
  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/branches');
      const result = await response.json();
      if (result.success) {
        setBranches(result.data);
        if (onCountChange) {
          onCountChange(result.data.length);
        }
      } else {
        toast.error(result.message || 'Gagal memuat data branch');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setFormData(defaultFormData);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  useImperativeHandle(ref, () => ({ openCreate: handleAdd }), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/branches/${editingId}` : '/api/branches';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        fetchBranches();
        handleDialogOpenChange(false);
      } else {
        toast.error(result.message || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (branch: Branch) => {
    setFormData({ name: branch.name });
    setEditingId(branch.id);
    setDialogOpen(true);
  };

  const openDeleteConfirm = (branch: Branch) => {
    setBranchToDelete(branch);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!branchToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/branches/${branchToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        fetchBranches();
      } else {
        toast.error(result.message || 'Gagal menghapus data');
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsSubmitting(false);
      setDeleteAlertOpen(false);
      setBranchToDelete(null);
    }
  };

  const filteredBranches = useMemo(
    () =>
      branches.filter((b) =>
        b.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      ),
    [branches, searchTerm]
  );

  const paginatedBranches = useMemo(() => {
    if (!isPageMode) return filteredBranches;
    const start = (currentPage - 1) * pageSize;
    return filteredBranches.slice(start, start + pageSize);
  }, [isPageMode, filteredBranches, currentPage, pageSize]);

  const displayBranches = isPageMode ? paginatedBranches : filteredBranches;
  const CARD_STYLE =
    'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white rounded-lg';

  return (
    <>
      <Card className={CARD_STYLE}>
        {isPageMode && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/80 px-2 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
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
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 pl-9 pr-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
              />
              {searchTerm.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
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
        )}
        {!isPageMode && (
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-4 py-3.5">
            <div className="flex w-full max-w-md items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search branches..."
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
              className="h-8 px-4 shadow-none bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Branch
            </Button>
          </CardHeader>
        )}
        <CardContent className={isPageMode ? 'space-y-4 px-2 pb-4 pt-2' : undefined}>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground">
                    Branch
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide w-[200px] text-right text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : displayBranches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="px-4 py-8 text-center text-muted-foreground text-sm"
                    >
                      {isPageMode ? 'No entries found' : 'No branches found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="px-4 py-3 text-sm">
                        {branch.name}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                            onClick={() => handleEdit(branch)}
                            title="Edit"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                            onClick={() => openDeleteConfirm(branch)}
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

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? 'Edit Branch' : 'Create New Branch'}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null
                ? 'Update branch name.'
                : 'Add new branch. Enter branch name.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Enter Branch Name"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleDialogOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="blue" className="shadow-none" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId !== null ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={(open) => { if (!isSubmitting) { setDeleteAlertOpen(open); if (!open) setBranchToDelete(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Branch?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{branchToDelete?.name}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const BranchTab = forwardRef(BranchTabInner) as (
  props: BranchTabProps & { ref?: React.Ref<BranchTabRef> }
) => React.ReactElement;
export default BranchTab;
