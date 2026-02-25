'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, TrendingUp, Eye, Loader2 } from 'lucide-react';
import { StarRatingDisplay } from '../StarRatingDisplay';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

interface Indicator {
  id: string;
  branch: string;
  department: string;
  designation: string;
  overallRating: number;
  addedBy: string;
  createdAt: string;
}

export function IndicatorContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    branch: '',
    department: '',
    designation: '',
    technicalRating: '',
    organizationalRating: '',
    customerExperienceRating: '',
  });

  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [designations, setDesignations] = useState<{ id: string; name: string }[]>([]);

  const fetchIndicators = useCallback(async () => {
    try {
      const res = await fetch('/api/hrm/performance/indicators');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setIndicators(json.data);
      else toast.error(json.message ?? 'Gagal memuat indikator');
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat indikator');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndicators();
  }, [fetchIndicators]);

  useEffect(() => {
    (async () => {
      try {
        const [bRes, dRes, gRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/departments'),
          fetch('/api/designations'),
        ]);
        const bJson = await bRes.json();
        const dJson = await dRes.json();
        const gJson = await gRes.json();
        if (bJson.success && Array.isArray(bJson.data)) setBranches(bJson.data);
        if (dJson.success && Array.isArray(dJson.data)) setDepartments(dJson.data);
        if (gJson.success && Array.isArray(gJson.data)) setDesignations(gJson.data);
      } catch (_e) {}
    })();
  }, []);

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      branch: '',
      department: '',
      designation: '',
      technicalRating: '',
      organizationalRating: '',
      customerExperienceRating: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        branch: formData.branch,
        department: formData.department,
        designation: formData.designation,
        technicalRating: parseFloat(formData.technicalRating),
        organizationalRating: parseFloat(formData.organizationalRating),
        customerExperienceRating: parseFloat(formData.customerExperienceRating),
        addedBy: 'Admin',
      };
      const url = editingId ? `/api/hrm/performance/indicators/${editingId}` : '/api/hrm/performance/indicators';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? (editingId ? 'Indikator berhasil diperbarui' : 'Indikator berhasil dibuat'));
        setShowForm(false);
        setEditingId(null);
        fetchIndicators();
      } else toast.error(json.message ?? 'Gagal menyimpan');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Indicator) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      branch: item.branch,
      department: item.department,
      designation: item.designation,
      technicalRating: '',
      organizationalRating: '',
      customerExperienceRating: '',
    });
  };

  const openDelete = (id: string) => setDeleteId(id);
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/hrm/performance/indicators/${deleteId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? 'Indikator berhasil dihapus');
        setDeleteId(null);
        fetchIndicators();
      } else toast.error(json.message ?? 'Gagal menghapus');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus');
    } finally {
      setDeleting(false);
    }
  };

  const handleView = (_id: string) => toast.info('Detail indikator akan tersedia di versi berikutnya.');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filteredData = indicators.filter(
    (indicator) =>
      indicator.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Indicators</p>
                <p className="text-2xl font-bold">{indicators.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-blue-600">
                  {indicators.length > 0
                    ? (indicators.reduce((sum, ind) => sum + ind.overallRating, 0) / indicators.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Performers</p>
                <p className="text-2xl font-bold text-green-600">
                  {indicators.filter((ind) => ind.overallRating >= 4.5).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Improvement</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {indicators.filter((ind) => ind.overallRating < 3.5).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end items-center">
        <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 shadow-none">
          <Plus className="w-4 h-4 mr-2" />
          Create Indicator
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create New'} Indicator</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Select
                    value={formData.designation}
                    onValueChange={(value) => setFormData({ ...formData, designation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((g) => (
                        <SelectItem key={g.id} value={g.name}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="technicalRating">Technical Rating (1-5)</Label>
                  <Input
                    id="technicalRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.technicalRating}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, technicalRating: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizationalRating">Organizational Rating (1-5)</Label>
                  <Input
                    id="organizationalRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.organizationalRating}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, organizationalRating: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerExperienceRating">Customer Experience Rating (1-5)</Label>
                  <Input
                    id="customerExperienceRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.customerExperienceRating}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, customerExperienceRating: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 shadow-none" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? 'Update' : 'Create')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Indicator List - reference: indicator/index */}
      <Card className={cardClass}>
        <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Manage Indicator</h3>
          <div className="relative w-full max-w-[280px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by branch, department, or designation..."
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
                <TableHead className="px-4 py-3">Department</TableHead>
                <TableHead className="px-4 py-3">Designation</TableHead>
                <TableHead className="px-4 py-3 text-center">Overall Rating</TableHead>
                <TableHead className="px-4 py-3">Added By</TableHead>
                <TableHead className="px-4 py-3">Created At</TableHead>
                <TableHead className="px-4 py-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground px-4 py-3">
                    No indicators found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((indicator) => (
                  <TableRow key={indicator.id}>
                    <TableCell className="px-4 py-3 font-medium">{indicator.branch}</TableCell>
                    <TableCell className="px-4 py-3">{indicator.department}</TableCell>
                    <TableCell className="px-4 py-3">{indicator.designation}</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <StarRatingDisplay rating={indicator.overallRating} />
                    </TableCell>
                    <TableCell className="px-4 py-3">{indicator.addedBy}</TableCell>
                    <TableCell className="px-4 py-3">{indicator.createdAt}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(indicator.id)}
                          title="View"
                          className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(indicator)}
                          title="Edit"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDelete(indicator.id)}
                          title="Delete"
                          className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus indikator?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
