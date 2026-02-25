'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

interface Trainer {
  id: string;
  branch: string;
  firstName: string;
  lastName: string;
  contact: string;
  email: string;
  expertise: string;
  address?: string;
}

export function TrainerContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTrainer, setEditTrainer] = useState<Trainer | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteTrainerId, setDeleteTrainerId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    branch: '',
    firstName: '',
    lastName: '',
    contact: '',
    email: '',
    expertise: '',
    address: '',
  });

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  const fetchTrainers = useCallback(async () => {
    try {
      const res = await fetch('/api/hrm/training/trainers');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTrainers(json.data);
      } else {
        toast.error(json.message ?? 'Gagal memuat trainer');
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat trainer');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/branches');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setBranches(json.data);
        }
      } catch {
        // ignore, dropdown will be empty
      }
    })();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      branch: '',
      firstName: '',
      lastName: '',
      contact: '',
      email: '',
      expertise: '',
      address: '',
    });
    setEditTrainer(null);
    setEditDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToUpdate = editTrainer?.id ?? editingId;

    const payload = {
      branch: formData.branch,
      firstName: formData.firstName,
      lastName: formData.lastName,
      contact: formData.contact,
      email: formData.email,
      expertise: formData.expertise || undefined,
      address: formData.address || undefined,
    };

    setSubmitting(true);
    try {
      const url = idToUpdate
        ? `/api/hrm/training/trainers/${idToUpdate}`
        : '/api/hrm/training/trainers';
      const method = idToUpdate ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          json.message ?? (idToUpdate ? 'Trainer berhasil diperbarui' : 'Trainer berhasil dibuat'),
        );
        setEditDialogOpen(false);
        setEditTrainer(null);
        setEditingId(null);
        setFormData({
          branch: '',
          firstName: '',
          lastName: '',
          contact: '',
          email: '',
          expertise: '',
          address: '',
        });
        fetchTrainers();
      } else {
        toast.error(json.message ?? 'Gagal menyimpan trainer');
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan trainer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Trainer) => {
    setEditTrainer(item);
    setFormData({
      branch: item.branch,
      firstName: item.firstName,
      lastName: item.lastName,
      contact: item.contact,
      email: item.email,
      expertise: item.expertise,
      address: item.address ?? '',
    });
    setEditDialogOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteTrainerId(id);
    setDeleteAlertOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/hrm/training/trainers/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? 'Trainer berhasil dihapus');
        setDeleteTrainerId(null);
        setDeleteAlertOpen(false);
        fetchTrainers();
      } else {
        toast.error(json.message ?? 'Gagal menghapus trainer');
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus trainer');
    } finally {
      setDeleting(false);
    }
  };

  const filteredData = trainers.filter(
    (trainer) =>
      trainer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading trainers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trainers</p>
                <p className="text-2xl font-bold">{trainers.length}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Head Office</p>
                <p className="text-2xl font-bold text-blue-600">
                  {trainers.filter((t) => t.branch === 'Head Office').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Branches</p>
                <p className="text-2xl font-bold text-green-600">
                  {trainers.filter((t) => t.branch !== 'Head Office').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end items-center">
        <Button onClick={handleAdd} className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
          <Plus className="w-4 h-4 mr-2" />
          Create Trainer
        </Button>
      </div>

      {/* Trainer List - reference: support */}
      <Card className={cardClass}>
        <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Manage Trainer</h3>
          <div className="relative w-full max-w-[280px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, email, or branch..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">Branch</TableHead>
                <TableHead className="px-4 py-3">Full Name</TableHead>
                <TableHead className="px-4 py-3">Contact</TableHead>
                <TableHead className="px-4 py-3">Email</TableHead>
                <TableHead className="px-4 py-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground px-4 py-3">
                    No trainers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((trainer) => (
                  <TableRow key={trainer.id}>
                    <TableCell className="px-4 py-3 font-medium">{trainer.branch}</TableCell>
                    <TableCell className="px-4 py-3">{`${trainer.firstName} ${trainer.lastName}`}</TableCell>
                    <TableCell className="px-4 py-3">{trainer.contact}</TableCell>
                    <TableCell className="px-4 py-3">{trainer.email}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(trainer)}
                          title="Edit"
                          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteConfirm(trainer.id)}
                          title="Delete"
                          className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
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

      {/* Edit dialog - reference-erp: Branch, First/Last Name, Contact, Email, Expertise (optional), Address */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditTrainer(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle>{editTrainer ? 'Edit Trainer' : 'Create Trainer'}</DialogTitle>
            <DialogDescription>
              {editTrainer ? `${editTrainer.firstName} ${editTrainer.lastName}` : 'Create new trainer'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label>Branch</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(v) => setFormData((f) => ({ ...f, branch: v }))}
                  >
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">Belum ada branch? <Link href="/hrm/branch" className="underline">Create branch</Link></p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>First Name</Label>
                    <Input className="h-9" value={formData.firstName} onChange={(e) => setFormData((f) => ({ ...f, firstName: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last Name</Label>
                    <Input className="h-9" value={formData.lastName} onChange={(e) => setFormData((f) => ({ ...f, lastName: e.target.value }))} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Contact</Label>
                    <Input className="h-9" value={formData.contact} onChange={(e) => setFormData((f) => ({ ...f, contact: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input className="h-9" type="email" value={formData.email} onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Expertise</Label>
                  <Textarea
                    className="min-h-[60px]"
                    value={formData.expertise}
                    onChange={(e) => setFormData((f) => ({ ...f, expertise: e.target.value }))}
                    placeholder="e.g., Technical Skills, Leadership"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Textarea
                    className="min-h-[60px]"
                    value={formData.address}
                    onChange={(e) => setFormData((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Alamat trainer"
                  />
                </div>
              </div>
            <DialogFooter className="pt-3 mt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700 shadow-none"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : editTrainer ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation - reference-erp */}
      <AlertDialog
        open={deleteAlertOpen}
        onOpenChange={(open) => {
          setDeleteAlertOpen(open);
          if (!open) setDeleteTrainerId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus trainer?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin melanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2">
            <AlertDialogCancel type="button">Batal</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={() => deleteTrainerId && handleDelete(deleteTrainerId)}
              disabled={deleting}
            >
              <span>{deleting ? 'Menghapus...' : 'Hapus'}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
