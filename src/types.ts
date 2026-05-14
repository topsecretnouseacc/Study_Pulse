export type TabKey = 'home' | 'study' | 'exams' | 'analytics' | 'ai' | 'settings';

export type Department = 'Edebiyat' | 'Eşit Ağırlık' | 'Sayısal' | 'Dil';

export type SubjectGroup = 'Matematik' | 'Türkçe' | 'Fen' | 'Sosyal' | 'Dil';

export type StudyLog = {
  id: number;
  subjectId: number;
  topicId: number;
  subject: string;
  topic: string;
  solved: number;
  correct: number;
  wrong: number;
  date: string;
};

export type Subject = {
  id: number;
  name: string;
  examType: 'TYT' | 'AYT' | 'BOTH';
  group: SubjectGroup;
  topics: Array<{ id: number; name: string }>;
};

export type MockExam = {
  id: number;
  name: string;
  tytNet: number;
  aytNet: number;
  date: string;
};

export type AiQuestion = {
  id: number;
  subjectId: number | null;
  topicId: number | null;
  subject: string;
  topic: string;
  prompt: string;
  solution: string | null;
  status: 'pending' | 'solved' | 'failed';
  createdAt: string;
};

export type DepartmentPlan = {
  primarySubjectIds: number[];
  targets: Record<number, number>;
  headline: string;
};

export type UserProfile = {
  id?: string;
  fullName: string;
  email: string;
  department: Department;
  dailyQuestionGoal: number;
  streakCount: number;
  gemBalance: number;
  lastGoalCompletedDate: string | null;
  dailyGoalSet: boolean;
};

export type CalendarDay = {
  label: string;
  solved: number;
  reachedGoal: boolean;
};
