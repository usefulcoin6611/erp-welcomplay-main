'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Eye, Users } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Trainer {
  id: string;
  branch: string;
  firstName: string;
  lastName: string;
  contact: string;
  email: string;
  expertise: string;
}

export function TrainerContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    branch: '',
    firstName: '',
    lastName: '',
    contact: '',
    email: '',
    expertise: '',
  });

  // Mock data
  const [trainers, setTrainers] = useState<Trainer[]>([
    {
      id: '1',
      branch: 'Head Office',
      firstName: 'Sarah',
      lastName: 'Johnson',
      contact: '+62 812-3456-7890',
      email: 'sarah.johnson@company.com',
      expertise: 'Technical Skills, Programming',
    },
    {
      id: '2',
      branch: 'Branch A',
      firstName: 'Michael',
      lastName: 'Brown',
      contact: '+62 813-9876-5432',
      email: 'michael.brown@company.com',
      expertise: 'Leadership, Management',
    },
    {
      id: '3',
      branch: 'Head Office',
      firstName: 'Emily',
      lastName: 'Davis',
      contact: '+62 821-1234-5678',
      email: 'emily.davis@company.com',
      expertise: 'Customer Service, Communication',
    },
  ]);

  const branches = ['Head Office', 'Branch A', 'Branch B'];

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      branch: '',
      firstName: '',
      lastName: '',
      contact: '',
      email: '',
      expertise: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setTrainers(
        trainers.map((item) =>
          item.id === editingId
            ? {
                ...item,
                branch: formData.branch,
                firstName: formData.firstName,
                lastName: formData.lastName,
                contact: formData.contact,
                email: formData.email,
                expertise: formData.expertise,
              }
            : item
        )
      );
    } else {
      const newItem: Trainer = {
        id: Date.now().toString(),
        branch: formData.branch,
        firstName: formData.firstName,
        lastName: formData.lastName,
        contact: formData.contact,
        email: formData.email,
        expertise: formData.expertise,
      };
      setTrainers([...trainers, newItem]);
    }
    setShowForm(false);
    setFormData({
      branch: '',
      firstName: '',
      lastName: '',
      contact: '',
      email: '',
      expertise: '',
    });
  };

  const handleEdit = (item: Trainer) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      branch: item.branch,
      firstName: item.firstName,
      lastName: item.lastName,
      contact: item.contact,
      email: item.email,
      expertise: item.expertise,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this trainer?')) {
      setTrainers(trainers.filter((item) => item.id !== id));
    }
  };

  const handleViewDetail = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setShowDetail(true);
  };

  const filteredData = trainers.filter(
    (trainer) =>
      trainer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trainers</p>
                <p className="text-2xl font-bold">{trainers.length}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Head Office</p>
                <p className="text-2xl font-bold text-blue-600">
                  {trainers.filter((t) => t.branch === 'Head Office').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Branches</p>
                <p className="text-2xl font-bold text-green-600">
                  {trainers.filter((t) => t.branch !== 'Head Office').length}
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
          Create Trainer
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create New'} Trainer</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise</Label>
                <Textarea
                  id="expertise"
                  value={formData.expertise}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, expertise: e.target.value })
                  }
                  placeholder="e.g., Technical Skills, Leadership, Communication"
                  required
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

      {/* Trainer Detail Modal */}
      {showDetail && selectedTrainer && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Trainer Detail</h3>
              <Button variant="outline" size="sm" onClick={() => setShowDetail(false)}>
                Close
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="font-medium">{selectedTrainer.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{`${selectedTrainer.firstName} ${selectedTrainer.lastName}`}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{selectedTrainer.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedTrainer.email}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Expertise</p>
                  <p className="font-medium">{selectedTrainer.expertise}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trainer List */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, email, or branch..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No trainers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((trainer) => (
                  <TableRow key={trainer.id}>
                    <TableCell className="font-medium">{trainer.branch}</TableCell>
                    <TableCell>{`${trainer.firstName} ${trainer.lastName}`}</TableCell>
                    <TableCell>{trainer.contact}</TableCell>
                    <TableCell>{trainer.email}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetail(trainer)} title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(trainer)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(trainer.id)}
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
