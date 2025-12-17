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
import { Search, Plus, Pencil, Trash2, DollarSign, Package, Users } from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  users: string[];
  purchaseDate: string;
  supportedDate: string;
  amount: number;
  description: string;
  status: 'active' | 'maintenance' | 'retired';
}

export default function EmployeesAssetSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    users: '',
    purchaseDate: '',
    supportedDate: '',
    amount: '',
    description: '',
    status: 'active' as Asset['status'],
  });

  const [assets, setAssets] = useState<Asset[]>([
    {
      id: 1,
      name: 'Dell Laptop - Latitude 5520',
      users: ['John Doe', 'Jane Smith'],
      purchaseDate: '2023-01-15',
      supportedDate: '2026-01-15',
      amount: 1200,
      description: 'High-performance laptop for development team',
      status: 'active',
    },
    {
      id: 2,
      name: 'iPhone 13 Pro',
      users: ['Mike Johnson'],
      purchaseDate: '2023-03-20',
      supportedDate: '2025-03-20',
      amount: 999,
      description: 'Mobile device for sales team',
      status: 'active',
    },
    {
      id: 3,
      name: 'Herman Miller Chair',
      users: ['Sarah Wilson'],
      purchaseDate: '2022-11-10',
      supportedDate: '2027-11-10',
      amount: 800,
      description: 'Ergonomic office chair',
      status: 'active',
    },
    {
      id: 4,
      name: 'HP Printer - LaserJet Pro',
      users: ['Office Use'],
      purchaseDate: '2023-02-05',
      supportedDate: '2026-02-05',
      amount: 450,
      description: 'Office printer for all departments',
      status: 'maintenance',
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      setAssets(
        assets.map((asset) =>
          asset.id === editingId
            ? {
                ...asset,
                name: formData.name,
                users: formData.users.split(',').map((u) => u.trim()),
                purchaseDate: formData.purchaseDate,
                supportedDate: formData.supportedDate,
                amount: parseFloat(formData.amount),
                description: formData.description,
                status: formData.status,
              }
            : asset
        )
      );
      setEditingId(null);
    } else {
      const newAsset: Asset = {
        id: Math.max(0, ...assets.map((a) => a.id)) + 1,
        name: formData.name,
        users: formData.users.split(',').map((u) => u.trim()),
        purchaseDate: formData.purchaseDate,
        supportedDate: formData.supportedDate,
        amount: parseFloat(formData.amount),
        description: formData.description,
        status: formData.status,
      };
      setAssets([...assets, newAsset]);
    }
    setShowForm(false);
    setFormData({
      name: '',
      users: '',
      purchaseDate: '',
      supportedDate: '',
      amount: '',
      description: '',
      status: 'active',
    });
  };

  const handleEdit = (asset: Asset) => {
    setFormData({
      name: asset.name,
      users: asset.users.join(', '),
      purchaseDate: asset.purchaseDate,
      supportedDate: asset.supportedDate,
      amount: asset.amount.toString(),
      description: asset.description,
      status: asset.status,
    });
    setEditingId(asset.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      setAssets(assets.filter((asset) => asset.id !== id));
    }
  };

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.users.some((user) => user.toLowerCase().includes(searchTerm.toLowerCase())) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssets = assets.length;
  const activeAssets = assets.filter((a) => a.status === 'active').length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.amount, 0);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Employees Asset Setup</h1>
            <p className="text-sm text-muted-foreground">Manage company assets and employee assignments</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalAssets}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all departments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{activeAssets}</div>
                <p className="text-xs text-muted-foreground mt-1">In use currently</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Asset portfolio value</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assets List</CardTitle>
                <Button onClick={() => setShowForm(!showForm)} className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {showForm && (
                <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-muted/50 p-4 md:p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="name">Asset Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Dell Laptop - Latitude 5520"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="users">Assigned Users</Label>
                      <Input
                        id="users"
                        value={formData.users}
                        onChange={(e) => setFormData({ ...formData, users: e.target.value })}
                        placeholder="Comma-separated names"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchaseDate">Purchase Date</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportedDate">Warranty/Support Until</Label>
                      <Input
                        id="supportedDate"
                        type="date"
                        value={formData.supportedDate}
                        onChange={(e) => setFormData({ ...formData, supportedDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Asset['status'] })}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Asset description and notes"
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                      {editingId !== null ? 'Update' : 'Create'} Asset
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData({
                          name: '',
                          users: '',
                          purchaseDate: '',
                          supportedDate: '',
                          amount: '',
                          description: '',
                          status: 'active',
                        });
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
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Assigned Users</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead>Support Until</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {asset.users.map((user, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {user}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{new Date(asset.purchaseDate).toLocaleDateString()}</TableCell>
                        <TableCell className="whitespace-nowrap">{new Date(asset.supportedDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">${asset.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              asset.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : asset.status === 'maintenance'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(asset)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(asset.id)}
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
