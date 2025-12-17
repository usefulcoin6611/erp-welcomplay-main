'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Users, Mail, Phone } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  skills: string[];
  experience: string;
  status: string;
}

export function CandidatesContent() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const [candidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+62 812-3456-7890',
      position: 'Senior Software Engineer',
      skills: ['React', 'Node.js', 'TypeScript'],
      experience: '5+ years',
      status: 'Shortlisted',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+62 813-9876-5432',
      position: 'Marketing Manager',
      skills: ['Digital Marketing', 'SEO', 'Content Strategy'],
      experience: '7+ years',
      status: 'Interviewed',
    },
    {
      id: '3',
      name: 'Mike Brown',
      email: 'mike.brown@email.com',
      phone: '+62 821-1234-5678',
      position: 'Accountant',
      skills: ['Financial Analysis', 'Tax', 'Audit'],
      experience: '4+ years',
      status: 'Pending',
    },
  ]);

  const filteredData = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-blue-100 text-blue-800';
      case 'Interviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Selected':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{candidates.length}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shortlisted</p>
                <p className="text-2xl font-bold text-blue-600">
                  {candidates.filter((c) => c.status === 'Shortlisted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interviewed</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {candidates.filter((c) => c.status === 'Interviewed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selected</p>
                <p className="text-2xl font-bold text-green-600">
                  {candidates.filter((c) => c.status === 'Selected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredData.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center py-8 text-muted-foreground">No candidates found</p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((candidate) => (
            <Card key={candidate.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    <p className="text-sm text-muted-foreground">{candidate.experience}</p>
                  </div>
                  <Badge className={getStatusBadgeColor(candidate.status)}>{candidate.status}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.phone}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 shadow-none">
                    View Profile
                  </Button>
                  <Button size="sm" variant="outline">
                    Schedule Interview
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
