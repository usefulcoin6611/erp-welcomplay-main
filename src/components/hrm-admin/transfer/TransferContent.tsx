'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, ArrowRightLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Transfer {
  id: string;
  employeeName: string;
  branch: string;
  department: string;
  transferDate: string;
  description: string;
}

export function TransferContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employeeName: '',
    branch: '',
    department: '',
    transferDate: '',
    description: '',
  });

  const [transfers, setTransfers] = useState<Transfer[]>([
    { id: '1', employeeName: 'John Smith', branch: 'Branch A', department: 'IT', transferDate: '2024-02-15', description: 'Transfer to IT department' },
    { id: '2', employeeName: 'Sarah Johnson', branch: 'Head Office', department: 'HR', transferDate: '2024-01-20', description: 'Promoted to HR Manager' },
    { id: '3', employeeName: 'Mike Brown', branch: 'Branch B', department: 'Finance', transferDate: '2024-03-01', description: 'Transfer to Finance team' },
  ]);

  const employees = ['John Smith', 'Sarah Johnson', 'Mike Brown'];
  const branches = ['Head Office', 'Branch A', 'Branch B'];
  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setTransfers(transfers.map((item) => (item.id === editingId ? { ...item, ...formData } : item)));
    } else {
      setTransfers([...transfers, { id: Date.now().toString(), ...formData }]);
    }
    setShowForm(false);
  };

  const filteredData = transfers.filter((t) => 
    t.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Transfers</p><p className="text-2xl font-bold">{transfers.length}</p></div><ArrowRightLeft className="w-8 h-8 text-muted-foreground" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">This Month</p><p className="text-2xl font-bold text-blue-600">{transfers.filter((t) => t.transferDate.startsWith('2024-02')).length}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">This Year</p><p className="text-2xl font-bold text-green-600">{transfers.filter((t) => t.transferDate.startsWith('2024')).length}</p></div></CardContent></Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ employeeName: '', branch: '', department: '', transferDate: '', description: '' }); }} className="bg-blue-500 hover:bg-blue-600 shadow-none">
          <Plus className="w-4 h-4 mr-2" />Create Transfer
        </Button>
      </div>

      {showForm && (
        <Card><CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Transfer</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Employee Name</Label><Select value={formData.employeeName} onValueChange={(value) => setFormData({ ...formData, employeeName: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Branch</Label><Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{branches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Department</Label><Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Transfer Date</Label><Input type="date" value={formData.transferDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, transferDate: e.target.value })} required /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
            <div className="flex gap-2"><Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">{editingId ? 'Update' : 'Create'}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </form>
        </CardContent></Card>
      )}

      <Card><CardContent className="pt-6">
        <div className="relative mb-4"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /><Input placeholder="Search..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-10" /></div>
        <Table>
          <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Branch</TableHead><TableHead>Department</TableHead><TableHead>Transfer Date</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {filteredData.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transfers found</TableCell></TableRow> : filteredData.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.employeeName}</TableCell>
                <TableCell>{t.branch}</TableCell>
                <TableCell>{t.department}</TableCell>
                <TableCell>{t.transferDate}</TableCell>
                <TableCell className="max-w-xs truncate">{t.description}</TableCell>
                <TableCell><div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setShowForm(true); setEditingId(t.id); setFormData({ employeeName: t.employeeName, branch: t.branch, department: t.department, transferDate: t.transferDate, description: t.description }); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm('Delete?')) setTransfers(transfers.filter((item) => item.id !== t.id)); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
