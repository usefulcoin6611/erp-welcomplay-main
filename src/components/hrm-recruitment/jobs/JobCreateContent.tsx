'use client';

import { useState, useCallback, KeyboardEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]';

const statusOptions: { value: 'active' | 'in_active'; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'in_active', label: 'In Active' },
];

type BranchOption = { id: string; name: string };
type CategoryOption = { id: string; name: string };
type QuestionOption = { id: string; question: string; isRequired: string };

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
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [customQuestions, setCustomQuestions] = useState<QuestionOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    branchId: '',
    jobCategoryId: '',
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [branchRes, categoryRes, questionRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/job-categories'),
          fetch('/api/hrm/recruitment/questions'),
        ]);
        const branchJson = await branchRes.json();
        const categoryJson = await categoryRes.json();
        const questionJson = await questionRes.json();
        if (!cancelled) {
          if (branchJson.success && Array.isArray(branchJson.data)) setBranches(branchJson.data);
          if (categoryJson.success && Array.isArray(categoryJson.data)) setCategories(categoryJson.data);
          if (questionJson.success && Array.isArray(questionJson.data)) setCustomQuestions(questionJson.data);
        }
      } catch (e) {
        if (!cancelled) toast.error('Gagal memuat opsi branch/category/question');
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchId || !formData.jobCategoryId) {
      toast.error('Branch dan Job category wajib dipilih');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/hrm/recruitment/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          branchId: formData.branchId,
          jobCategoryId: formData.jobCategoryId,
          positions: parseInt(formData.positions, 10) || 0,
          status: formData.status,
          startDate: formData.startDate,
          endDate: formData.endDate,
          description: formData.description || undefined,
          requirement: formData.requirement || undefined,
          skill: skills.length ? skills : undefined,
          applicant: applicant.length ? applicant : undefined,
          visibility: visibility.length ? visibility : undefined,
          questionIds: customQuestionIds.length ? customQuestionIds : undefined,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.id) {
        toast.success(json.message ?? 'Job berhasil dibuat');
        router.push(`/hrm/recruitment/jobs/${json.data.id}`);
      } else {
        toast.error(json.message ?? 'Gagal membuat job');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal membuat job');
    } finally {
      setSubmitting(false);
    }
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
                    <Select value={formData.branchId} onValueChange={(v) => setFormData({ ...formData, branchId: v })}>
                      <SelectTrigger id="branch" className="h-9">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Job Category</Label>
                    <Select value={formData.jobCategoryId} onValueChange={(v) => setFormData({ ...formData, jobCategoryId: v })}>
                      <SelectTrigger id="category" className="h-9">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
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

        {/* Row 2: Job Description (kiri) + Job Requirement (kanan) - Rich HTML */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className={cardClass}>
            <CardContent className="px-6 py-4 pt-6">
              <RichTextEditor
                id="description"
                label="Job Description"
                value={formData.description}
                onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))}
                placeholder="Enter Job Description (bold, list, link, dll.)"
                minHeight="220px"
              />
            </CardContent>
          </Card>
          <Card className={cardClass}>
            <CardContent className="px-6 py-4 pt-6">
              <RichTextEditor
                id="requirement"
                label="Job Requirement"
                value={formData.requirement}
                onChange={(html) => setFormData((prev) => ({ ...prev, requirement: html }))}
                placeholder="Enter Job Requirement (bold, list, link, dll.)"
                minHeight="220px"
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="h-9" onClick={handleCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-none" disabled={submitting || optionsLoading}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
}
