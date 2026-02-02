'use client';

import { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
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
import { Search, Plus, Pencil, Trash2, X, ArrowUpDown } from 'lucide-react';

interface Branch {
  id: number;
  name: string;
}

const defaultFormData = { name: '' };

/** reference-erp branch/index: no search, Create in row above card (mb-4 d-flex justify-content-end), card only table */
type BranchTabVariant = 'tab' | 'page';

export type BranchTabRef = { openCreate: () => void };

const BranchTabInner = function BranchTabInner(
  { variant = 'tab' }: { variant?: BranchTabVariant },
  ref: React.Ref<BranchTabRef>
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const [branches, setBranches] = useState<Branch[]>([
    { id: 1, name: 'Head Office' },
    { id: 2, name: 'Jakarta Branch' },
    { id: 3, name: 'Surabaya Branch' },
    { id: 4, name: 'Bandung Branch' },
    { id: 5, name: 'Bali Branch' },
  ]);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const isPageMode = variant === 'page';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (editingId !== null) {
      setBranches(
        branches.map((b) => (b.id === editingId ? { ...b, name: formData.name.trim() } : b))
      );
    } else {
      const newBranch: Branch = {
        id: Math.max(0, ...branches.map((b) => b.id)) + 1,
        name: formData.name.trim(),
      };
      setBranches([...branches, newBranch]);
    }
    handleDialogOpenChange(false);
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

  const handleConfirmDelete = () => {
    if (branchToDelete) {
      setBranches(branches.filter((b) => b.id !== branchToDelete.id));
      setBranchToDelete(null);
    }
    setDeleteAlertOpen(false);
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
      {/* Page mode: satu card dengan pagination (kiri) + Search (kanan) di dalam card, lalu tabel */}
      <Card className={CARD_STYLE}>
        {isPageMode && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/80 px-6 py-3">
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
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 pl-3 pr-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
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
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        {!isPageMode && (
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 py-3.5">
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
              className="h-8 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </CardHeader>
        )}
        <CardContent className={isPageMode ? 'p-0' : undefined}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 font-normal uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1">
                      Branch
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                  </TableHead>
                  <TableHead className="px-4 py-3 font-normal uppercase tracking-wide w-[200px] text-right">
                    <span className="inline-flex items-center gap-1 justify-end">
                      Action
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayBranches.length === 0 ? (
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
                      <TableCell className="px-4 py-3 text-sm font-medium">
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

      {/* reference-erp branch/create & edit: Name* (Enter Branch Name), Cancel, Create / Update */}
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="blue" className="shadow-none">
                {editingId !== null ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi hapus - style project: AlertDialog seperti support */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={(open) => { setDeleteAlertOpen(open); if (!open) setBranchToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Branch?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{branchToDelete?.name}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
};

const BranchTab = forwardRef(BranchTabInner) as (
  props: { variant?: BranchTabVariant } & { ref?: React.Ref<BranchTabRef> }
) => React.ReactElement;
export default BranchTab;
