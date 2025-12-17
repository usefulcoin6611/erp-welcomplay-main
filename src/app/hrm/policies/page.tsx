'use client';

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, Pencil, Trash2, FileText, Download, Eye, Building2 } from 'lucide-react';

interface CompanyPolicy {
  id: number;
  branch: string;
  title: string;
  description: string;
  attachment?: string;
  createdDate: string;
  updatedDate: string;
}

export default function CompanyPolicyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    branch: '',
    title: '',
    description: '',
    attachment: '',
  });

  const [policies, setPolicies] = useState<CompanyPolicy[]>([
    {
      id: 1,
      branch: 'Head Office',
      title: 'Work From Home Policy',
      description: 'Guidelines for remote work arrangements, including eligibility criteria, equipment provision, and communication expectations.',
      attachment: 'wfh-policy.pdf',
      createdDate: '2023-01-15',
      updatedDate: '2023-11-20',
    },
    {
      id: 2,
      branch: 'All Branches',
      title: 'Code of Conduct',
      description: 'Ethical standards and behavioral expectations for all employees, including conflict of interest, confidentiality, and professional conduct.',
      attachment: 'code-of-conduct.pdf',
      createdDate: '2022-06-10',
      updatedDate: '2024-01-05',
    },
    {
      id: 3,
      branch: 'Jakarta Branch',
      title: 'Attendance and Leave Policy',
      description: 'Regulations regarding working hours, attendance tracking, leave types, and approval procedures.',
      attachment: 'attendance-leave.pdf',
      createdDate: '2023-03-20',
      updatedDate: '2023-12-15',
    },
    {
      id: 4,
      branch: 'All Branches',
      title: 'Health and Safety Policy',
      description: 'Workplace safety protocols, emergency procedures, and health regulations to ensure employee well-being.',
      createdDate: '2023-02-10',
      updatedDate: '2023-10-25',
    },
    {
      id: 5,
      branch: 'Head Office',
      title: 'Data Protection and Privacy Policy',
      description: 'Guidelines for handling confidential information, customer data, and compliance with data protection regulations.',
      attachment: 'data-protection.pdf',
      createdDate: '2023-04-15',
      updatedDate: '2024-01-10',
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      setPolicies(
        policies.map((policy) =>
          policy.id === editingId
            ? {
                ...policy,
                branch: formData.branch,
                title: formData.title,
                description: formData.description,
                attachment: formData.attachment || undefined,
                updatedDate: new Date().toISOString().split('T')[0],
              }
            : policy
        )
      );
      setEditingId(null);
    } else {
      const newPolicy: CompanyPolicy = {
        id: Math.max(0, ...policies.map((p) => p.id)) + 1,
        branch: formData.branch,
        title: formData.title,
        description: formData.description,
        attachment: formData.attachment || undefined,
        createdDate: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0],
      };
      setPolicies([...policies, newPolicy]);
    }
    setShowForm(false);
    setFormData({ branch: '', title: '', description: '', attachment: '' });
  };

  const handleEdit = (policy: CompanyPolicy) => {
    setFormData({
      branch: policy.branch,
      title: policy.title,
      description: policy.description,
      attachment: policy.attachment || '',
    });
    setEditingId(policy.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setPolicies(policies.filter((policy) => policy.id !== id));
    }
  };

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPolicies = policies.length;
  const policiesWithAttachments = policies.filter((p) => p.attachment).length;
  const branches = [...new Set(policies.map((p) => p.branch))].length;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Company Policy</h1>
            <p className="text-sm text-muted-foreground">Manage company policies and regulations</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalPolicies}</div>
                <p className="text-xs text-muted-foreground mt-1">Active policies</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">With Attachments</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{policiesWithAttachments}</div>
                <p className="text-xs text-muted-foreground mt-1">Documents available</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Branches Covered</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{branches}</div>
                <p className="text-xs text-muted-foreground mt-1">Different locations</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Company Policies</CardTitle>
                <Button onClick={() => setShowForm(!showForm)} className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Policy
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {showForm && (
                <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-muted/50 p-4 md:p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <Input
                        id="branch"
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        placeholder="e.g., Head Office"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Policy Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Work From Home Policy"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Policy details and guidelines"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attachment">Attachment (filename)</Label>
                    <Input
                      id="attachment"
                      value={formData.attachment}
                      onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
                      placeholder="e.g., policy-document.pdf (optional)"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                      {editingId !== null ? 'Update' : 'Create'} Policy
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData({ branch: '', title: '', description: '', attachment: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Attachment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell>
                          <Badge variant="secondary" className="whitespace-nowrap">{policy.branch}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{policy.title}</TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-muted-foreground line-clamp-2">{policy.description}</p>
                        </TableCell>
                        <TableCell>
                          {policy.attachment ? (
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-gray-50 hover:text-gray-600"
                                title="Preview"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(policy)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(policy.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
