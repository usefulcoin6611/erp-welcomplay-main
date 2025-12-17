'use client';

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, Pencil, Trash2, FileText, CheckCircle, XCircle } from 'lucide-react';

interface DocumentType {
  id: number;
  name: string;
  isRequired: boolean;
}

export default function DocumentSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    isRequired: true,
  });

  const [documents, setDocuments] = useState<DocumentType[]>([
    { id: 1, name: 'Identity Card (KTP)', isRequired: true },
    { id: 2, name: 'Family Card (KK)', isRequired: true },
    { id: 3, name: 'Tax ID (NPWP)', isRequired: true },
    { id: 4, name: 'Educational Certificate', isRequired: true },
    { id: 5, name: 'Work Experience Letter', isRequired: false },
    { id: 6, name: 'Health Certificate', isRequired: true },
    { id: 7, name: 'Police Clearance (SKCK)', isRequired: false },
    { id: 8, name: 'Bank Account Statement', isRequired: false },
    { id: 9, name: 'Passport', isRequired: false },
    { id: 10, name: 'Vaccination Certificate', isRequired: true },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      setDocuments(
        documents.map((doc) =>
          doc.id === editingId
            ? { ...doc, name: formData.name, isRequired: formData.isRequired }
            : doc
        )
      );
      setEditingId(null);
    } else {
      const newDocument: DocumentType = {
        id: Math.max(0, ...documents.map((d) => d.id)) + 1,
        name: formData.name,
        isRequired: formData.isRequired,
      };
      setDocuments([...documents, newDocument]);
    }
    setShowForm(false);
    setFormData({ name: '', isRequired: true });
  };

  const handleEdit = (document: DocumentType) => {
    setFormData({
      name: document.name,
      isRequired: document.isRequired,
    });
    setEditingId(document.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this document type?')) {
      setDocuments(documents.filter((doc) => doc.id !== id));
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDocuments = documents.length;
  const requiredDocuments = documents.filter((d) => d.isRequired).length;
  const optionalDocuments = documents.filter((d) => !d.isRequired).length;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Document Setup</h1>
            <p className="text-sm text-muted-foreground">Manage employee document types and requirements</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Document Types</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalDocuments}</div>
                <p className="text-xs text-muted-foreground mt-1">Configured types</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Required Documents</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{requiredDocuments}</div>
                <p className="text-xs text-muted-foreground mt-1">Mandatory for employees</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Optional Documents</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{optionalDocuments}</div>
                <p className="text-xs text-muted-foreground mt-1">Not required</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Document Types</CardTitle>
                <Button onClick={() => setShowForm(!showForm)} className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document Type
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {showForm && (
                <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-muted/50 p-4 md:p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Document Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Identity Card (KTP)"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isRequired">Requirement Status</Label>
                      <select
                        id="isRequired"
                        value={formData.isRequired ? 'required' : 'optional'}
                        onChange={(e) => setFormData({ ...formData, isRequired: e.target.value === 'required' })}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="required">Required</option>
                        <option value="optional">Optional</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                      {editingId !== null ? 'Update' : 'Create'} Document Type
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData({ name: '', isRequired: true });
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
                  placeholder="Search document types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Required Field</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell className="font-medium">{document.name}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              document.isRequired
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {document.isRequired ? 'Required' : 'Not Required'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(document)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(document.id)}
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
