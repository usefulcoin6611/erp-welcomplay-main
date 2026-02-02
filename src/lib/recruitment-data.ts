/**
 * Mock recruitment data untuk Job Category, Job Stage, Job, Application, Candidate, Onboarding, Custom Question, Interview.
 * Digunakan oleh /hrm/recruitment tabs, detail & edit pages.
 */

export type JobCategoryDetail = {
  id: string;
  title: string;
};

export type JobStageDetail = {
  id: string;
  title: string;
  order?: number;
};

export type JobDetail = {
  id: string;
  title: string;
  branch: string;
  category: string;
  positions: number;
  status: 'active' | 'in_active';
  startDate: string;
  endDate: string;
  createdAt: string;
  description?: string;
  requirement?: string;
  skill?: string[];
  applicant?: string[];
  visibility?: string[];
  customQuestionTitles?: string[];
};

export type ApplicationDetail = {
  id: string;
  jobTitle: string;
  jobId?: string;
  applicantName: string;
  email: string;
  phone: string;
  appliedDate: string;
  stage: string;
  stageId?: string;
  rating: number;
  resume?: string;
  coverLetter?: string;
  isArchive?: boolean;
  dob?: string;
  gender?: string;
  country?: string;
  state?: string;
  city?: string;
  profile?: string;
  skill?: string;
  customQuestion?: Record<string, string>;
  notes?: { id: string; note: string; createdAt: string; noteCreatedName: string }[];
};

export type CandidateDetail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  skills: string[];
  experience: string;
  status: string;
  /** Rating 1-5 (sesuai reference-erp Job Candidate) */
  rating?: number;
  /** Tanggal lamaran / applied at */
  appliedAt?: string;
  /** Nama file CV/Resume (opsional) */
  resume?: string;
};

export type OnboardingDetail = {
  id: string;
  employeeName: string;
  position: string;
  department: string;
  joinDate: string;
  status: string;
  progress: number;
  /** Branch (sesuai reference-erp Job On-boarding) */
  branch?: string;
  /** Tanggal lamaran / applied at */
  appliedAt?: string;
  /** ID karyawan setelah convert (null = belum convert) */
  convertToEmployeeId?: string | null;
};

export type CustomQuestionDetail = {
  id: string;
  question: string;
  isRequired: string;
};

export type InterviewScheduleDetail = {
  id: string;
  candidateName: string;
  position: string;
  interviewDate: string;
  interviewTime: string;
  interviewer: string;
  location: string;
  status: string;
};

// Job Categories
let mutableJobCategories: JobCategoryDetail[] = [
  { id: '1', title: 'IT' },
  { id: '2', title: 'Marketing' },
  { id: '3', title: 'Finance' },
  { id: '4', title: 'HR' },
  { id: '5', title: 'Operations' },
  { id: '6', title: 'Sales' },
];

// Job Stages
let mutableJobStages: JobStageDetail[] = [
  { id: '1', title: 'Applied', order: 1 },
  { id: '2', title: 'Phone Screen', order: 2 },
  { id: '3', title: 'Interview', order: 3 },
  { id: '4', title: 'Offer', order: 4 },
  { id: '5', title: 'Hired', order: 5 },
  { id: '6', title: 'Rejected', order: 6 },
];

// Jobs
const jobList: JobDetail[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    branch: 'Head Office',
    category: 'IT',
    positions: 3,
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01',
    description: 'Develop and maintain web applications using modern frameworks.',
    requirement: '5+ years experience. Proficient in React/Node.js.',
    skill: ['React', 'Node.js', 'TypeScript'],
    applicant: ['experience', 'education'],
    visibility: ['salary', 'location'],
    customQuestionTitles: ['Why do you want to work for our company?'],
  },
  {
    id: '2',
    title: 'Marketing Manager',
    branch: 'Branch A',
    category: 'Marketing',
    positions: 1,
    status: 'active',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    createdAt: '2024-02-01',
    description: 'Lead marketing campaigns and brand strategy.',
    requirement: '7+ years in marketing. Team leadership experience.',
    skill: ['Digital Marketing', 'SEO'],
    applicant: ['experience'],
    visibility: ['location'],
    customQuestionTitles: [],
  },
  {
    id: '3',
    title: 'Accountant',
    branch: 'Head Office',
    category: 'Finance',
    positions: 2,
    status: 'in_active',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    createdAt: '2024-01-15',
    description: 'Handle financial reporting and compliance.',
    requirement: 'CPA or equivalent. 4+ years experience.',
    skill: ['Financial Analysis', 'Tax', 'Audit'],
    customQuestionTitles: ['What are your salary expectations?'],
  },
];

