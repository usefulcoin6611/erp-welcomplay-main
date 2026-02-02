'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Link2, ExternalLink } from 'lucide-react';
import { getJobsList } from '@/lib/recruitment-data';
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

export function CareerContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const jobs = getJobsList().filter((j) => j.status === 'active');
  const filteredData = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const handleCopyLink = (jobId: string) => {
    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/career/job/${jobId}`;
    navigator.clipboard.writeText(link).then(
      () => toast.success('Link career job berhasil disalin'),
      () => toast.error('Gagal menyalin link')
    );
  };

  const careerPageUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/career` : '/career';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">Career Jobs</p>
              </div>
              <h3 className="text-2xl font-bold">{jobs.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Career Page</p>
                <p className="text-lg font-semibold truncate max-w-[140px]" title={careerPageUrl}>
                  {careerPageUrl}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={cardClass}>
        <CardHeader className="px-6 pb-4 flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base font-semibold">Career</CardTitle>
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
                <TableHead className="px-6">Category</TableHead>
                <TableHead className="px-6">Start Date</TableHead>
                <TableHead className="px-6">End Date</TableHead>
                <TableHead className="px-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 text-center py-8 text-muted-foreground">
                    Tidak ada job aktif untuk career page
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="px-6 font-medium">{job.branch}</TableCell>
                    <TableCell className="px-6">{job.title}</TableCell>
                    <TableCell className="px-6">
                      <Badge variant="secondary" className="font-normal">
                        {job.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6">{formatDate(job.startDate)}</TableCell>
                    <TableCell className="px-6">{formatDate(job.endDate)}</TableCell>
                    <TableCell className="px-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyLink(job.id)}
                          title="Copy link"
                          className="shadow-none h-7 bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                        >
                          <Link2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/career/job/${job.id}`, '_blank')}
                          title="Buka di tab baru"
                          className="shadow-none h-7 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                        >
                          <ExternalLink className="w-4 h-4" />
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
