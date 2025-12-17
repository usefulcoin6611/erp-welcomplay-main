'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Complaint { id: string; employeeFrom: string; complaintAgainst: string; title: string; date: string; description: string; status: 'Pending' | 'In Progress' | 'Resolved'; }

export function ComplaintsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ employeeFrom: '', complaintAgainst: '', title: '', date: '', description: '', status: 'Pending' as const });
  const [data, setData] = useState<Complaint[]>([
    { id: '1', employeeFrom: 'Sarah Johnson', complaintAgainst: 'Mike Brown', title: 'Workplace Harassment', date: '2024-02-10', description: 'Unprofessional behavior', status: 'In Progress' },
    { id: '2', employeeFrom: 'John Smith', complaintAgainst: 'Tom Wilson', title: 'Code of Conduct Violation', date: '2024-01-25', description: 'Policy breach', status: 'Resolved' },
  ]);

  const employees = ['John Smith', 'Sarah Johnson', 'Mike Brown', 'Tom Wilson'];
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingId) { setData(data.map((item) => (item.id === editingId ? { ...item, ...formData } : item))); } else { setData([...data, { id: Date.now().toString(), ...formData }]); } setShowForm(false); };
  const filteredData = data.filter((d) => d.employeeFrom.toLowerCase().includes(searchTerm.toLowerCase()) || d.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (<div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Complaints</p><p className="text-2xl font-bold">{data.length}</p></div><AlertCircle className="w-8 h-8 text-muted-foreground" /></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-600">{data.filter((d) => d.status === 'Pending').length}</p></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">Resolved</p><p className="text-2xl font-bold text-green-600">{data.filter((d) => d.status === 'Resolved').length}</p></div></CardContent></Card>
    </div>
    <div className="flex justify-end"><Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ employeeFrom: '', complaintAgainst: '', title: '', date: '', description: '', status: 'Pending' }); }} className="bg-blue-500 hover:bg-blue-600 shadow-none"><Plus className="w-4 h-4 mr-2" />Create Complaint</Button></div>
    {showForm && (<Card><CardContent className="pt-6"><h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Complaint</h3><form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Employee From</Label><Select value={formData.employeeFrom} onValueChange={(value) => setFormData({ ...formData, employeeFrom: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Complaint Against</Label><Select value={formData.complaintAgainst} onValueChange={(value) => setFormData({ ...formData, complaintAgainst: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Title</Label><Input value={formData.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })} required /></div><div className="space-y-2"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })} required /></div></div>
      <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(value: 'Pending' | 'In Progress' | 'Resolved') => setFormData({ ...formData, status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Resolved">Resolved</SelectItem></SelectContent></Select></div>
      <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
      <div className="flex gap-2"><Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">{editingId ? 'Update' : 'Create'}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
    </form></CardContent></Card>)}
    <Card><CardContent className="pt-6"><div className="relative mb-4"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /><Input placeholder="Search..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-10" /></div>
      <Table><TableHeader><TableRow><TableHead>From</TableHead><TableHead>Against</TableHead><TableHead>Title</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
        {filteredData.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No complaints found</TableCell></TableRow> : filteredData.map((d) => (<TableRow key={d.id}><TableCell className="font-medium">{d.employeeFrom}</TableCell><TableCell>{d.complaintAgainst}</TableCell><TableCell>{d.title}</TableCell><TableCell>{d.date}</TableCell><TableCell><Badge className={d.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : d.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>{d.status}</Badge></TableCell><TableCell className="max-w-xs truncate">{d.description}</TableCell><TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => { setShowForm(true); setEditingId(d.id); setFormData({ employeeFrom: d.employeeFrom, complaintAgainst: d.complaintAgainst, title: d.title, date: d.date, description: d.description, status: d.status }); }}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="outline" onClick={() => { if (confirm('Delete?')) setData(data.filter((item) => item.id !== d.id)); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>))}
      </TableBody></Table>
    </CardContent></Card>
  </div>);
}
