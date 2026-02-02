'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Award } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
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

const statCardClass = 'rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';
const tabColor = { iconBg: 'bg-amber-100', iconText: 'text-amber-600', accent: 'text-amber-600' };

interface AwardRecord {
  id: string;
  employeeName: string;
  awardType: string;
  date: string;
  gift: string;
  description: string;
}

export function AwardContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employeeName: '',
    awardType: '',
    date: '',
    gift: '',
    description: '',
  });

  // Mock data
  const [awards, setAwards] = useState<AwardRecord[]>([
    {
      id: '1',
      employeeName: 'John Smith',
      awardType: 'Employee of the Month',
      date: '2024-02-01',
      gift: 'Certificate + Bonus',
      description: 'Outstanding performance in Q1 2024',
    },
    {
      id: '2',
      employeeName: 'Sarah Johnson',
      awardType: 'Best Team Player',
      date: '2024-01-15',
      gift: 'Trophy',
      description: 'Excellent collaboration and team support',
    },
    {
      id: '3',
      employeeName: 'Mike Brown',
      awardType: 'Innovation Award',
      date: '2024-02-20',
      gift: 'Gift Voucher',
      description: 'Innovative solution for process improvement',
    },
  ]);

  const employees = ['John Smith', 'Sarah Johnson', 'Mike Brown', 'Emily Davis'];
  const awardTypes = ['Employee of the Month', 'Best Team Player', 'Innovation Award', 'Performance Excellence', 'Leadership Award'];

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      employeeName: '',
      awardType: '',
      date: '',
      gift: '',
      description: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setAwards(
        awards.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...formData,
              }
            : item
        )
      );
    } else {
      const newItem: AwardRecord = {
        id: Date.now().toString(),
        ...formData,
      };
      setAwards([...awards, newItem]);
    }
    setShowForm(false);
  };

  const handleEdit = (item: AwardRecord) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      employeeName: item.employeeName,
      awardType: item.awardType,
      date: item.date,
      gift: item.gift,
      description: item.description,
    });
  };

  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (idToDelete) {
      setAwards(awards.filter((item) => item.id !== idToDelete));
      setIdToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const filteredData = awards.filter(
    (award) =>
      award.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      award.awardType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Summary Cards - thin border, tab color: Award = amber */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={statCardClass}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Awards</p>
                <p className="text-2xl font-bold">{awards.length}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tabColor.iconBg}`}>
                <Award className={`w-5 h-5 ${tabColor.iconText}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className={`text-2xl font-bold ${tabColor.accent}`}>
                  {awards.filter((a) => a.date.startsWith('2024-02')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Year</p>
                <p className={`text-2xl font-bold ${tabColor.accent}`}>
                  {awards.filter((a) => a.date.startsWith('2024')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create New'} Award</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeName">Employee Name</Label>
                  <Select
                    value={formData.employeeName}
                    onValueChange={(value) => setFormData({ ...formData, employeeName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp} value={emp}>
                          {emp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awardType">Award Type</Label>
                  <Select
                    value={formData.awardType}
                    onValueChange={(value) => setFormData({ ...formData, awardType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select award type" />
                    </SelectTrigger>
                    <SelectContent>
                      {awardTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Award Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gift">Gift</Label>
                  <Input
                    id="gift"
                    value={formData.gift}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, gift: e.target.value })}
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
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Awards List - search inline with button, no border, separated bg */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-end space-y-0 px-6 py-3.5">
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative w-56 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by employee or award type..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="h-8 bg-gray-50 pl-9 pr-3 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              />
            </div>
            <Button onClick={handleAdd} size="sm" className="h-8 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200 flex-shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Create Award
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Employee Name</TableHead>
                <TableHead className="px-6">Award Type</TableHead>
                <TableHead className="px-6">Date</TableHead>
                <TableHead className="px-6">Gift</TableHead>
                <TableHead className="px-6">Description</TableHead>
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 text-center py-8 text-muted-foreground">
                    No awards found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((award) => (
                  <TableRow key={award.id}>
                    <TableCell className="px-6 font-medium">{award.employeeName}</TableCell>
                    <TableCell className="px-6">{award.awardType}</TableCell>
                    <TableCell className="px-6">{award.date}</TableCell>
                    <TableCell className="px-6">{award.gift}</TableCell>
                    <TableCell className="px-6 max-w-xs truncate">{award.description}</TableCell>
                    <TableCell className="px-6">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="h-7 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={() => handleEdit(award)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                          onClick={() => handleDeleteClick(award.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus award?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteConfirm}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
