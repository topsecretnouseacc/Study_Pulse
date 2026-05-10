import type { Department, DepartmentPlan, MockExam, Subject, TabKey } from '../types';

export const dailyQuestionGoal = 180;
export const baseGems = 7;

export const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'home', label: 'Diary', icon: '▣' },
  { key: 'study', label: 'Log', icon: '+' },
  { key: 'exams', label: 'Exams', icon: '◷' },
  { key: 'analytics', label: 'Stats', icon: '◎' },
  { key: 'ai', label: 'AI', icon: '✦' },
];

export const subjectCatalog: Subject[] = [
  {
    id: 1,
    name: 'Matematik',
    examType: 'BOTH',
    group: 'Matematik',
    topics: [
      { id: 101, name: 'Problemler' },
      { id: 102, name: 'Fonksiyonlar' },
      { id: 103, name: 'Türev' },
      { id: 104, name: 'İntegral' },
    ],
  },
  {
    id: 2,
    name: 'Türk Dili ve Edebiyatı',
    examType: 'BOTH',
    group: 'Türkçe',
    topics: [
      { id: 201, name: 'Paragraf' },
      { id: 202, name: 'Dil Bilgisi' },
      { id: 203, name: 'Şiir Bilgisi' },
      { id: 204, name: 'Roman ve Hikaye' },
      { id: 205, name: 'Edebi Akımlar' },
    ],
  },
  {
    id: 3,
    name: 'Tarih',
    examType: 'BOTH',
    group: 'Sosyal',
    topics: [
      { id: 301, name: 'İlk Türk Devletleri' },
      { id: 302, name: 'Osmanlı Kuruluş' },
      { id: 303, name: 'Kurtuluş Savaşı' },
    ],
  },
  {
    id: 4,
    name: 'Fizik',
    examType: 'BOTH',
    group: 'Fen',
    topics: [
      { id: 401, name: 'Kuvvet ve Hareket' },
      { id: 402, name: 'Elektrik' },
      { id: 403, name: 'Dalgalar' },
    ],
  },
  {
    id: 5,
    name: 'Kimya',
    examType: 'BOTH',
    group: 'Fen',
    topics: [
      { id: 501, name: 'Atom ve Periyodik Sistem' },
      { id: 502, name: 'Kimyasal Tepkimeler' },
      { id: 503, name: 'Organik Kimya' },
    ],
  },
  {
    id: 6,
    name: 'Biyoloji',
    examType: 'BOTH',
    group: 'Fen',
    topics: [
      { id: 601, name: 'Canlıların Temel Bileşenleri' },
      { id: 602, name: 'Hücre' },
      { id: 603, name: 'Kalıtım' },
      { id: 604, name: 'Ekoloji' },
    ],
  },
  {
    id: 7,
    name: 'Coğrafya',
    examType: 'BOTH',
    group: 'Sosyal',
    topics: [
      { id: 701, name: 'Doğal Sistemler' },
      { id: 702, name: 'Beşeri Sistemler' },
      { id: 703, name: 'Türkiye Coğrafyası' },
    ],
  },
  {
    id: 8,
    name: 'Felsefe',
    examType: 'TYT',
    group: 'Sosyal',
    topics: [
      { id: 801, name: 'Bilgi Felsefesi' },
      { id: 802, name: 'Ahlak Felsefesi' },
      { id: 803, name: 'Mantık' },
    ],
  },
  {
    id: 9,
    name: 'Din Kültürü',
    examType: 'TYT',
    group: 'Sosyal',
    topics: [
      { id: 901, name: 'İnanç' },
      { id: 902, name: 'İbadet' },
      { id: 903, name: 'Ahlak ve Değerler' },
    ],
  },
  {
    id: 10,
    name: 'Yabancı Dil',
    examType: 'AYT',
    group: 'Dil',
    topics: [
      { id: 1001, name: 'Vocabulary' },
      { id: 1002, name: 'Grammar' },
      { id: 1003, name: 'Reading' },
      { id: 1004, name: 'Translation' },
    ],
  },
];

export const initialStudyLogs = [
  { id: 1, subjectId: 1, topicId: 101, subject: 'Matematik', topic: 'Problemler', solved: 62, correct: 46, wrong: 16, date: 'Bugün' },
  { id: 2, subjectId: 2, topicId: 201, subject: 'Türk Dili ve Edebiyatı', topic: 'Paragraf', solved: 44, correct: 36, wrong: 8, date: 'Bugün' },
  { id: 3, subjectId: 4, topicId: 401, subject: 'Fizik', topic: 'Kuvvet ve Hareket', solved: 26, correct: 17, wrong: 9, date: 'Bugün' },
  { id: 4, subjectId: 3, topicId: 303, subject: 'Tarih', topic: 'Kurtuluş Savaşı', solved: 34, correct: 29, wrong: 5, date: 'Dün' },
  { id: 5, subjectId: 6, topicId: 602, subject: 'Biyoloji', topic: 'Hücre', solved: 18, correct: 13, wrong: 5, date: 'Bugün' },
];

export const initialMockExams: MockExam[] = [
  { id: 1, name: 'TYT Genel Deneme 12', tytNet: 71.25, aytNet: 0, date: '08 Mayıs' },
  { id: 2, name: 'AYT Sayısal Deneme 7', tytNet: 0, aytNet: 48.5, date: '05 Mayıs' },
];

export const departmentPlans: Record<Department, DepartmentPlan> = {
  Sayısal: {
    primarySubjectIds: [1, 4, 5, 6],
    targets: { 1: 75, 4: 35, 5: 35, 6: 35 },
    headline: 'Sayısal odağı: Matematik, Fizik, Kimya ve Biyoloji.',
  },
  'Eşit Ağırlık': {
    primarySubjectIds: [1, 2, 3, 7],
    targets: { 1: 65, 2: 45, 3: 35, 7: 35 },
    headline: 'Eşit Ağırlık odağı: Matematik, Edebiyat, Tarih ve Coğrafya.',
  },
  Edebiyat: {
    primarySubjectIds: [2, 3, 7, 8],
    targets: { 2: 70, 3: 45, 7: 40, 8: 25 },
    headline: 'Edebiyat odağı: Edebiyat, Tarih, Coğrafya ve Felsefe.',
  },
  Dil: {
    primarySubjectIds: [10, 2, 1, 7],
    targets: { 10: 90, 2: 45, 1: 25, 7: 20 },
    headline: 'Dil odağı: Yabancı Dil, Edebiyat ve temel TYT desteği.',
  },
};

export const calendarDays = [
  { label: 'Pzt', solved: 160, reachedGoal: false },
  { label: 'Sal', solved: 184, reachedGoal: true },
  { label: 'Çar', solved: 202, reachedGoal: true },
  { label: 'Per', solved: 145, reachedGoal: false },
  { label: 'Cum', solved: 190, reachedGoal: true },
  { label: 'Cmt', solved: 132, reachedGoal: false },
  { label: 'Paz', solved: 166, reachedGoal: false },
];
