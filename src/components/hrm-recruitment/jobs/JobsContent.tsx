'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Search, Eye, Link2, Loader2 } from 'lucide-react';
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

type JobItem = {
  id: string;
  title: string;
  branch: string;
  category: string;
  positions: number;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export function JobsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/hrm/recruitment/jobs');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setJobs(json.data);
      } else {
        toast.error(json.message ?? 'Gagal memuat job');
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat data job');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const refreshJobs = () => fetchJobs();

  const handleView = (id: string) => {
    router.push(`/hrm/recruitment/jobs/${id}`);
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteJobId(id);
    setDeleteAlertOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/hrm/recruitment/jobs/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? 'Job berhasil dihapus');
        refreshJobs();
        setDeleteJobId(null);
        setDeleteAlertOpen(false);
      } else {
        toast.error(json.message ?? 'Gagal menghapus job');
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus job');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLink = (jobId: string) => {
    const link = `${window.location.origin}/career/job/${jobId}`;
    navigator.clipboard.writeText(link).then(
      () => toast.success('Link job berhasil disalin ke clipboard'),
      () => toast.error('Gagal menyalin link')
    );
  };

  const filteredData = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    return status === 'active'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : 'bg-red-50 text-red-700 border-red-100';
  };

  const statusLabel = (status: string) => (status === 'active' ? 'Active' : 'In Active');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards - reference-erp job index: Total, Active, Inactive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">Jobs</p>
              </div>
              <h3 className="text-2xl font-bold">{jobs.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">Jobs</p>
              </div>
              <h3 className="text-2xl font-bold text-green-600">{jobs.filter((j) => j.status === 'active').length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">Jobs</p>
              </div>
              <h3 className="text-2xl font-bold text-amber-600">{jobs.filter((j) => j.status === 'in_active').length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List - reference-erp: Branch, Title, Start Date, End Date, Status, Created At, Action. Create Job via header "Job Create" tab. */}
      <Card className={cardClass}>
        <CardHeader className="px-6 border-b flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Manage Job</CardTitle>
          <div className="relative w-full max-w-[280px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by title, category, or branch..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 pr-9 border-0 bg-gray-50 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/30">
                <TableHead className="px-6">Branch</TableHead>
                <TableHead className="px-6">Title</TableHead>
                <TableHead className="px-6">Start Date</TableHead>
                <TableHead className="px-6">End Date</TableHead>
                <TableHead className="px-6">Status</TableHead>
                <TableHead className="px-6">Created At</TableHead>
                <TableHead className="px-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 text-center py-8 text-muted-foreground">
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="px-6 font-medium">{job.branch}</TableCell>
                    <TableCell className="px-6">{job.title}</TableCell>
                    <TableCell className="px-6">{formatDate(job.startDate)}</TableCell>
                    <TableCell className="px-6">{formatDate(job.endDate)}</TableCell>
                    <TableCell className="px-6">
                      <Badge className={getStatusBadgeColor(job.status)}>{statusLabel(job.status)}</Badge>
                    </TableCell>
                    <TableCell className="px-6">{formatDate(job.createdAt)}</TableCell>
                    <TableCell className="px-6">
                      <div className="flex justify-end gap-2">
                        {job.status !== 'in_active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyLink(job.id)}
                            title="Copy"
                            className="shadow-none h-7 bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                          >
                            <Link2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(job.id)}
                          title="View"
                          className="shadow-none h-7 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/hrm/recruitment/jobs/${job.id}/edit`)}
                          title="Edit"
                          className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteConfirm(job.id)}
                          title="Delete"
                          className="shadow-none h-7 bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
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

      <AlertDialog open={deleteAlertOpen} onOpenChange={(open) => { setDeleteAlertOpen(open); if (!open) setDeleteJobId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus job?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin melanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2">
            <AlertDialogCancel type="button">Batal</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={deleting}
              onClick={() => deleteJobId && handleDelete(deleteJobId)}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Hapus</span>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
