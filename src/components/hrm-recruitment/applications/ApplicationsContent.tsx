'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Eye, CheckCircle, XCircle } from 'lucide-react';
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
  rating: number;
}

export function ApplicationsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState('all');
  const [filterStage, setFilterStage] = useState('all');

  // Mock data - mutable agar Accept/Reject bisa update stage
  const [applications, setApplications] = useState<Application[]>([
    {
      id: '1',
      jobTitle: 'Senior Software Engineer',
      applicantName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+62 812-3456-7890',
      appliedDate: '2024-02-15',
      stage: 'Applied',
      rating: 4,
    },
    {
      id: '2',
      jobTitle: 'Marketing Manager',
      applicantName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+62 813-9876-5432',
      appliedDate: '2024-02-10',
      stage: 'Phone Screen',
      rating: 5,
    },
    {
      id: '3',
      jobTitle: 'Senior Software Engineer',
      applicantName: 'Mike Brown',
      email: 'mike.brown@email.com',
      phone: '+62 821-1234-5678',
      appliedDate: '2024-02-18',
      stage: 'Interview',
      rating: 3,
    },
  ]);

  const jobs = ['All Jobs', 'Senior Software Engineer', 'Marketing Manager', 'Accountant'];
  const stages = ['All Stages', 'Applied', 'Phone Screen', 'Interview', 'Offer', 'Hired', 'Rejected'];

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

  const handleAccept = (app: Application) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, stage: 'Hired' as const } : a))
    );
    toast.success(`${app.applicantName} diterima (Hired)`);
  };

  const handleReject = (app: Application) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, stage: 'Rejected' as const } : a))
    );
    toast.error(`${app.applicantName} ditolak (Rejected)`);
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
                {jobs.slice(1).map((job) => (
                  <SelectItem key={job} value={job}>
                    {job}
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
                {stages.slice(1).map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
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
                    disabled={app.stage === 'Hired' || app.stage === 'Rejected'}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    title="Reject"
                    className="h-7 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                    onClick={() => handleReject(app)}
                    disabled={app.stage === 'Hired' || app.stage === 'Rejected'}
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
