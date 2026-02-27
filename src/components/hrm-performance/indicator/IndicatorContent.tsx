'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, TrendingUp, Eye, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { StarRatingDisplay } from '../StarRatingDisplay';
import {
  Dialog,
  DialogContent,
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
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

const ALL_YEAR_VALUE = 'all';
const YEAR_OPTIONS = Array.from({ length: 10 }, (_v, i) => new Date().getFullYear() - i);

interface Indicator {
  id: string;
  branch: string;
  department: string;
  designation: string;
  overallRating: number;
  addedBy: string;
  createdAt: string;
  periodYear?: number | null;
  periodQuarter?: number | null;
  appraisalCount?: number;
  avgAppraisalRating?: number | null;
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
    periodYear: '',
    periodQuarter: '',
  });

  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [designations, setDesignations] = useState<{ id: string; name: string }[]>([]);
  const [viewItem, setViewItem] = useState<Indicator | null>(null);
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterQuarter, setFilterQuarter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchIndicators = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterYear) params.set('year', filterYear);
      if (filterQuarter) params.set('quarter', filterQuarter);
      const qs = params.toString();
      const res = await fetch(`/api/hrm/performance/indicators${qs ? `?${qs}` : ''}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setIndicators(json.data);
      else toast.error(json.message ?? 'Gagal memuat indikator');
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat indikator');
    } finally {
      setLoading(false);
    }
  }, [filterYear, filterQuarter]);

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
    const now = new Date();
    const year = now.getFullYear().toString();
    const quarter = (Math.floor(now.getMonth() / 3) + 1).toString();
    setShowForm(true);
    setEditingId(null);
    setFormData({
      branch: '',
      department: '',
      designation: '',
      technicalRating: '',
      organizationalRating: '',
      customerExperienceRating: '',
      periodYear: year,
      periodQuarter: quarter,
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
        periodYear: parseInt(formData.periodYear, 10),
        periodQuarter: parseInt(formData.periodQuarter, 10),
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
      periodYear: item.periodYear ? String(item.periodYear) : '',
      periodQuarter: item.periodQuarter ? String(item.periodQuarter) : '',
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

  const handleView = (id: string) => {
    const item = indicators.find((indicator) => indicator.id === id);
    if (!item) {
      toast.error('Indikator tidak ditemukan');
      return;
    }
    setViewItem(item);
  };

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

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Summary + Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_minmax(0,1fr)] gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
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
        </div>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="space-y-3">
              <p className="text-sm font-medium">Filter Periode</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Year</Label>
                  <Select
                    value={filterYear || ALL_YEAR_VALUE}
                    onValueChange={(value) => {
                      if (value === ALL_YEAR_VALUE) {
                        setFilterYear('');
                      } else {
                        setFilterYear(value);
                      }
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_YEAR_VALUE}>All Years</SelectItem>
                      {YEAR_OPTIONS.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Quarter</Label>
                  <Select
                    value={filterQuarter}
                    onValueChange={(value) => {
                      setFilterQuarter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Q1</SelectItem>
                      <SelectItem value="2">Q2</SelectItem>
                      <SelectItem value="3">Q3</SelectItem>
                      <SelectItem value="4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

      {/* Add/Edit Modal */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (submitting) return;
          setShowForm(open);
          if (!open) {
            setEditingId(null);
            setFormData({
              branch: '',
              department: '',
              designation: '',
              technicalRating: '',
              organizationalRating: '',
              customerExperienceRating: '',
              periodYear: '',
              periodQuarter: '',
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Create New'} Indicator</DialogTitle>
          </DialogHeader>
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
              <div className="space-y-2">
                <Label htmlFor="periodYear">Period Year</Label>
                <Input
                  id="periodYear"
                  type="number"
                  min="2000"
                  max="2100"
                  value={formData.periodYear}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, periodYear: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodQuarter">Quarter</Label>
                <Select
                  value={formData.periodQuarter}
                  onValueChange={(value) => setFormData({ ...formData, periodQuarter: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1</SelectItem>
                    <SelectItem value="2">Q2</SelectItem>
                    <SelectItem value="3">Q3</SelectItem>
                    <SelectItem value="4">Q4</SelectItem>
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

            <DialogFooter className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700 shadow-none"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Indicator List - reference: indicator/index */}
      <Card className={cardClass}>
        <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Manage Indicator</h3>
          <div className="relative w-full max-w-[280px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by branch, department, or designation..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground px-4 py-3">
                    No indicators found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((indicator) => (
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
          <div className="flex items-center justify-between gap-4 px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page</span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[60px]">
                    <SelectItem value="5" className="justify-center">5</SelectItem>
                    <SelectItem value="10" className="justify-center">10</SelectItem>
                    <SelectItem value="20" className="justify-center">20</SelectItem>
                    <SelectItem value="50" className="justify-center">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="h-8 w-8">
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="h-8 w-8">
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Detail Modal */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Indicator Detail</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Branch</p>
                  <p className="text-sm font-medium">{viewItem.branch}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-medium">{viewItem.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Designation</p>
                  <p className="text-sm font-medium">{viewItem.designation}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created At</p>
                  <p className="text-sm font-medium">{viewItem.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Period</p>
                  <p className="text-sm font-medium">
                    {viewItem.periodYear ? `${viewItem.periodYear} Q${viewItem.periodQuarter ?? "-"}` : "-"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Overall Rating</p>
                <StarRatingDisplay rating={viewItem.overallRating} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Added By</p>
                <p className="text-sm font-medium">{viewItem.addedBy}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Linked Appraisals</p>
                  <p className="text-sm font-medium">{viewItem.appraisalCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Avg Employee Overall Rating</p>
                  <p className="text-sm font-medium">
                    {viewItem.avgAppraisalRating != null ? viewItem.avgAppraisalRating.toFixed(1) : "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
