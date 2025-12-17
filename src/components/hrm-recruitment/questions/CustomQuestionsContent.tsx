'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, HelpCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface CustomQuestion {
  id: string;
  question: string;
  isRequired: string;
}

export function CustomQuestionsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    isRequired: '',
  });

  // Mock data
  const [questions, setQuestions] = useState<CustomQuestion[]>([
    {
      id: '1',
      question: 'Why do you want to work for our company?',
      isRequired: 'yes',
    },
    {
      id: '2',
      question: 'What are your salary expectations?',
      isRequired: 'no',
    },
    {
      id: '3',
      question: 'When are you available to start?',
      isRequired: 'yes',
    },
  ]);

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
      setQuestions(
        questions.map((item) =>
          item.id === editingId
            ? {
                ...item,
                question: formData.question,
                isRequired: formData.isRequired,
              }
            : item
        )
      );
    } else {
      const newItem: CustomQuestion = {
        id: Date.now().toString(),
        question: formData.question,
        isRequired: formData.isRequired,
      };
      setQuestions([...questions, newItem]);
    }
    setShowForm(false);
    setFormData({
      question: '',
      isRequired: '',
    });
  };

  const handleEdit = (item: CustomQuestion) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      question: item.question,
      isRequired: item.isRequired,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter((item) => item.id !== id));
    }
  };

  const filteredData = questions.filter((question) =>
    question.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{questions.length}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
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
        <Card>
          <CardContent className="pt-6">
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

      {/* Add Button */}
      <div className="flex justify-end items-center">
        <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 shadow-none">
          <Plus className="w-4 h-4 mr-2" />
          Create Question
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
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

      {/* Questions List */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Is Required</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No custom questions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.question}</TableCell>
                    <TableCell>
                      {question.isRequired === 'yes' ? (
                        <Badge className="bg-blue-100 text-blue-800">Required</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(question)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(question.id)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                        >
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
    </div>
  );
}
