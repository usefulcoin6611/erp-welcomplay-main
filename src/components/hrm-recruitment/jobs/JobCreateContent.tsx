'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { addJob, getJobCategoriesList, getQuestionsList } from '@/lib/recruitment-data';
import { toast } from 'sonner';
import { X } from 'lucide-react';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]';

const branches = ['Head Office', 'Branch A', 'Branch B'];
const statusOptions: { value: 'active' | 'in_active'; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'in_active', label: 'In Active' },
];

const needToAskOptions = [
  { id: 'gender', label: 'Gender' },
  { id: 'dob', label: 'Date Of Birth' },
  { id: 'country', label: 'Country' },
] as const;

const needToShowOptions = [
  { id: 'profile', label: 'Profile Image' },
  { id: 'resume', label: 'Resume' },
  { id: 'letter', label: 'Cover Letter' },
  { id: 'terms', label: 'Terms And Conditions' },
] as const;

export function JobCreateContent() {
  const router = useRouter();
  const categories = getJobCategoriesList();
  const customQuestions = getQuestionsList();

  const [formData, setFormData] = useState({
    title: '',
    branch: '',
    category: '',
    positions: '',
    status: 'active' as 'active' | 'in_active',
    startDate: '',
    endDate: '',
    description: '',
    requirement: '',
    skillInput: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [applicant, setApplicant] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<string[]>([]);
  const [customQuestionIds, setCustomQuestionIds] = useState<string[]>([]);

  const setApplicantChecked = useCallback((id: string, checked: boolean | 'indeterminate') => {
    setApplicant((prev) =>
      checked === true ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)
    );
  }, []);
  const setVisibilityChecked = useCallback((id: string, checked: boolean | 'indeterminate') => {
    setVisibility((prev) =>
      checked === true ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)
    );
  }, []);
  const setCustomQuestionChecked = useCallback((id: string, checked: boolean | 'indeterminate') => {
    setCustomQuestionIds((prev) =>
      checked === true ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)
    );
  }, []);

  const addSkill = useCallback(() => {
    const v = formData.skillInput.trim();
    if (v && !skills.includes(v)) {
      setSkills((prev) => [...prev, v]);
      setFormData((prev) => ({ ...prev, skillInput: '' }));
    }
  }, [formData.skillInput, skills]);

  const removeSkill = useCallback((skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }, []);

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addJob({
      title: formData.title,
      branch: formData.branch,
      category: formData.category,
      positions: parseInt(formData.positions, 10) || 0,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description || undefined,
    });
    toast.success('Job berhasil dibuat');
    setFormData({
      title: '',
      branch: '',
      category: '',
      positions: '',
      status: 'active',
      startDate: '',
      endDate: '',
      description: '',
      requirement: '',
      skillInput: '',
    });
    setSkills([]);
    setApplicant([]);
    setVisibility([]);
    setCustomQuestionIds([]);
  };

  const handleCancel = () => {
    router.push('/hrm/recruitment?tab=jobs');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Kolom kiri (info dasar) + Kolom kanan (need to ask / show / custom question) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className={cardClass}>
            <CardContent className="px-6 py-4 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter Job Title"
                    className="h-9"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select value={formData.branch} onValueChange={(v) => setFormData({ ...formData, branch: v })}>
                      <SelectTrigger id="branch" className="h-9">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Job Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger id="category" className="h-9">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.title}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="positions">Positions</Label>
                    <Input
                      id="positions"
                      type="number"
                      min={1}
                      value={formData.positions}
                      onChange={(e) => setFormData({ ...formData, positions: e.target.value })}
                      placeholder="Enter Positions"
                      className="h-9"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as 'active' | 'in_active' })}
                    >
                      <SelectTrigger id="status" className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="h-9"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="h-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill">Skill</Label>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="pl-2 pr-1 py-0.5 gap-1 font-normal"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="rounded-full p-0.5 hover:bg-muted"
                          aria-label={`Hapus ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <Input
                      id="skill"
                      value={formData.skillInput}
                      onChange={(e) => setFormData({ ...formData, skillInput: e.target.value })}
                      onKeyDown={handleSkillKeyDown}
                      onBlur={addSkill}
                      placeholder="Skill (Enter atau koma untuk tambah)"
                      className="h-9 flex-1 min-w-[140px]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="px-6 py-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <h6 className="text-sm font-semibold text-foreground mb-3">Need to ask ?</h6>
                  <div className="space-y-3">
                    {needToAskOptions.map((opt) => (
                      <label
                        key={opt.id}
                        htmlFor={`ask-${opt.id}`}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <Checkbox
                          id={`ask-${opt.id}`}
                          checked={applicant.includes(opt.id)}
                          onCheckedChange={(checked) => setApplicantChecked(opt.id, checked)}
                        />
                        <span className="text-sm font-normal text-foreground">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <h6 className="text-sm font-semibold text-foreground mb-3">Need to show option ?</h6>
                  <div className="space-y-3">
                    {needToShowOptions.map((opt) => (
                      <label
                        key={opt.id}
                        htmlFor={`show-${opt.id}`}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <Checkbox
                          id={`show-${opt.id}`}
                          checked={visibility.includes(opt.id)}
                          onCheckedChange={(checked) => setVisibilityChecked(opt.id, checked)}
                        />
                        <span className="text-sm font-normal text-foreground">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-1">
                <h6 className="text-sm font-semibold text-foreground mb-3">Custom Question</h6>
                <div className="space-y-3">
                  {customQuestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Tidak ada pertanyaan kustom. Buat di tab Custom Question.</p>
                  ) : (
                    customQuestions.map((q) => (
                      <label
                        key={q.id}
                        htmlFor={`cq-${q.id}`}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <Checkbox
                          id={`cq-${q.id}`}
                          checked={customQuestionIds.includes(q.id)}
                          onCheckedChange={(checked) => setCustomQuestionChecked(q.id, checked)}
                        />
                        <span className="text-sm font-normal text-foreground">{q.question}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Job Description (kiri) + Job Requirement (kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className={cardClass}>
            <CardContent className="px-6 py-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={8}
                  placeholder="Enter Job Description"
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
          <Card className={cardClass}>
            <CardContent className="px-6 py-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="requirement">Job Requirement</Label>
                <Textarea
                  id="requirement"
                  value={formData.requirement}
                  onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                  rows={8}
                  placeholder="Enter Job Requirement"
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="h-9" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-none">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
