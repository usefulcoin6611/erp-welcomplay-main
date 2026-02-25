'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';
const statCardClass = 'rounded-lg border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';

interface Application {
  id: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  appliedDate: string;
  stage: string;
  stageId?: string;
  rating: number;
}

type JobOption = { id: string; title: string };
type StageOption = { id: string; name: string };

export function ApplicationsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [stages, setStages] = useState<StageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const mapApp = (a: { jobTitle: string; stage: string; stageId?: string } & Application) => ({
    id: a.id,
    jobTitle: a.jobTitle,
    applicantName: a.applicantName,
    email: a.email,
    phone: a.phone,
    appliedDate: a.appliedDate,
    stage: a.stage,
    stageId: a.stageId,
    rating: a.rating,
  });

  const fetchApplications = useCallback(async (jobIdFilter: string, stageIdFilter: string) => {
    const params = new URLSearchParams();
    if (jobIdFilter !== 'all') params.set('jobId', jobIdFilter);
    if (stageIdFilter !== 'all') params.set('stageId', stageIdFilter);
    const res = await fetch(`/api/hrm/recruitment/applications?${params.toString()}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      setApplications(json.data.map(mapApp));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [jobsRes, stagesRes] = await Promise.all([
        fetch('/api/hrm/recruitment/jobs'),
        fetch('/api/job-stages'),
      ]);
      const jobsJson = await jobsRes.json();
      const stagesJson = await stagesRes.json();
      if (!cancelled) {
        if (jobsJson.success && Array.isArray(jobsJson.data)) setJobs(jobsJson.data);
        if (stagesJson.success && Array.isArray(stagesJson.data)) setStages(stagesJson.data);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const stageId =
      filterStage === 'all' ? 'all' : stages.find((s) => s.name === filterStage)?.id ?? 'all';
    fetchApplications(filterJob, stageId)
      .catch(() => toast.error('Gagal memuat lamaran'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterJob, filterStage, stages, fetchApplications]);

  const filteredData = applications.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = filterJob === 'all' || app.jobTitle === filterJob;
    const matchesStage = filterStage === 'all' || app.stage === filterStage;
    return matchesSearch && matchesJob && matchesStage;
  });

  const handleView = (id: string) => {
    router.push(`/hrm/recruitment/applications/${id}`);
  };

  const hiredStageId = stages.find((s) => s.name === 'Hired')?.id;
  const rejectedStageId = stages.find((s) => s.name === 'Rejected')?.id;

  const handleAccept = async (app: Application) => {
    if (!hiredStageId) {
      toast.error('Stage "Hired" tidak ditemukan. Tambah di Setup → Job Stage.');
      return;
    }
    setUpdatingId(app.id);
    try {
      const res = await fetch(`/api/hrm/recruitment/applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: hiredStageId }),
      });
      const json = await res.json();
      if (json.success) {
        setApplications((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, stage: 'Hired', stageId: hiredStageId } : a))
        );
        toast.success(`${app.applicantName} diterima (Hired)`);
      } else toast.error(json.message ?? 'Gagal mengubah stage');
    } catch (e) {
      console.error(e);
      toast.error('Gagal mengubah stage');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (app: Application) => {
    if (!rejectedStageId) {
      toast.error('Stage "Rejected" tidak ditemukan. Tambah di Setup → Job Stage.');
      return;
    }
    setUpdatingId(app.id);
    try {
      const res = await fetch(`/api/hrm/recruitment/applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: rejectedStageId }),
      });
      const json = await res.json();
      if (json.success) {
        setApplications((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, stage: 'Rejected', stageId: rejectedStageId } : a))
        );
        toast.error(`${app.applicantName} ditolak (Rejected)`);
      } else toast.error(json.message ?? 'Gagal mengubah stage');
    } catch (e) {
      console.error(e);
      toast.error('Gagal mengubah stage');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800';
      case 'Phone Screen':
        return 'bg-purple-100 text-purple-800';
      case 'Interview':
        return 'bg-yellow-100 text-yellow-800';
      case 'Offer':
        return 'bg-green-100 text-green-800';
      case 'Hired':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards - separated, no border */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={statCardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Interview</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter((a) => a.stage === 'Interview').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hired</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter((a) => a.stage === 'Hired').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {applications.filter((a) => a.stage === 'Rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manage Job Application - satu card: header (title + search + filter), content (grid) */}
      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 pb-4">
          <h3 className="text-base font-semibold shrink-0">Manage Job Application</h3>
          <div className="flex flex-nowrap items-center gap-2 min-w-0">
            <div className="relative shrink-0 w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search applicants..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-9 border-0 bg-gray-50 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0"
              />
            </div>
            <Select value={filterJob} onValueChange={setFilterJob}>
              <SelectTrigger className="h-9 w-[160px] shrink-0">
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="h-9 w-[160px] shrink-0">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-6 pt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.length === 0 ? (
          <Card className={`col-span-full ${cardClass}`}>
            <CardContent className="px-4 py-4">
              <p className="text-center py-8 text-muted-foreground">No applications found</p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((app) => (
            <Card key={app.id} className={cardClass}>
              <CardContent className="px-4 py-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{app.applicantName}</h3>
                    <p className="text-sm text-muted-foreground">{app.jobTitle}</p>
                  </div>
                  <Badge className={getStageBadgeColor(app.stage)}>{app.stage}</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">{app.email}</p>
                  <p className="text-muted-foreground">{app.phone}</p>
                  <p className="text-muted-foreground">Applied: {app.appliedDate}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  {renderStars(app.rating)}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                    onClick={() => handleView(app.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    title="Accept"
                    className="h-7 shadow-none bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                    onClick={() => handleAccept(app)}
                    disabled={app.stage === 'Hired' || app.stage === 'Rejected' || updatingId === app.id}
                  >
                    {updatingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    title="Reject"
                    className="h-7 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                    onClick={() => handleReject(app)}
                    disabled={app.stage === 'Hired' || app.stage === 'Rejected' || updatingId === app.id}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
        </CardContent>
      </Card>
    </div>
  );
}
