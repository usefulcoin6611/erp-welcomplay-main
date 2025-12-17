'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Calendar } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Holiday { id: string; name: string; date: string; description: string; }

export function HolidaysContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', date: '', description: '' });
  const [data, setData] = useState<Holiday[]>([
    { id: '1', name: 'New Year Day', date: '2024-01-01', description: 'New Year celebration' },
    { id: '2', name: 'Independence Day', date: '2024-08-17', description: 'National holiday' },
    { id: '3', name: 'Christmas', date: '2024-12-25', description: 'Christmas celebration' },
  ]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingId) { setData(data.map((item) => (item.id === editingId ? { ...item, ...formData } : item))); } else { setData([...data, { id: Date.now().toString(), ...formData }]); } setShowForm(false); };
  const filteredData = data.filter((d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const today = new Date();
  const upcoming = data.filter((d) => new Date(d.date) > today).length;
  const past = data.filter((d) => new Date(d.date) < today).length;

  return (<div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Holidays</p><p className="text-2xl font-bold">{data.length}</p></div><Calendar className="w-8 h-8 text-muted-foreground" /></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">Upcoming</p><p className="text-2xl font-bold text-green-600">{upcoming}</p></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">Past</p><p className="text-2xl font-bold text-blue-600">{past}</p></div></CardContent></Card>
    </div>
    <div className="flex justify-end"><Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', date: '', description: '' }); }} className="bg-blue-500 hover:bg-blue-600 shadow-none"><Plus className="w-4 h-4 mr-2" />Create Holiday</Button></div>
    {showForm && (<Card><CardContent className="pt-6"><h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Holiday</h3><form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Holiday Name</Label><Input value={formData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })} required /></div><div className="space-y-2"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })} required /></div></div>
      <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
      <div className="flex gap-2"><Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">{editingId ? 'Update' : 'Create'}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
    </form></CardContent></Card>)}
    <Card><CardContent className="pt-6"><div className="relative mb-4"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /><Input placeholder="Search..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-10" /></div>
      <Table><TableHeader><TableRow><TableHead>Holiday Name</TableHead><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
        {filteredData.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No holidays found</TableCell></TableRow> : filteredData.map((d) => (<TableRow key={d.id}><TableCell className="font-medium">{d.name}</TableCell><TableCell>{d.date}</TableCell><TableCell className="max-w-xs truncate">{d.description}</TableCell><TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => { setShowForm(true); setEditingId(d.id); setFormData({ name: d.name, date: d.date, description: d.description }); }}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="outline" onClick={() => { if (confirm('Delete?')) setData(data.filter((item) => item.id !== d.id)); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>))}
      </TableBody></Table>
    </CardContent></Card>
  </div>);
}
