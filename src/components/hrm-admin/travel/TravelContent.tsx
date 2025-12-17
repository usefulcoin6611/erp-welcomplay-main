'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Plane } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Travel { id: string; employeeName: string; startDate: string; endDate: string; purpose: string; country: string; description: string; }

export function TravelContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ employeeName: '', startDate: '', endDate: '', purpose: '', country: '', description: '' });
  const [data, setData] = useState<Travel[]>([
    { id: '1', employeeName: 'John Smith', startDate: '2024-03-01', endDate: '2024-03-05', purpose: 'Client Meeting', country: 'Singapore', description: 'Meet with potential clients' },
    { id: '2', employeeName: 'Sarah Johnson', startDate: '2024-02-15', endDate: '2024-02-20', purpose: 'Conference', country: 'USA', description: 'Attend tech conference' },
  ]);

  const employees = ['John Smith', 'Sarah Johnson', 'Mike Brown'];
  const countries = ['Singapore', 'USA', 'UK', 'Australia', 'Japan'];
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingId) { setData(data.map((item) => (item.id === editingId ? { ...item, ...formData } : item))); } else { setData([...data, { id: Date.now().toString(), ...formData }]); } setShowForm(false); };
  const filteredData = data.filter((d) => d.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || d.country.toLowerCase().includes(searchTerm.toLowerCase()));

  return (<div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Trips</p><p className="text-2xl font-bold">{data.length}</p></div><Plane className="w-8 h-8 text-muted-foreground" /></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">Ongoing</p><p className="text-2xl font-bold text-blue-600">{data.filter((d) => new Date(d.startDate) <= new Date() && new Date(d.endDate) >= new Date()).length}</p></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">Upcoming</p><p className="text-2xl font-bold text-green-600">{data.filter((d) => new Date(d.startDate) > new Date()).length}</p></div></CardContent></Card>
    </div>
    <div className="flex justify-end"><Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ employeeName: '', startDate: '', endDate: '', purpose: '', country: '', description: '' }); }} className="bg-blue-500 hover:bg-blue-600 shadow-none"><Plus className="w-4 h-4 mr-2" />Create Trip</Button></div>
    {showForm && (<Card><CardContent className="pt-6"><h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Trip</h3><form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Employee Name</Label><Select value={formData.employeeName} onValueChange={(value) => setFormData({ ...formData, employeeName: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Country</Label><Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>Start Date</Label><Input type="date" value={formData.startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startDate: e.target.value })} required /></div><div className="space-y-2"><Label>End Date</Label><Input type="date" value={formData.endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endDate: e.target.value })} required /></div><div className="space-y-2"><Label>Purpose</Label><Input value={formData.purpose} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, purpose: e.target.value })} required /></div></div>
      <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
      <div className="flex gap-2"><Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">{editingId ? 'Update' : 'Create'}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
    </form></CardContent></Card>)}
    <Card><CardContent className="pt-6"><div className="relative mb-4"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /><Input placeholder="Search..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-10" /></div>
      <Table><TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Purpose</TableHead><TableHead>Country</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
        {filteredData.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No trips found</TableCell></TableRow> : filteredData.map((d) => (<TableRow key={d.id}><TableCell className="font-medium">{d.employeeName}</TableCell><TableCell>{d.startDate}</TableCell><TableCell>{d.endDate}</TableCell><TableCell>{d.purpose}</TableCell><TableCell>{d.country}</TableCell><TableCell className="max-w-xs truncate">{d.description}</TableCell><TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => { setShowForm(true); setEditingId(d.id); setFormData({ employeeName: d.employeeName, startDate: d.startDate, endDate: d.endDate, purpose: d.purpose, country: d.country, description: d.description }); }}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="outline" onClick={() => { if (confirm('Delete?')) setData(data.filter((item) => item.id !== d.id)); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>))}
      </TableBody></Table>
    </CardContent></Card>
  </div>);
}
