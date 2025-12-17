'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

export function OtherPaymentContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ employeeName: '', paymentType: '', amount: '', date: '', description: '' });
  const [data, setData] = useState([
    { id: '1', employeeName: 'John Doe', paymentType: 'Bonus', amount: '1000000', date: '2024-03-15', description: 'Performance bonus Q1' },
    { id: '2', employeeName: 'Jane Smith', paymentType: 'Incentive', amount: '750000', date: '2024-03-20', description: 'Sales incentive' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setData(data.map(item => item.id === editingId ? { ...item, ...formData } : item));
    } else {
      setData([...data, { id: Date.now().toString(), ...formData }]);
    }
    setShowForm(false);
    setFormData({ employeeName: '', paymentType: '', amount: '', date: '', description: '' });
  };

  const filteredData = data.filter(item => item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ employeeName: '', paymentType: '', amount: '', date: '', description: '' }); }} className="bg-blue-500 hover:bg-blue-600 shadow-none">
          <Plus className="w-4 h-4 mr-2" />Add Other Payment
        </Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Edit' : 'Add'} Other Payment</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Employee Name</Label><Input value={formData.employeeName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, employeeName: e.target.value })} required /></div>
              <div><Label>Payment Type</Label><Input value={formData.paymentType} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, paymentType: e.target.value })} required /></div>
              <div><Label>Amount (IDR)</Label><Input type="number" value={formData.amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, amount: e.target.value })} required /></div>
              <div><Label>Date</Label><Input type="date" value={formData.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })} required /></div>
              <div><Label>Description</Label><Input value={formData.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="flex gap-2"><Button type="submit">Save</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Payment Type</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.employeeName}</TableCell>
                  <TableCell>{item.paymentType}</TableCell>
                  <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(item.amount))}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setShowForm(true); setEditingId(item.id); setFormData({ employeeName: item.employeeName, paymentType: item.paymentType, amount: item.amount, date: item.date, description: item.description }); }}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => confirm('Delete?') && setData(data.filter(d => d.id !== item.id))}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
