'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Target, Loader2, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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

interface GoalTracking {
  id: string;
  goalType: string;
  subject: string;
  branch: string;
  targetAchievement: string;
  startDate: string;
  endDate: string;
  rating: number;
  progress: number;
  status?: string;
}

export function GoalTrackingContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    goalType: '',
    subject: '',
    branch: '',
    targetAchievement: '',
    startDate: '',
    endDate: '',
    rating: '',
    progress: '',
  });

  const [goalTrackings, setGoalTrackings] = useState<GoalTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [goalTypes, setGoalTypes] = useState<{ id: string; name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [viewItem, setViewItem] = useState<GoalTracking | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/hrm/performance/goals');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setGoalTrackings(json.data.map((g: { goalType?: string; goalTypeId: string } & GoalTracking) => ({ ...g, goalType: g.goalType ?? '' })));
      else toast.error(json.message ?? 'Gagal memuat goal');
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat goal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  useEffect(() => {
    (async () => {
      try {
        const [gRes, bRes] = await Promise.all([fetch('/api/goal-types'), fetch('/api/branches')]);
        const gJson = await gRes.json();
        const bJson = await bRes.json();
        if (gJson.success && Array.isArray(gJson.data)) setGoalTypes(gJson.data);
        if (bJson.success && Array.isArray(bJson.data)) setBranches(bJson.data);
      } catch (_e) {}
    })();
  }, []);

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      goalType: '',
      subject: '',
      branch: '',
      targetAchievement: '',
      startDate: '',
      endDate: '',
      rating: '',
      progress: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const editingItem = editingId ? goalTrackings.find((g) => g.id === editingId) as GoalTracking & { goalTypeId?: string } : null;
    const goalTypeId = goalTypes.find((g) => g.name === formData.goalType)?.id ?? editingItem?.goalTypeId ?? formData.goalType;
    const branchName = branches.find((b) => b.name === formData.branch)?.name ?? formData.branch;
    setSubmitting(true);
    try {
      const payload = {
        goalTypeId,
        subject: formData.subject,
        branch: branchName,
        targetAchievement: formData.targetAchievement,
        startDate: formData.startDate,
        endDate: formData.endDate,
        rating: parseInt(formData.rating, 10),
        progress: parseInt(formData.progress, 10),
      };
      const url = editingId ? `/api/hrm/performance/goals/${editingId}` : '/api/hrm/performance/goals';
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? (editingId ? 'Goal berhasil diperbarui' : 'Goal berhasil dibuat'));
        setShowForm(false);
        setEditingId(null);
        fetchGoals();
      } else toast.error(json.message ?? 'Gagal menyimpan');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: GoalTracking) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      goalType: item.goalType,
      subject: item.subject,
      branch: item.branch,
      targetAchievement: item.targetAchievement,
      startDate: item.startDate,
      endDate: item.endDate,
      rating: item.rating.toString(),
      progress: item.progress.toString(),
    });
  };

  const openDelete = (id: string) => setDeleteId(id);
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/hrm/performance/goals/${deleteId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? 'Goal berhasil dihapus');
        setDeleteId(null);
        fetchGoals();
      } else toast.error(json.message ?? 'Gagal menghapus');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus');
    } finally {
      setDeleting(false);
    }
  };

  const handleView = (id: string) => {
    const item = goalTrackings.find((goal) => goal.id === id);
    if (!item) {
      toast.error('Goal tracking tidak ditemukan');
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

  const filteredData = goalTrackings.filter(
    (goal) =>
      goal.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.goalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Planned':
        return 'bg-slate-50 text-slate-700 border-slate-100';
      case 'Overdue':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">{goalTrackings.length}</p>
              </div>
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {goalTrackings.length > 0
                    ? Math.round(goalTrackings.reduce((sum, goal) => sum + goal.progress, 0) / goalTrackings.length)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-green-600">
                  {goalTrackings.filter((goal) => goal.progress >= 60).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold text-red-600">
                  {goalTrackings.filter((goal) => goal.progress < 40).length}
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
          Create Goal Tracking
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
              goalType: '',
              subject: '',
              branch: '',
              targetAchievement: '',
              startDate: '',
              endDate: '',
              rating: '',
              progress: '',
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Create New'} Goal Tracking</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalType">Goal Type</Label>
                <Select
                  value={formData.goalType}
                  onValueChange={(value) => setFormData({ ...formData, goalType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalTypes.map((g) => (
                      <SelectItem key={g.id} value={g.name}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAchievement">Target Achievement</Label>
                <Input
                  id="targetAchievement"
                  value={formData.targetAchievement}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, targetAchievement: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, progress: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Select value={formData.rating} onValueChange={(value) => setFormData({ ...formData, rating: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <SelectItem key={r} value={r.toString()}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* View Detail Modal */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Goal Tracking Detail</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Goal Type</p>
                  <p className="text-sm font-medium">{viewItem.goalType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="text-sm font-medium">{viewItem.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Branch</p>
                  <p className="text-sm font-medium">{viewItem.branch}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target Achievement</p>
                  <p className="text-sm font-medium">{viewItem.targetAchievement}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">{viewItem.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="text-sm font-medium">{viewItem.endDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium">{viewItem.status ?? '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rating</p>
                <StarRatingDisplay rating={viewItem.rating} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Progress</p>
                <p className="text-sm font-medium">{viewItem.progress}%</p>
                <div className="w-full max-w-[200px] mt-2">
                  <Progress value={viewItem.progress} className={`h-2 ${getProgressColor(viewItem.progress)}`} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus goal tracking?</AlertDialogTitle>
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

      {/* Goal Tracking List - reference: goaltracking/index */}
      <Card className={cardClass}>
        <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Manage Goal Tracking</h3>
          <div className="relative w-full max-w-[280px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by subject, goal type, or branch..."
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
                <TableHead className="px-4 py-3">Goal Type</TableHead>
                <TableHead className="px-4 py-3">Subject</TableHead>
                <TableHead className="px-4 py-3">Branch</TableHead>
                <TableHead className="px-4 py-3">Target Achievement</TableHead>
                <TableHead className="px-4 py-3">Start Date</TableHead>
                <TableHead className="px-4 py-3">End Date</TableHead>
                <TableHead className="px-4 py-3">Status</TableHead>
                <TableHead className="px-4 py-3 text-center">Rating</TableHead>
                <TableHead className="px-4 py-3">Progress</TableHead>
                <TableHead className="px-4 py-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground px-4 py-3">
                    No goal trackings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell className="px-4 py-3 font-medium">{goal.goalType}</TableCell>
                    <TableCell className="px-4 py-3">{goal.subject}</TableCell>
                    <TableCell className="px-4 py-3">{goal.branch}</TableCell>
                    <TableCell className="px-4 py-3">{goal.targetAchievement}</TableCell>
                    <TableCell className="px-4 py-3">{goal.startDate}</TableCell>
                    <TableCell className="px-4 py-3">{goal.endDate}</TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(
                          goal.status
                        )}`}
                      >
                        {goal.status ?? '-'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <StarRatingDisplay rating={goal.rating} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="w-full max-w-[150px]">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className={`h-2 mt-1 ${getProgressColor(goal.progress)}`} />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(goal.id)}
                          title="View"
                          className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(goal)}
                          title="Edit"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDelete(goal.id)}
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
    </div>
  );
}
