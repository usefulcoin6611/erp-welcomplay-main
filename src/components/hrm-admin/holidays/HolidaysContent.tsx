'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

  const statCardClass = 'rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';
  const tabColor = { iconBg: 'bg-teal-100', iconText: 'text-teal-600', accent: 'text-teal-600' };
  const iconBoxClass = `w-10 h-10 rounded-lg flex items-center justify-center ${tabColor.iconBg}`;
  const iconClass = `w-5 h-5 ${tabColor.iconText}`;
  const accentClass = `text-2xl font-bold ${tabColor.accent}`;

  return (<div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className={statCardClass}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Holidays</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </div>
            <div className={iconBoxClass}>
              <Calendar className={iconClass} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className={statCardClass}>
        <CardContent className="pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <p className={accentClass}>{upcoming}</p>
          </div>
        </CardContent>
      </Card>
      <Card className={statCardClass}>
        <CardContent className="pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Past</p>
            <p className={accentClass}>{past}</p>
          </div>
        </CardContent>
      </Card>
    </div>
    {showForm && (<Card><CardContent className="pt-6"><h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Holiday</h3><form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Holiday Name</Label><Input value={formData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })} required /></div><div className="space-y-2"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })} required /></div></div>
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
          <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', date: '', description: '' }); }} size="sm" className="h-8 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200 flex-shrink-0"><Plus className="w-4 h-4 mr-2" />Create Holiday</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
      <Table><TableHeader><TableRow><TableHead className="px-6">Holiday Name</TableHead><TableHead className="px-6">Date</TableHead><TableHead className="px-6">Description</TableHead><TableHead className="px-6 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
        {filteredData.length === 0 ? <TableRow><TableCell colSpan={4} className="px-6 text-center py-8 text-muted-foreground">No holidays found</TableCell></TableRow> : filteredData.map((d) => (<TableRow key={d.id}><TableCell className="px-6 font-medium">{d.name}</TableCell><TableCell className="px-6">{d.date}</TableCell><TableCell className="px-6 max-w-xs truncate">{d.description}</TableCell><TableCell className="px-6"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" className="h-7 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={() => { setShowForm(true); setEditingId(d.id); setFormData({ name: d.name, date: d.date, description: d.description }); }}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="outline" className="h-7 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200" onClick={() => { if (confirm('Hapus holiday? Tindakan tidak dapat dibatalkan.')) setData(data.filter((item) => item.id !== d.id)); }}><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>))}
      </TableBody></Table>
      </CardContent></Card>
  </div>);
}
