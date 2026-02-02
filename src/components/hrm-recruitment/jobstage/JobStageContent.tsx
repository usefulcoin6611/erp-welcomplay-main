'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getJobStagesList,
  addJobStage,
  updateJobStage,
  removeJobStageById,
} from '@/lib/recruitment-data';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

export function JobStageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stages, setStages] = useState(() => getJobStagesList());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);

  const refreshStages = () => setStages([...getJobStagesList()]);

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormTitle('');
  };

  const handleEdit = (item: { id: string; title: string }) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormTitle(item.title);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateJobStage(editingId, { title: formTitle });
    } else {
      addJobStage({ title: formTitle });
    }
    refreshStages();
    setShowForm(false);
    setFormTitle('');
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteStageId(id);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteStageId) {
      removeJobStageById(deleteStageId);
      refreshStages();
      setDeleteStageId(null);
    }
    setDeleteAlertOpen(false);
  };

  const filteredData = stages.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stages</p>
                <p className="text-2xl font-bold">{stages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end items-center">
        <Button onClick={handleAdd} className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
          <Plus className="w-4 h-4 mr-2" />
          Create Job Stage
        </Button>
      </div>

      <Card className={cardClass}>
        <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Manage Job Stage</h3>
          <div className="relative w-full max-w-[280px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search stage..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 pr-9 border-0 bg-gray-50 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">#</TableHead>
                <TableHead className="px-4 py-3">Stage</TableHead>
                <TableHead className="px-4 py-3 text-right w-[140px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground px-4">
                    No stages found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((stage, index) => (
                  <TableRow key={stage.id}>
                    <TableCell className="px-4 py-3 text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="px-4 py-3 font-medium">{stage.title}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(stage)}
                          title="Edit"
                          className="h-7 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteConfirm(stage.id)}
                          title="Delete"
                          className="h-7 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px] p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Create New'} Job Stage</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Stage</Label>
              <Input
                value={formTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormTitle(e.target.value)}
                placeholder="e.g. Applied, Interview"
                className="h-9"
                required
              />
            </div>
            <DialogFooter className="gap-2 pt-3">
              <Button type="submit" className="h-9 bg-blue-600 hover:bg-blue-700 shadow-none">
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" className="h-9" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Job Stage?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Stage akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2">
            <AlertDialogCancel type="button">Batal</AlertDialogCancel>
            <AlertDialogAction type="button" onClick={handleDeleteConfirm}>
              <span>Hapus</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
