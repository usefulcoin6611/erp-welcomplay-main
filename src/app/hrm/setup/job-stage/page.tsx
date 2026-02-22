'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  DndContext,
  rectIntersection,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
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
import { ListChecks, Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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

const CARD_STYLE =
  'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white rounded-lg';

type JobStage = {
  id: string;
  name: string;
  order: number | null;
};

function SortableJobStageRow({
  stage,
  onEdit,
  onDelete,
}: {
  stage: JobStage;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const id = stage.id;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={{ ...style, touchAction: 'none' }}
      className={
        isDragging
          ? 'bg-sky-50/80'
          : 'hover:bg-slate-50 cursor-grab active:cursor-grabbing'
      }
      {...attributes}
      {...listeners}
      aria-label="Seret untuk mengubah urutan"
    >
      <TableCell className="px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">
            {stage.order ?? '-'}
          </span>
          <span className="font-medium">{stage.name}</span>
        </div>
      </TableCell>
      <TableCell className="px-4 sm:px-6 text-right">
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="shadow-none h-7 w-7 p-0 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
            onClick={onEdit}
            title="Edit"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="shadow-none h-7 w-7 p-0 bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function ManageJobStagePage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [stages, setStages] = useState<JobStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [deleteStage, setDeleteStage] = useState<JobStage | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, {}),
  );

  const sortedStages = useMemo(
    () =>
      [...stages].sort((a, b) => {
        const ao = a.order ?? 0;
        const bo = b.order ?? 0;
        if (ao !== bo) return ao - bo;
        return a.name.localeCompare(b.name);
      }),
    [stages],
  );

  const filteredStages = useMemo(
    () =>
      sortedStages.filter((stage) =>
        stage.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      ),
    [sortedStages, searchTerm],
  );

  const total = stages.length;
  const stageIds = filteredStages.map((s) => s.id);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/job-stages');
        if (!res.ok) {
          throw new Error('Failed to fetch job stages');
        }
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.message || 'Gagal mengambil data job stage');
        }
        setStages(json.data ?? []);
      } catch (error: any) {
        toast.error(error.message || 'Gagal mengambil data job stage');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStages();
  }, []);

  if (!hasMounted) {
    return null;
  }

  const resetForm = () => {
    setEditingId(null);
    setName('');
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (stage: JobStage) => {
    setEditingId(stage.id);
    setName(stage.name);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama job stage wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { name: name.trim() };

      if (editingId) {
        const res = await fetch(`/api/job-stages/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Gagal memperbarui job stage');
        }
        toast.success(json.message || 'Job stage berhasil diperbarui');
      } else {
        const res = await fetch('/api/job-stages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Gagal membuat job stage');
        }
        toast.success(json.message || 'Job stage berhasil dibuat');
      }

      const res = await fetch('/api/job-stages');
      const refreshed = await res.json();
      setStages(refreshed.data ?? []);
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteStage) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/job-stages/${deleteStage.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menghapus job stage');
      }
      toast.success(json.message || 'Job stage berhasil dihapus');
      const resReload = await fetch('/api/job-stages');
      const refreshed = await resReload.json();
      setStages(refreshed.data ?? []);
      setDeleteStage(null);
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredStages.findIndex((s) => s.id === active.id);
    const newIndex = filteredStages.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedFiltered = arrayMove(filteredStages, oldIndex, newIndex);
    const newOrderMap = new Map<string, number>();
    reorderedFiltered.forEach((stage, index) => {
      newOrderMap.set(stage.id, index + 1);
    });

    const updatedAll = stages.map((stage) => {
      const newOrder = newOrderMap.get(stage.id);
      if (newOrder == null) return stage;
      return { ...stage, order: newOrder };
    });

    setStages(updatedAll);
    setIsReordering(true);

    try {
      const ids = [...updatedAll]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => s.id);

      const res = await fetch('/api/job-stages/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal memperbarui urutan job stage');
      }
      toast.success(json.message || 'Urutan job stage berhasil diperbarui');
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat memperbarui urutan');
      const res = await fetch('/api/job-stages');
      const refreshed = await res.json();
      setStages(refreshed.data ?? []);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <>
      <Card className={CARD_STYLE}>
        <CardContent className="px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div>
                <h4 className="mb-2 text-xl font-semibold">Manage Job Stage</h4>
                <Breadcrumb>
                  <BreadcrumbList className="text-muted-foreground">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Job Stage</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ListChecks className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Total Job Stages
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {isLoading ? '-' : total || '-'}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 px-4 shadow-none bg-blue-500 text-white hover:bg-blue-600"
              onClick={openCreateDialog}
              disabled={isSubmitting}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Job Stage
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={CARD_STYLE}>
        <CardContent className="space-y-4 px-2 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/80 pb-3 px-2">
            <div className="text-sm text-muted-foreground">
              Drag & drop untuk mengubah urutan job stage.
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search job stages..."
                className="h-9 pl-9 pr-3 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden bg-white">
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60%] px-4 sm:px-6">Name</TableHead>
                    <TableHead className="w-[40%] px-4 sm:px-6 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : filteredStages.length === 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60%] px-4 sm:px-6">Name</TableHead>
                    <TableHead className="w-[40%] px-4 sm:px-6 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No entries found
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <DndContext
                collisionDetection={rectIntersection}
                modifiers={[restrictToVerticalAxis]}
                sensors={sensors}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={stageIds}
                  strategy={verticalListSortingStrategy}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60%] px-4 sm:px-6">Name</TableHead>
                        <TableHead className="w-[40%] px-4 sm:px-6 text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStages.map((stage) => (
                        <SortableJobStageRow
                          key={stage.id}
                          stage={stage}
                          onEdit={() => handleEdit(stage)}
                          onDelete={() => setDeleteStage(stage)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </SortableContext>
              </DndContext>
            )}
          </div>
          {isReordering && (
            <p className="text-xs text-muted-foreground px-2">
              Menyimpan urutan baru...
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Job Stage' : 'Add Job Stage'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Perbarui informasi job stage.'
                : 'Tambahkan job stage baru sesuai reference-erp.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-stage-name">Name</Label>
              <Input
                id="job-stage-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="shadow-none"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 text-white hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {editingId ? 'Save Changes' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteStage}
        onOpenChange={(open) => {
          if (!open) setDeleteStage(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Job Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus job stage{' '}
              <span className="font-semibold">{deleteStage?.name}</span>? Tindakan
              ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
        <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
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
