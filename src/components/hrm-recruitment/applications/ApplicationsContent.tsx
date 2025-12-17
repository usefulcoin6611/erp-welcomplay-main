'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Eye, CheckCircle, XCircle } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState('all');
  const [filterStage, setFilterStage] = useState('all');

  // Mock data
  const [applications] = useState<Application[]>([
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
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
        <Card>
          <CardContent className="pt-6">
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
        <Card>
          <CardContent className="pt-6">
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search applicants..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterJob} onValueChange={setFilterJob}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by job" />
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
              <SelectTrigger>
                <SelectValue placeholder="Filter by stage" />
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
        </CardContent>
      </Card>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center py-8 text-muted-foreground">No applications found</p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-6 space-y-3">
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
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" title="Accept">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button size="sm" variant="outline" title="Reject">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
