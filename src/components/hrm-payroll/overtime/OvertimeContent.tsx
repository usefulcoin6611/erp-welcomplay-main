'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

export function OvertimeContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ employeeName: '', date: '', hours: '', rate: '', total: '' });
  const [data, setData] = useState([
    { id: '1', employeeName: 'John Doe', date: '2024-03-15', hours: '3', rate: '50000', total: '150000' },
    { id: '2', employeeName: 'Jane Smith', date: '2024-03-16', hours: '2', rate: '60000', total: '120000' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = (parseFloat(formData.hours) * parseFloat(formData.rate)).toString();
    if (editingId) {
      setData(data.map(item => item.id === editingId ? { ...item, ...formData, total } : item));
    } else {
      setData([...data, { id: Date.now().toString(), ...formData, total }]);
    }
    setShowForm(false);
    setFormData({ employeeName: '', date: '', hours: '', rate: '', total: '' });
  };

  const filteredData = data.filter(item => item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ employeeName: '', date: '', hours: '', rate: '', total: '' }); }} className="bg-blue-500 hover:bg-blue-600 shadow-none">
          <Plus className="w-4 h-4 mr-2" />Add Overtime
        </Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Edit' : 'Add'} Overtime</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Employee Name</Label><Input value={formData.employeeName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, employeeName: e.target.value })} required /></div>
              <div><Label>Date</Label><Input type="date" value={formData.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })} required /></div>
              <div><Label>Hours</Label><Input type="number" step="0.5" value={formData.hours} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, hours: e.target.value })} required /></div>
              <div><Label>Rate per Hour (IDR)</Label><Input type="number" value={formData.rate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, rate: e.target.value })} required /></div>
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
            <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Date</TableHead><TableHead>Hours</TableHead><TableHead>Rate/Hour</TableHead><TableHead>Total</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.employeeName}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.hours}h</TableCell>
                  <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(item.rate))}</TableCell>
                  <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(item.total))}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setShowForm(true); setEditingId(item.id); setFormData({ employeeName: item.employeeName, date: item.date, hours: item.hours, rate: item.rate, total: item.total }); }}><Pencil className="w-4 h-4" /></Button>
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
