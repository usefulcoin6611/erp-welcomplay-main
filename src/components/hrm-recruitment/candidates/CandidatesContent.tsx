'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Download, FileText, X, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]';

type CandidateItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  skills: string[];
  status: string;
  rating?: number;
  appliedAt?: string;
  resume?: string;
};

function formatDate(value: string | undefined): string {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function renderStars(rating: number | undefined): React.ReactNode {
  const r = rating ?? 0;
  return (
    <span className="inline-flex gap-0.5" title={`${r}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= r ? 'text-amber-500' : 'text-gray-300'}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function CandidatesContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState<string>('all');
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = useCallback(async (jobId: string) => {
    try {
      const params = jobId ? `?jobId=${encodeURIComponent(jobId)}` : '';
      const res = await fetch(`/api/hrm/recruitment/candidates${params}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setCandidates(json.data);
      else toast.error(json.message ?? 'Gagal memuat kandidat');
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat kandidat');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const jobsRes = await fetch('/api/hrm/recruitment/jobs');
      const jobsJson = await jobsRes.json();
      if (!cancelled && jobsJson.success && Array.isArray(jobsJson.data)) setJobs(jobsJson.data);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCandidates(filterJob === 'all' ? '' : filterJob);
  }, [filterJob, fetchCandidates]);

  const jobOptions = useMemo(() => {
    return [{ id: 'all', title: 'All Jobs' }, ...jobs];
  }, [jobs]);

  const filteredData = useMemo(
    () =>
      candidates.filter((c) => {
        const matchesSearch =
          !searchTerm.trim() ||
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesJob =
          filterJob === 'all' || !filterJob || c.position === jobs.find((j) => j.id === filterJob)?.title;
        return matchesSearch && matchesJob;
      }),
    [candidates, searchTerm, filterJob, jobs]
  );

  const handleView = (id: string) => {
    router.push(`/hrm/recruitment/candidates/${id}`);
  };

  const handleDownloadResume = (name: string, resume: string | undefined) => {
    if (!resume) {
      toast.info('Tidak ada file CV/Resume');
      return;
    }
    toast.success(`Download: ${resume}`);
    // Simulasi download
  };

  const handlePreviewResume = (name: string, resume: string | undefined) => {
    if (!resume) {
      toast.info('Tidak ada file CV/Resume');
      return;
    }
    toast.info(`Preview: ${resume}`);
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
      {/* Summary card - konsisten dengan tab Applications / Onboarding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{candidates.length}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Filtered (tampilan)</p>
              <p className="text-2xl font-bold text-blue-600">{filteredData.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel kandidat - header: judul kiri, search + filter kanan */}
      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 pb-4">
          <CardTitle className="text-base font-semibold shrink-0">Job Candidate</CardTitle>
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap min-w-0">
            <div className="relative shrink-0 w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-9 border-0 bg-gray-50 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0"
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
            <Select value={filterJob} onValueChange={setFilterJob}>
              <SelectTrigger className="h-9 w-[180px] shrink-0">
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                {jobOptions.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/30">
                  <TableHead className="px-6 font-medium">Name</TableHead>
                  <TableHead className="px-6 font-medium">Applied For</TableHead>
                  <TableHead className="px-6 font-medium">Rating</TableHead>
                  <TableHead className="px-6 font-medium">Applied at</TableHead>
                  <TableHead className="px-6 font-medium">CV / Resume</TableHead>
                  <TableHead className="px-6 font-medium text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((c) => (
                    <TableRow key={c.id} className="border-b">
                      <TableCell className="px-6">
                        <button
                          type="button"
                          onClick={() => handleView(c.id)}
                          className="font-medium text-primary hover:underline text-left"
                        >
                          {c.name}
                        </button>
                      </TableCell>
                      <TableCell className="px-6 text-foreground">{c.position}</TableCell>
                      <TableCell className="px-6">{renderStars(c.rating)}</TableCell>
                      <TableCell className="px-6 text-foreground">
                        {formatDate(c.appliedAt)}
                      </TableCell>
                      <TableCell className="px-6">
                        {c.resume ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 shadow-none bg-blue-600 text-white hover:bg-blue-700 border-0"
                              onClick={() => handleDownloadResume(c.name, c.resume)}
                              title="Download"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 shadow-none bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                              onClick={() => handlePreviewResume(c.name, c.resume)}
                              title="Preview"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                          onClick={() => handleView(c.id)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
