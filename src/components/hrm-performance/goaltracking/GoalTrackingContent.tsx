'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { StarRatingDisplay } from '../StarRatingDisplay';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

interface GoalTracking {
  id: string;
  goalType: string;
  subject: string;
  branch: string;
  targetAchievement: string;
  startDate: string;
  endDate: string;
  rating: number;
  progress: number;
}

export function GoalTrackingContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    goalType: '',
    subject: '',
    branch: '',
    targetAchievement: '',
    startDate: '',
    endDate: '',
    rating: '',
    progress: '',
  });

  // Mock data
  const [goalTrackings, setGoalTrackings] = useState<GoalTracking[]>([
    {
      id: '1',
      goalType: 'Revenue',
      subject: 'Increase Sales by 20%',
      branch: 'Head Office',
      targetAchievement: '1000000',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      rating: 4,
      progress: 65,
    },
    {
      id: '2',
      goalType: 'Customer Satisfaction',
      subject: 'Improve Customer Retention',
      branch: 'Branch A',
      targetAchievement: '95%',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      rating: 5,
      progress: 80,
    },
    {
      id: '3',
      goalType: 'Efficiency',
      subject: 'Reduce Operational Costs',
      branch: 'Head Office',
      targetAchievement: '15% Reduction',
      startDate: '2024-02-01',
      endDate: '2024-12-31',
      rating: 3,
      progress: 45,
    },
  ]);

  const goalTypes = ['Revenue', 'Customer Satisfaction', 'Efficiency', 'Product Development', 'Market Expansion'];
  const branches = ['Head Office', 'Branch A', 'Branch B'];

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      goalType: '',
      subject: '',
      branch: '',
      targetAchievement: '',
      startDate: '',
      endDate: '',
      rating: '',
      progress: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setGoalTrackings(
        goalTrackings.map((item) =>
          item.id === editingId
            ? {
                ...item,
                goalType: formData.goalType,
                subject: formData.subject,
                branch: formData.branch,
                targetAchievement: formData.targetAchievement,
                startDate: formData.startDate,
                endDate: formData.endDate,
                rating: parseInt(formData.rating),
                progress: parseInt(formData.progress),
              }
            : item
        )
      );
    } else {
      const newItem: GoalTracking = {
        id: Date.now().toString(),
        goalType: formData.goalType,
        subject: formData.subject,
        branch: formData.branch,
        targetAchievement: formData.targetAchievement,
        startDate: formData.startDate,
        endDate: formData.endDate,
        rating: parseInt(formData.rating),
        progress: parseInt(formData.progress),
      };
      setGoalTrackings([...goalTrackings, newItem]);
    }
    setShowForm(false);
    setFormData({
      goalType: '',
      subject: '',
      branch: '',
      targetAchievement: '',
      startDate: '',
      endDate: '',
      rating: '',
      progress: '',
    });
  };

  const handleEdit = (item: GoalTracking) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      goalType: item.goalType,
      subject: item.subject,
      branch: item.branch,
      targetAchievement: item.targetAchievement,
      startDate: item.startDate,
      endDate: item.endDate,
      rating: item.rating.toString(),
      progress: item.progress.toString(),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this goal tracking?')) {
      setGoalTrackings(goalTrackings.filter((item) => item.id !== id));
    }
  };

  const filteredData = goalTrackings.filter(
    (goal) =>
      goal.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.goalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">{goalTrackings.length}</p>
              </div>
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {goalTrackings.length > 0
                    ? Math.round(goalTrackings.reduce((sum, goal) => sum + goal.progress, 0) / goalTrackings.length)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-green-600">
                  {goalTrackings.filter((goal) => goal.progress >= 60).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold text-red-600">
                  {goalTrackings.filter((goal) => goal.progress < 40).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end items-center">
        <Button onClick={handleAdd} className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
          <Plus className="w-4 h-4 mr-2" />
          Create Goal Tracking
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className={cardClass}>
          <CardContent className="px-4 py-4 pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create New'} Goal Tracking</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goalType">Goal Type</Label>
                  <Select
                    value={formData.goalType}
                    onValueChange={(value) => setFormData({ ...formData, goalType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAchievement">Target Achievement</Label>
                  <Input
                    id="targetAchievement"
                    value={formData.targetAchievement}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, targetAchievement: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, progress: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Select value={formData.rating} onValueChange={(value) => setFormData({ ...formData, rating: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((r) => (
                        <SelectItem key={r} value={r.toString()}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
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

      {/* Goal Tracking List - reference: goaltracking/index */}
      <Card className={cardClass}>
        <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Manage Goal Tracking</h3>
          <div className="relative w-full max-w-[280px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by subject, goal type, or branch..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">Goal Type</TableHead>
                <TableHead className="px-4 py-3">Subject</TableHead>
                <TableHead className="px-4 py-3">Branch</TableHead>
                <TableHead className="px-4 py-3">Target Achievement</TableHead>
                <TableHead className="px-4 py-3">Start Date</TableHead>
                <TableHead className="px-4 py-3">End Date</TableHead>
                <TableHead className="px-4 py-3 text-center">Rating</TableHead>
                <TableHead className="px-4 py-3">Progress</TableHead>
                <TableHead className="px-4 py-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground px-4 py-3">
                    No goal trackings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell className="px-4 py-3 font-medium">{goal.goalType}</TableCell>
                    <TableCell className="px-4 py-3">{goal.subject}</TableCell>
                    <TableCell className="px-4 py-3">{goal.branch}</TableCell>
                    <TableCell className="px-4 py-3">{goal.targetAchievement}</TableCell>
                    <TableCell className="px-4 py-3">{goal.startDate}</TableCell>
                    <TableCell className="px-4 py-3">{goal.endDate}</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <StarRatingDisplay rating={goal.rating} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="w-full max-w-[150px]">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className={`h-2 mt-1 ${getProgressColor(goal.progress)}`} />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(goal)}
                          title="Edit"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(goal.id)}
                          title="Delete"
                          className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
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
