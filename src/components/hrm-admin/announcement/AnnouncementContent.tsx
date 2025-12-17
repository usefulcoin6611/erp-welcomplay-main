'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Megaphone } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Announcement { id: string; title: string; branch: string; department: string; startDate: string; endDate: string; description: string; status: string; }

export function AnnouncementContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', branch: '', department: '', startDate: '', endDate: '', description: '' });
  const [data, setData] = useState<Announcement[]>([
    { id: '1', title: 'Company Holiday', branch: 'All Branches', department: 'All', startDate: '2024-03-01', endDate: '2024-03-05', description: 'Office closed for holiday', status: 'Active' },
    { id: '2', title: 'Team Building Event', branch: 'HQ', department: 'All', startDate: '2024-02-01', endDate: '2024-02-01', description: 'Annual team building', status: 'Expired' },
  ]);

  const branches = ['All Branches', 'HQ', 'Branch A', 'Branch B'];
  const departments = ['All', 'HR', 'IT', 'Finance', 'Sales'];
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const status = new Date(formData.endDate) >= new Date() ? 'Active' : 'Expired'; if (editingId) { setData(data.map((item) => (item.id === editingId ? { ...item, ...formData, status } : item))); } else { setData([...data, { id: Date.now().toString(), ...formData, status }]); } setShowForm(false); };
  const filteredData = data.filter((d) => d.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (<div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Announcements</p><p className="text-2xl font-bold">{data.length}</p></div><Megaphone className="w-8 h-8 text-muted-foreground" /></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{data.filter((d) => d.status === 'Active').length}</p></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">Expired</p><p className="text-2xl font-bold text-red-600">{data.filter((d) => d.status === 'Expired').length}</p></div></CardContent></Card>
    </div>
    <div className="flex justify-end"><Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: '', branch: '', department: '', startDate: '', endDate: '', description: '' }); }} className="bg-blue-500 hover:bg-blue-600 shadow-none"><Plus className="w-4 h-4 mr-2" />Create Announcement</Button></div>
    {showForm && (<Card><CardContent className="pt-6"><h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Announcement</h3><form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2"><Label>Title</Label><Input value={formData.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })} required /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Branch</Label><Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{branches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Department</Label><Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Start Date</Label><Input type="date" value={formData.startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startDate: e.target.value })} required /></div><div className="space-y-2"><Label>End Date</Label><Input type="date" value={formData.endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endDate: e.target.value })} required /></div></div>
      <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
      <div className="flex gap-2"><Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">{editingId ? 'Update' : 'Create'}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
    </form></CardContent></Card>)}
    <Card><CardContent className="pt-6"><div className="relative mb-4"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /><Input placeholder="Search..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-10" /></div>
      <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Branch</TableHead><TableHead>Department</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Status</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
        {filteredData.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No announcements found</TableCell></TableRow> : filteredData.map((d) => (<TableRow key={d.id}><TableCell className="font-medium">{d.title}</TableCell><TableCell>{d.branch}</TableCell><TableCell>{d.department}</TableCell><TableCell>{d.startDate}</TableCell><TableCell>{d.endDate}</TableCell><TableCell><Badge className={d.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{d.status}</Badge></TableCell><TableCell className="max-w-xs truncate">{d.description}</TableCell><TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => { setShowForm(true); setEditingId(d.id); setFormData({ title: d.title, branch: d.branch, department: d.department, startDate: d.startDate, endDate: d.endDate, description: d.description }); }}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="outline" onClick={() => { if (confirm('Delete?')) setData(data.filter((item) => item.id !== d.id)); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>))}
      </TableBody></Table>
    </CardContent></Card>
  </div>);
}
