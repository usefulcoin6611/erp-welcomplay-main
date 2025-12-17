'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

export function CommissionContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ employeeName: '', salesAmount: '', commissionRate: '', amount: '', month: '' });
  const [data, setData] = useState([
    { id: '1', employeeName: 'John Doe', salesAmount: '50000000', commissionRate: '5', amount: '2500000', month: '2024-03' },
    { id: '2', employeeName: 'Jane Smith', salesAmount: '75000000', commissionRate: '4', amount: '3000000', month: '2024-03' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = ((parseFloat(formData.salesAmount) * parseFloat(formData.commissionRate)) / 100).toString();
    if (editingId) {
      setData(data.map(item => item.id === editingId ? { ...item, ...formData, amount } : item));
    } else {
      setData([...data, { id: Date.now().toString(), ...formData, amount }]);
    }
    setShowForm(false);
    setFormData({ employeeName: '', salesAmount: '', commissionRate: '', amount: '', month: '' });
  };

  const filteredData = data.filter(item => item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ employeeName: '', salesAmount: '', commissionRate: '', amount: '', month: '' }); }} className="bg-blue-500 hover:bg-blue-600 shadow-none">
          <Plus className="w-4 h-4 mr-2" />Add Commission
        </Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Edit' : 'Add'} Commission</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Employee Name</Label><Input value={formData.employeeName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, employeeName: e.target.value })} required /></div>
              <div><Label>Sales Amount (IDR)</Label><Input type="number" value={formData.salesAmount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, salesAmount: e.target.value })} required /></div>
              <div><Label>Commission Rate (%)</Label><Input type="number" step="0.1" value={formData.commissionRate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, commissionRate: e.target.value })} required /></div>
              <div><Label>Month</Label><Input type="month" value={formData.month} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, month: e.target.value })} required /></div>
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
            <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Sales Amount</TableHead><TableHead>Commission Rate</TableHead><TableHead>Commission Amount</TableHead><TableHead>Month</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.employeeName}</TableCell>
                  <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(item.salesAmount))}</TableCell>
                  <TableCell>{item.commissionRate}%</TableCell>
                  <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(item.amount))}</TableCell>
                  <TableCell>{item.month}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setShowForm(true); setEditingId(item.id); setFormData({ employeeName: item.employeeName, salesAmount: item.salesAmount, commissionRate: item.commissionRate, amount: item.amount, month: item.month }); }}><Pencil className="w-4 h-4" /></Button>
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
