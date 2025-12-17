'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Award } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this award?')) {
      setAwards(awards.filter((item) => item.id !== id));
    }
  };

  const filteredData = awards.filter(
    (award) =>
      award.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      award.awardType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Awards</p>
                <p className="text-2xl font-bold">{awards.length}</p>
              </div>
              <Award className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {awards.filter((a) => a.date.startsWith('2024-02')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Year</p>
                <p className="text-2xl font-bold text-green-600">
                  {awards.filter((a) => a.date.startsWith('2024')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end items-center">
        <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 shadow-none">
          <Plus className="w-4 h-4 mr-2" />
          Create Award
        </Button>
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

      {/* Awards List */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by employee or award type..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Award Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Gift</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No awards found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((award) => (
                  <TableRow key={award.id}>
                    <TableCell className="font-medium">{award.employeeName}</TableCell>
                    <TableCell>{award.awardType}</TableCell>
                    <TableCell>{award.date}</TableCell>
                    <TableCell>{award.gift}</TableCell>
                    <TableCell className="max-w-xs truncate">{award.description}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(award)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(award.id)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
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
    </div>
  );
}
