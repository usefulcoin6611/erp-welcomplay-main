'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  const [formData, setFormData] = useState<{ employeeFrom: string; complaintAgainst: string; title: string; date: string; description: string; status: 'Pending' | 'In Progress' | 'Resolved' }>({ employeeFrom: '', complaintAgainst: '', title: '', date: '', description: '', status: 'Pending' });
  const [data, setData] = useState<Complaint[]>([
    { id: '1', employeeFrom: 'Sarah Johnson', complaintAgainst: 'Mike Brown', title: 'Workplace Harassment', date: '2024-02-10', description: 'Unprofessional behavior', status: 'In Progress' },
    { id: '2', employeeFrom: 'John Smith', complaintAgainst: 'Tom Wilson', title: 'Code of Conduct Violation', date: '2024-01-25', description: 'Policy breach', status: 'Resolved' },
  ]);

  const employees = ['John Smith', 'Sarah Johnson', 'Mike Brown', 'Tom Wilson'];
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingId) { setData(data.map((item) => (item.id === editingId ? { ...item, ...formData } : item))); } else { setData([...data, { id: Date.now().toString(), ...formData }]); } setShowForm(false); };
  const filteredData = data.filter((d) => d.employeeFrom.toLowerCase().includes(searchTerm.toLowerCase()) || d.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const statCardClass = 'rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';
  const tabColor = { iconBg: 'bg-orange-100', iconText: 'text-orange-600', accent: 'text-orange-600' };
  const iconBoxClass = `w-10 h-10 rounded-lg flex items-center justify-center ${tabColor.iconBg}`;
  const iconClass = `w-5 h-5 ${tabColor.iconText}`;
  const accentClass = `text-2xl font-bold ${tabColor.accent}`;

  return (<div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className={statCardClass}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Complaints</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </div>
            <div className={iconBoxClass}>
              <AlertCircle className={iconClass} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className={statCardClass}>
        <CardContent className="pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className={accentClass}>{data.filter((d) => d.status === 'Pending').length}</p>
          </div>
        </CardContent>
      </Card>
      <Card className={statCardClass}>
        <CardContent className="pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className={accentClass}>{data.filter((d) => d.status === 'Resolved').length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
    {showForm && (<Card><CardContent className="pt-6"><h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Complaint</h3><form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Employee From</Label><Select value={formData.employeeFrom} onValueChange={(value) => setFormData({ ...formData, employeeFrom: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Complaint Against</Label><Select value={formData.complaintAgainst} onValueChange={(value) => setFormData({ ...formData, complaintAgainst: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Title</Label><Input value={formData.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })} required /></div><div className="space-y-2"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })} required /></div></div>
      <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(value: 'Pending' | 'In Progress' | 'Resolved') => setFormData({ ...formData, status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Resolved">Resolved</SelectItem></SelectContent></Select></div>
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
          <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ employeeFrom: '', complaintAgainst: '', title: '', date: '', description: '', status: 'Pending' }); }} size="sm" className="h-8 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200 flex-shrink-0"><Plus className="w-4 h-4 mr-2" />Create Complaint</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
      <Table><TableHeader><TableRow><TableHead className="px-6">From</TableHead><TableHead className="px-6">Against</TableHead><TableHead className="px-6">Title</TableHead><TableHead className="px-6">Date</TableHead><TableHead className="px-6">Status</TableHead><TableHead className="px-6">Description</TableHead><TableHead className="px-6 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
        {filteredData.length === 0 ? <TableRow><TableCell colSpan={7} className="px-6 text-center py-8 text-muted-foreground">No complaints found</TableCell></TableRow> : filteredData.map((d) => (<TableRow key={d.id}><TableCell className="px-6 font-medium">{d.employeeFrom}</TableCell><TableCell className="px-6">{d.complaintAgainst}</TableCell><TableCell className="px-6">{d.title}</TableCell><TableCell className="px-6">{d.date}</TableCell><TableCell className="px-6"><Badge className={d.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : d.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>{d.status}</Badge></TableCell><TableCell className="px-6 max-w-xs truncate">{d.description}</TableCell><TableCell className="px-6"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" className="h-7 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={() => { setShowForm(true); setEditingId(d.id); setFormData({ employeeFrom: d.employeeFrom, complaintAgainst: d.complaintAgainst, title: d.title, date: d.date, description: d.description, status: d.status }); }}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="outline" className="h-7 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200" onClick={() => { if (confirm('Hapus complaint? Tindakan tidak dapat dibatalkan.')) setData(data.filter((item) => item.id !== d.id)); }}><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>))}
      </TableBody></Table>
      </CardContent></Card>
  </div>);
}
