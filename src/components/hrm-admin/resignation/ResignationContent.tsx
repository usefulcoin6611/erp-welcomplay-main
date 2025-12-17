'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, UserMinus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Resignation { id: string; employeeName: string; noticeDate: string; lastWorkingDate: string; reason: string; }

export function ResignationContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ employeeName: '', noticeDate: '', lastWorkingDate: '', reason: '' });
  const [data, setData] = useState<Resignation[]>([
    { id: '1', employeeName: 'John Smith', noticeDate: '2024-02-01', lastWorkingDate: '2024-03-01', reason: 'Better opportunity' },
    { id: '2', employeeName: 'Sarah Johnson', noticeDate: '2024-01-15', lastWorkingDate: '2024-02-28', reason: 'Personal reasons' },
  ]);

  const employees = ['John Smith', 'Sarah Johnson', 'Mike Brown'];
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingId) { setData(data.map((item) => (item.id === editingId ? { ...item, ...formData } : item))); } else { setData([...data, { id: Date.now().toString(), ...formData }]); } setShowForm(false); };
  const filteredData = data.filter((d) => d.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (<div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Resignations</p><p className="text-2xl font-bold">{data.length}</p></div><UserMinus className="w-8 h-8 text-muted-foreground" /></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">This Month</p><p className="text-2xl font-bold text-yellow-600">{data.filter((d) => d.noticeDate.startsWith('2024-02')).length}</p></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">Upcoming</p><p className="text-2xl font-bold text-red-600">{data.filter((d) => new Date(d.lastWorkingDate) > new Date()).length}</p></div></CardContent></Card>
    </div>
    <div className="flex justify-end"><Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ employeeName: '', noticeDate: '', lastWorkingDate: '', reason: '' }); }} className="bg-blue-500 hover:bg-blue-600 shadow-none"><Plus className="w-4 h-4 mr-2" />Create Resignation</Button></div>
    {showForm && (<Card><CardContent className="pt-6"><h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Resignation</h3><form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2"><Label>Employee Name</Label><Select value={formData.employeeName} onValueChange={(value) => setFormData({ ...formData, employeeName: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Notice Date</Label><Input type="date" value={formData.noticeDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, noticeDate: e.target.value })} required /></div><div className="space-y-2"><Label>Last Working Date</Label><Input type="date" value={formData.lastWorkingDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lastWorkingDate: e.target.value })} required /></div></div>
      <div className="space-y-2"><Label>Reason</Label><Textarea value={formData.reason} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, reason: e.target.value })} rows={3} /></div>
      <div className="flex gap-2"><Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">{editingId ? 'Update' : 'Create'}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
    </form></CardContent></Card>)}
    <Card><CardContent className="pt-6"><div className="relative mb-4"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /><Input placeholder="Search..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-10" /></div>
      <Table><TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Notice Date</TableHead><TableHead>Last Working Date</TableHead><TableHead>Reason</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
        {filteredData.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No resignations found</TableCell></TableRow> : filteredData.map((d) => (<TableRow key={d.id}><TableCell className="font-medium">{d.employeeName}</TableCell><TableCell>{d.noticeDate}</TableCell><TableCell>{d.lastWorkingDate}</TableCell><TableCell className="max-w-xs truncate">{d.reason}</TableCell><TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => { setShowForm(true); setEditingId(d.id); setFormData({ employeeName: d.employeeName, noticeDate: d.noticeDate, lastWorkingDate: d.lastWorkingDate, reason: d.reason }); }}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="outline" onClick={() => { if (confirm('Delete?')) setData(data.filter((item) => item.id !== d.id)); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>))}
      </TableBody></Table>
    </CardContent></Card>
  </div>);
}
