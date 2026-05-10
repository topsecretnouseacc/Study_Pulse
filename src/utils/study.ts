import { calendarDays, departmentPlans, initialStudyLogs, subjectCatalog } from '../data/catalog';
import type { Department, MockExam, StudyLog } from '../types';

export function createStudyStats(
  studyLogs: StudyLog[],
  mockExams: MockExam[],
  department: Department,
  dailyQuestionGoal: number,
  streakCount: number,
  gemBalance: number,
) {
  const departmentPlan = departmentPlans[department];
  const todayLogs = studyLogs.filter((log) => log.date === 'Bugün');
  const totalSolved = studyLogs.reduce((sum, log) => sum + log.solved, 0);
  const todaySolved = todayLogs.reduce((sum, log) => sum + log.solved, 0);
  const totalCorrect = studyLogs.reduce((sum, log) => sum + log.correct, 0);
  const totalWrong = studyLogs.reduce((sum, log) => sum + log.wrong, 0);
  const todayWrong = todayLogs.reduce((sum, log) => sum + log.wrong, 0);
  const accuracy = totalSolved === 0 ? 0 : Math.round((totalCorrect / totalSolved) * 100);
  const weakest = [...studyLogs].sort((a, b) => b.wrong / b.solved - a.wrong / a.solved)[0];
  const bestTyt = Math.max(...mockExams.map((exam) => exam.tytNet), 0);
  const bestAyt = Math.max(...mockExams.map((exam) => exam.aytNet), 0);
  const remaining = Math.max(dailyQuestionGoal - todaySolved, 0);
  const progress = Math.min(todaySolved / dailyQuestionGoal, 1);
  const streak = streakCount;
  const goalReachedToday = todaySolved >= dailyQuestionGoal;
  const gems = gemBalance;
  const aiSolvesAvailable = gems;
  const week = 6;

  const subjectProgress = subjectCatalog.reduce<Record<number, number>>((result, subject) => {
    const solvedForSubject = todayLogs
      .filter((log) => log.subjectId === subject.id)
      .reduce((sum, log) => sum + log.solved, 0);
    result[subject.id] = solvedForSubject;
    return result;
  }, {});

  return {
    totalSolved,
    todaySolved,
    totalCorrect,
    totalWrong,
    todayWrong,
    accuracy,
    weakest,
    bestTyt,
    bestAyt,
    remaining,
    progress,
    streak,
    gems,
    aiSolvesAvailable,
    week,
    subjectProgress,
    department,
    departmentPlan,
    goalReachedToday,
    dailyQuestionGoal,
  };
}

export type StudyStats = ReturnType<typeof createStudyStats>;

export function createEmptyStudyStats(): StudyStats {
  return {
    totalSolved: 0,
    todaySolved: 0,
    totalCorrect: 0,
    totalWrong: 0,
    todayWrong: 0,
    accuracy: 0,
    weakest: initialStudyLogs[0],
    bestTyt: 0,
    bestAyt: 0,
    remaining: 0,
    progress: 0,
    streak: 0,
    gems: 0,
    aiSolvesAvailable: 0,
    week: 0,
    subjectProgress: {},
    department: 'Sayısal',
    departmentPlan: departmentPlans.Sayısal,
    goalReachedToday: false,
    dailyQuestionGoal: 180,
  };
}

export function getSubjectIcon(subject: string) {
  if (subject === 'Matematik') return '∑';
  if (subject === 'Türk Dili ve Edebiyatı') return 'E';
  if (subject === 'Fizik') return 'F';
  if (subject === 'Kimya') return 'K';
  if (subject === 'Biyoloji') return 'B';
  if (subject === 'Yabancı Dil') return 'D';
  return 'S';
}

export function getSubjectShortLabel(subjectId: number) {
  const subject = subjectCatalog.find((item) => item.id === subjectId);
  if (!subject) return 'Ders';
  if (subject.name === 'Türk Dili ve Edebiyatı') return 'Edebiyat';
  if (subject.name === 'Yabancı Dil') return 'Dil';
  return subject.name;
}
