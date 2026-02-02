'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, HelpCircle, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { getQuestionsList, addQuestion, updateQuestion, removeQuestionById } from '@/lib/recruitment-data';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

export function CustomQuestionsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    isRequired: '',
  });
  const [questions, setQuestions] = useState(() => getQuestionsList());

  const refreshQuestions = () => setQuestions([...getQuestionsList()]);

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      question: '',
      isRequired: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateQuestion(editingId, { question: formData.question, isRequired: formData.isRequired });
    } else {
      addQuestion({ question: formData.question, isRequired: formData.isRequired });
    }
    refreshQuestions();
    setShowForm(false);
    setFormData({ question: '', isRequired: '' });
  };

  const handleEdit = (item: { id: string; question: string; isRequired: string }) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      question: item.question,
      isRequired: item.isRequired,
    });
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteQuestionId(id);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteQuestionId) {
      removeQuestionById(deleteQuestionId);
      refreshQuestions();
      setDeleteQuestionId(null);
    }
    setDeleteAlertOpen(false);
  };

  const filteredData = questions.filter((question) =>
    question.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Summary Cards - reference-erp custom question */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{questions.length}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Required</p>
                <p className="text-2xl font-bold text-blue-600">
                  {questions.filter((q) => q.isRequired === 'yes').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Optional</p>
                <p className="text-2xl font-bold text-gray-600">
                  {questions.filter((q) => q.isRequired === 'no').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className={cardClass}>
          <CardContent className="px-6 py-4 pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create New'} Custom Question</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  rows={3}
                  placeholder="Enter your question..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isRequired">Is Required?</Label>
                <Select
                  value={formData.isRequired}
                  onValueChange={(value) => setFormData({ ...formData, isRequired: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes (Required)</SelectItem>
                    <SelectItem value="no">No (Optional)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Custom Question - satu card: header (title + search + Create), table */}
      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 pb-4">
          <CardTitle className="text-base font-semibold">Custom Question</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full min-w-[200px] max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-9 border-0 bg-gray-50 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0"
              />
            </div>
            <Button size="sm" className="h-9 shadow-none bg-blue-600 text-white hover:bg-blue-700" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Create Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/30">
                <TableHead className="px-6">Question</TableHead>
                <TableHead className="px-6">Is Required</TableHead>
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-6 text-center py-8 text-muted-foreground">
                    No custom questions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((question) => (
                  <TableRow key={question.id} className="border-b">
                    <TableCell className="px-6 font-medium">{question.question}</TableCell>
                    <TableCell className="px-6">
                      {question.isRequired === 'yes' ? (
                        <Badge className="bg-blue-100 text-blue-800">Required</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => router.push(`/hrm/recruitment/questions/${question.id}`)} title="View" className="h-7 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => router.push(`/hrm/recruitment/questions/${question.id}/edit`)} title="Edit" className="h-7 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openDeleteConfirm(question.id)} title="Delete" className="h-7 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Custom Question?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pertanyaan akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2">
            <AlertDialogCancel type="button">Batal</AlertDialogCancel>
            <AlertDialogAction type="button" onClick={handleDeleteConfirm}>
              <span>Hapus</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
