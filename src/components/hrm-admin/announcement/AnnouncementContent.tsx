'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

  const statCardClass = 'rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';
  const tabColor = { iconBg: 'bg-purple-100', iconText: 'text-purple-600', accent: 'text-purple-600' };
  const iconBoxClass = `w-10 h-10 rounded-lg flex items-center justify-center ${tabColor.iconBg}`;
  const iconClass = `w-5 h-5 ${tabColor.iconText}`;
  const accentClass = `text-2xl font-bold ${tabColor.accent}`;

  return (<div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className={statCardClass}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Announcements</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </div>
            <div className={iconBoxClass}>
              <Megaphone className={iconClass} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className={statCardClass}>
        <CardContent className="pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className={accentClass}>{data.filter((d) => d.status === 'Active').length}</p>
          </div>
        </CardContent>
      </Card>
      <Card className={statCardClass}>
        <CardContent className="pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Expired</p>
            <p className={accentClass}>{data.filter((d) => d.status === 'Expired').length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
    {showForm && (<Card><CardContent className="pt-6"><h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Announcement</h3><form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2"><Label>Title</Label><Input value={formData.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })} required /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Branch</Label><Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{branches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Department</Label><Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Start Date</Label><Input type="date" value={formData.startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startDate: e.target.value })} required /></div><div className="space-y-2"><Label>End Date</Label><Input type="date" value={formData.endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endDate: e.target.value })} required /></div></div>
      <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
      <div className="flex gap-2"><Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">{editingId ? 'Update' : 'Create'}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
    </form></CardContent></Card>)}
    <Card>
      <CardHeader className="flex flex-row items-center justify-end space-y-0 px-6 py-3.5">
        <div className="flex items-center gap-3 ml-auto">
          <div className="relative w-56 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="h-8 bg-gray-50 pl-9 pr-3 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm" />
          </div>
          <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: '', branch: '', department: '', startDate: '', endDate: '', description: '' }); }} size="sm" className="h-8 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200 flex-shrink-0"><Plus className="w-4 h-4 mr-2" />Create Announcement</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
      <Table><TableHeader><TableRow><TableHead className="px-6">Title</TableHead><TableHead className="px-6">Branch</TableHead><TableHead className="px-6">Department</TableHead><TableHead className="px-6">Start Date</TableHead><TableHead className="px-6">End Date</TableHead><TableHead className="px-6">Status</TableHead><TableHead className="px-6">Description</TableHead><TableHead className="px-6 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
        {filteredData.length === 0 ? <TableRow><TableCell colSpan={8} className="px-6 text-center py-8 text-muted-foreground">No announcements found</TableCell></TableRow> : filteredData.map((d) => (<TableRow key={d.id}><TableCell className="px-6 font-medium">{d.title}</TableCell><TableCell className="px-6">{d.branch}</TableCell><TableCell className="px-6">{d.department}</TableCell><TableCell className="px-6">{d.startDate}</TableCell><TableCell className="px-6">{d.endDate}</TableCell><TableCell className="px-6"><Badge className={d.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{d.status}</Badge></TableCell><TableCell className="px-6 max-w-xs truncate">{d.description}</TableCell><TableCell className="px-6"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" className="h-7 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={() => { setShowForm(true); setEditingId(d.id); setFormData({ title: d.title, branch: d.branch, department: d.department, startDate: d.startDate, endDate: d.endDate, description: d.description }); }}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="outline" className="h-7 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200" onClick={() => { if (confirm('Hapus announcement? Tindakan tidak dapat dibatalkan.')) setData(data.filter((item) => item.id !== d.id)); }}><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>))}
      </TableBody></Table>
      </CardContent></Card>
  </div>);
}
