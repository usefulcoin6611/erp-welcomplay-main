'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { MainContentWrapper } from '@/components/main-content-wrapper';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Download,
  Eye,
  Building2,
  X,
} from 'lucide-react';

interface CompanyPolicy {
  id: number;
  branch: string;
  title: string;
  description: string;
  attachment?: string;
}

const BRANCHES = [
  { value: 'main', label: 'Main Branch' },
  { value: 'branch-office', label: 'Branch Office' },
  { value: 'remote', label: 'Remote Office' },
];

const defaultFormData = {
  branch: '',
  title: '',
  description: '',
  attachment: '' as string | File | '',
};

const statCardClass =
  'rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';

function getBranchLabel(value: string): string {
  return (BRANCHES.find((b) => b.value === value)?.label ?? value) || '-';
}

export default function CompanyPolicyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<CompanyPolicy | null>(null);

  const [policies, setPolicies] = useState<CompanyPolicy[]>([
    {
      id: 1,
      branch: 'main',
      title: 'Work From Home Policy',
      description:
        'Guidelines for remote work arrangements, including eligibility criteria, equipment provision, and communication expectations.',
      attachment: 'wfh-policy.pdf',
    },
    {
      id: 2,
      branch: 'main',
      title: 'Code of Conduct',
      description:
        'Ethical standards and behavioral expectations for all employees, including conflict of interest, confidentiality, and professional conduct.',
      attachment: 'code-of-conduct.pdf',
    },
    {
      id: 3,
      branch: 'branch-office',
      title: 'Attendance and Leave Policy',
      description:
        'Regulations regarding working hours, attendance tracking, leave types, and approval procedures.',
      attachment: 'attendance-leave.pdf',
    },
    {
      id: 4,
      branch: 'main',
      title: 'Health and Safety Policy',
      description:
        'Workplace safety protocols, emergency procedures, and health regulations to ensure employee well-being.',
    },
    {
      id: 5,
      branch: 'main',
      title: 'Data Protection and Privacy Policy',
      description:
        'Guidelines for handling confidential information, customer data, and compliance with data protection regulations.',
      attachment: 'data-protection.pdf',
    },
  ]);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setFormData({ ...defaultFormData });
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...defaultFormData });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branch || !formData.title.trim()) return;
    const attachmentName =
      typeof formData.attachment === 'string'
        ? formData.attachment
        : formData.attachment instanceof File
          ? formData.attachment.name
          : '';
    if (editingId !== null) {
      setPolicies(
        policies.map((p) =>
          p.id === editingId
            ? {
                ...p,
                branch: formData.branch,
                title: formData.title,
                description: formData.description,
                attachment: attachmentName || undefined,
              }
            : p
        )
      );
    } else {
      const newPolicy: CompanyPolicy = {
        id: Math.max(0, ...policies.map((p) => p.id)) + 1,
        branch: formData.branch,
        title: formData.title,
        description: formData.description,
        attachment: attachmentName || undefined,
      };
      setPolicies([...policies, newPolicy]);
    }
    handleDialogOpenChange(false);
  };

  const handleEdit = (policy: CompanyPolicy) => {
    setFormData({
      branch: policy.branch,
      title: policy.title,
      description: policy.description,
      attachment: policy.attachment ?? '',
    });
    setEditingId(policy.id);
    setDialogOpen(true);
  };

  const openDeleteConfirm = (policy: CompanyPolicy) => {
    setPolicyToDelete(policy);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (policyToDelete) {
      setPolicies(policies.filter((p) => p.id !== policyToDelete.id));
      setPolicyToDelete(null);
    }
    setDeleteAlertOpen(false);
  };

  const filteredPolicies = useMemo(
    () =>
      policies.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          getBranchLabel(p.branch).toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.trim().toLowerCase())
      ),
    [policies, searchTerm]
  );

  const totalPolicies = policies.length;
  const withAttachments = policies.filter((p) => p.attachment).length;
  const branchCount = new Set(policies.map((p) => p.branch)).size;

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
              {/* Title Card - reference: Manage Company Policy */}
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="px-6">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-semibold">Company Policy</CardTitle>
                    <CardDescription>
                      Manage Company Policy. Kelola kebijakan perusahaan per branch, lampiran, dan deskripsi.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className={statCardClass}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Policies</p>
                        <p className="text-2xl font-bold">{totalPolicies}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-sky-100">
                        <FileText className="w-5 h-5 text-sky-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={statCardClass}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">With Attachments</p>
                        <p className="text-2xl font-bold text-blue-600">{withAttachments}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                        <Download className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={statCardClass}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Branches Covered</p>
                        <p className="text-2xl font-bold text-green-600">{branchCount}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                        <Building2 className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Table Card - reference: Branch, Title, Description, Attachment, Action */}
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 py-3.5">
                  <div className="flex w-full max-w-md items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search policies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 pl-9 pr-9 border-0 bg-gray-50 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0"
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
                  </div>
                  <Button
                    size="sm"
                    className="h-8 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                    onClick={handleAdd}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-6">Branch</TableHead>
                          <TableHead className="px-6">Title</TableHead>
                          <TableHead className="px-6">Description</TableHead>
                          <TableHead className="px-6">Attachment</TableHead>
                          <TableHead className="px-6 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPolicies.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="px-6 text-center py-8 text-muted-foreground"
                            >
                              No policies found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPolicies.map((policy) => (
                            <TableRow key={policy.id}>
                              <TableCell className="px-6">
                                {getBranchLabel(policy.branch)}
                              </TableCell>
                              <TableCell className="px-6 font-medium">{policy.title}</TableCell>
                              <TableCell className="px-6 max-w-xs">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {policy.description}
                                </p>
                              </TableCell>
                              <TableCell className="px-6">
                                {policy.attachment ? (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200"
                                      title="Download"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      title="Preview"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="px-6">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                                    onClick={() => handleEdit(policy)}
                                    title="Edit"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 p-0 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                                    onClick={() => openDeleteConfirm(policy)}
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
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
          </MainContentWrapper>
        </div>
      </SidebarInset>

      {/* Create/Edit Dialog - reference: Branch (required), Title (required), Description, Attachment (file) */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? 'Edit Company Policy' : 'Create New Company Policy'}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null
                ? 'Ubah kebijakan perusahaan.'
                : 'Tambah kebijakan baru. Isi Branch dan Title yang wajib.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">
                    Branch <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) => setFormData({ ...formData, branch: value })}
                    required
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((b) => (
                        <SelectItem key={b.value} value={b.value}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create branch here.{' '}
                    <Link
                      href="/hrm/setup/branch"
                      className="font-medium text-primary hover:underline"
                    >
                      Create branch
                    </Link>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter Title"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter Description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attachment">Attachment</Label>
                <Input
                  id="attachment"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFormData({
                      ...formData,
                      attachment: file ?? '',
                    });
                  }}
                />
                {typeof formData.attachment === 'string' && formData.attachment && (
                  <p className="text-xs text-muted-foreground">
                    Current: {formData.attachment}
                  </p>
                )}
                {formData.attachment instanceof File && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {formData.attachment.name}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="blue" className="shadow-none">
                {editingId !== null ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Company Policy?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{policyToDelete?.title}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