let mutableJobs = [...jobList];

// Applications (mutable untuk Archive/Delete/Stage/Note)
let mutableApplications: ApplicationDetail[] = [
  { id: '1', jobTitle: 'Senior Software Engineer', jobId: '1', applicantName: 'John Smith', email: 'john.smith@email.com', phone: '+62 812-3456-7890', appliedDate: '2024-02-15', stage: 'Applied', stageId: '1', rating: 4, resume: 'john_smith_cv.pdf', coverLetter: 'I am excited to apply...', isArchive: false, skill: 'React, Node.js', customQuestion: { 'Why do you want to work for our company?': 'Growth and impact.' }, notes: [{ id: 'n1', note: 'Strong technical background.', createdAt: '2024-02-16', noteCreatedName: 'HR Team' }] },
  { id: '2', jobTitle: 'Marketing Manager', jobId: '2', applicantName: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+62 813-9876-5432', appliedDate: '2024-02-10', stage: 'Phone Screen', stageId: '2', rating: 5, resume: 'sarah_johnson_cv.pdf', isArchive: false },
  { id: '3', jobTitle: 'Senior Software Engineer', jobId: '1', applicantName: 'Mike Brown', email: 'mike.brown@email.com', phone: '+62 821-1234-5678', appliedDate: '2024-02-18', stage: 'Interview', stageId: '3', rating: 3, isArchive: false },
];

// Candidates (sesuai reference-erp Job Candidate: Name, Applied For, Rating, Applied at, CV/Resume, Action)
const candidateList: CandidateDetail[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '+62 812-3456-7890', position: 'Senior Software Engineer', skills: ['React', 'Node.js', 'TypeScript'], experience: '5+ years', status: 'Shortlisted', rating: 4, appliedAt: '2024-02-15', resume: 'john_smith_cv.pdf' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+62 813-9876-5432', position: 'Marketing Manager', skills: ['Digital Marketing', 'SEO', 'Content Strategy'], experience: '7+ years', status: 'Interviewed', rating: 5, appliedAt: '2024-02-10', resume: 'sarah_johnson_cv.pdf' },
  { id: '3', name: 'Mike Brown', email: 'mike.brown@email.com', phone: '+62 821-1234-5678', position: 'Accountant', skills: ['Financial Analysis', 'Tax', 'Audit'], experience: '4+ years', status: 'Pending', rating: 3, appliedAt: '2024-02-18' },
];

// Onboarding (sesuai reference-erp Job On-boarding: Name, Job, Branch, Applied at, Joining at, Status, Action)
let mutableOnboardings: OnboardingDetail[] = [
  { id: '1', employeeName: 'John Smith', position: 'Senior Software Engineer', department: 'IT', joinDate: '2024-03-01', status: 'In Progress', progress: 60, branch: 'Head Office', appliedAt: '2024-02-15', convertToEmployeeId: null },
  { id: '2', employeeName: 'Sarah Johnson', position: 'Marketing Manager', department: 'Marketing', joinDate: '2024-02-15', status: 'Completed', progress: 100, branch: 'Branch A', appliedAt: '2024-02-10', convertToEmployeeId: 'emp-1' },
  { id: '3', employeeName: 'Mike Brown', position: 'Accountant', department: 'Finance', joinDate: '2024-03-10', status: 'Pending', progress: 20, branch: 'Head Office', appliedAt: '2024-02-18', convertToEmployeeId: null },
];

// Custom Questions
let mutableQuestions: CustomQuestionDetail[] = [
  { id: '1', question: 'Why do you want to work for our company?', isRequired: 'yes' },
  { id: '2', question: 'What are your salary expectations?', isRequired: 'no' },
  { id: '3', question: 'When are you available to start?', isRequired: 'yes' },
];

// Interview Schedules
let mutableInterviews: InterviewScheduleDetail[] = [
  { id: '1', candidateName: 'John Smith', position: 'Senior Software Engineer', interviewDate: '2024-03-15', interviewTime: '10:00', interviewer: 'Sarah Johnson', location: 'Meeting Room A', status: 'Scheduled' },
  { id: '2', candidateName: 'Mike Brown', position: 'Marketing Manager', interviewDate: '2024-03-16', interviewTime: '14:00', interviewer: 'Emily Davis', location: 'Video Call', status: 'Scheduled' },
  { id: '3', candidateName: 'Lisa Wilson', position: 'Accountant', interviewDate: '2024-03-12', interviewTime: '11:00', interviewer: 'David Lee', location: 'Meeting Room B', status: 'Completed' },
];

// Job Category
export function getJobCategoryById(id: string): JobCategoryDetail | undefined {
  return mutableJobCategories.find((c) => c.id === id);
}
export function getJobCategoriesList(): JobCategoryDetail[] {
  return mutableJobCategories;
}
export function removeJobCategoryById(id: string): void {
  mutableJobCategories = mutableJobCategories.filter((c) => c.id !== id);
}
export function updateJobCategory(id: string, data: Partial<JobCategoryDetail>): void {
  mutableJobCategories = mutableJobCategories.map((c) => (c.id === id ? { ...c, ...data } : c));
}
export function addJobCategory(item: Omit<JobCategoryDetail, 'id'>): JobCategoryDetail {
  const newItem: JobCategoryDetail = { ...item, id: Date.now().toString() };
  mutableJobCategories = [...mutableJobCategories, newItem];
  return newItem;
}

// Job Stage
export function getJobStageById(id: string): JobStageDetail | undefined {
  return mutableJobStages.find((s) => s.id === id);
}
export function getJobStagesList(): JobStageDetail[] {
  return mutableJobStages;
}
export function removeJobStageById(id: string): void {
  mutableJobStages = mutableJobStages.filter((s) => s.id !== id);
}
export function updateJobStage(id: string, data: Partial<JobStageDetail>): void {
  mutableJobStages = mutableJobStages.map((s) => (s.id === id ? { ...s, ...data } : s));
}
export function addJobStage(item: Omit<JobStageDetail, 'id'>): JobStageDetail {
  const newItem: JobStageDetail = { ...item, id: Date.now().toString(), order: mutableJobStages.length + 1 };
  mutableJobStages = [...mutableJobStages, newItem];
  return newItem;
}

// Job
export function getJobById(id: string): JobDetail | undefined {
  return mutableJobs.find((j) => j.id === id);
}
export function getJobsList(): JobDetail[] {
  return mutableJobs;
}
export function removeJobById(id: string): void {
  mutableJobs = mutableJobs.filter((j) => j.id !== id);
}
export function updateJob(id: string, data: Partial<JobDetail>): void {
  mutableJobs = mutableJobs.map((j) => (j.id === id ? { ...j, ...data } : j));
}
export function addJob(job: Omit<JobDetail, 'id' | 'createdAt'>): JobDetail {
  const newJob: JobDetail = {
    ...job,
    id: Date.now().toString(),
    createdAt: new Date().toISOString().split('T')[0],
  };
  mutableJobs = [...mutableJobs, newJob];
  return newJob;
}

// Application
export function getApplicationById(id: string): ApplicationDetail | undefined {
  return mutableApplications.find((a) => a.id === id);
}
export function getApplicationsList(): ApplicationDetail[] {
  return mutableApplications;
}
export function updateApplication(id: string, data: Partial<ApplicationDetail>): void {
  mutableApplications = mutableApplications.map((a) => (a.id === id ? { ...a, ...data } : a));
}
export function updateApplicationStage(id: string, stageId: string): void {
  const stage = mutableJobStages.find((s) => s.id === stageId);
  if (stage) {
    mutableApplications = mutableApplications.map((a) => (a.id === id ? { ...a, stageId, stage: stage.title } : a));
  }
}
export function setApplicationArchive(id: string, isArchive: boolean): void {
  mutableApplications = mutableApplications.map((a) => (a.id === id ? { ...a, isArchive } : a));
}
export function deleteApplication(id: string): void {
  mutableApplications = mutableApplications.filter((a) => a.id !== id);
}
export function addApplicationNote(applicationId: string, note: string, noteCreatedName: string): void {
  const app = mutableApplications.find((a) => a.id === applicationId);
  if (!app) return;
  const newNote = { id: `n-${Date.now()}`, note, createdAt: new Date().toISOString().split('T')[0], noteCreatedName };
  const notes = [...(app.notes || []), newNote];
  mutableApplications = mutableApplications.map((a) => (a.id === applicationId ? { ...a, notes } : a));
}

// Candidate
export function getCandidateById(id: string): CandidateDetail | undefined {
  return candidateList.find((c) => c.id === id);
}
export function getCandidatesList(): CandidateDetail[] {
  return candidateList;
}

// Onboarding
export function getOnboardingById(id: string): OnboardingDetail | undefined {
  return mutableOnboardings.find((o) => o.id === id);
}
export function getOnboardingsList(): OnboardingDetail[] {
  return mutableOnboardings;
}
export function removeOnboardingById(id: string): void {
  mutableOnboardings = mutableOnboardings.filter((o) => o.id !== id);
}
export function updateOnboarding(id: string, data: Partial<OnboardingDetail>): void {
  mutableOnboardings = mutableOnboardings.map((o) => (o.id === id ? { ...o, ...data } : o));
}
export function addOnboarding(item: Omit<OnboardingDetail, 'id'>): OnboardingDetail {
  const newItem: OnboardingDetail = { ...item, id: Date.now().toString() };
  mutableOnboardings = [...mutableOnboardings, newItem];
  return newItem;
}

// Custom Question
export function getQuestionById(id: string): CustomQuestionDetail | undefined {
  return mutableQuestions.find((q) => q.id === id);
}
export function getQuestionsList(): CustomQuestionDetail[] {
  return mutableQuestions;
}
export function removeQuestionById(id: string): void {
  mutableQuestions = mutableQuestions.filter((q) => q.id !== id);
}
export function updateQuestion(id: string, data: Partial<CustomQuestionDetail>): void {
  mutableQuestions = mutableQuestions.map((q) => (q.id === id ? { ...q, ...data } : q));
}
export function addQuestion(item: Omit<CustomQuestionDetail, 'id'>): CustomQuestionDetail {
  const newItem: CustomQuestionDetail = { ...item, id: Date.now().toString() };
  mutableQuestions = [...mutableQuestions, newItem];
  return newItem;
}

// Interview Schedule
export function getInterviewById(id: string): InterviewScheduleDetail | undefined {
  return mutableInterviews.find((s) => s.id === id);
}
export function getInterviewsList(): InterviewScheduleDetail[] {
  return mutableInterviews;
}
export function removeInterviewById(id: string): void {
  mutableInterviews = mutableInterviews.filter((s) => s.id !== id);
}
export function updateInterview(id: string, data: Partial<InterviewScheduleDetail>): void {
  mutableInterviews = mutableInterviews.map((s) => (s.id === id ? { ...s, ...data } : s));
}
export function addInterview(item: Omit<InterviewScheduleDetail, 'id'>): InterviewScheduleDetail {
  const newItem: InterviewScheduleDetail = { ...item, id: Date.now().toString() };
  mutableInterviews = [...mutableInterviews, newItem];
  return newItem;
}
