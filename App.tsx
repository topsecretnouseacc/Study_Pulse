import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { tabs } from './src/data/catalog';
import { supabase } from './src/lib/supabase';
import { AiScreen } from './src/screens/AiScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { ExamScreen } from './src/screens/ExamScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StudyScreen } from './src/screens/StudyScreen';
import { styles } from './src/styles';
import type { AiQuestion, CalendarDay, Department, MockExam, StudyLog, Subject, TabKey, UserProfile } from './src/types';
import { createStudyStats } from './src/utils/study';
import { DailyGoalPrompt } from './src/components/ui';
import { getShortWeekdayForDateKey, getStudyLogDateKey, getTurkeyDateKey, isTurkeyYesterday, shiftDateKey } from './src/utils/date';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [detailMode, setDetailMode] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [department, setDepartment] = useState<Department>('Sayısal');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [mockExams, setMockExams] = useState<MockExam[]>([]);
  const [aiQuestions, setAiQuestions] = useState<AiQuestion[]>([]);
  const [subjectId, setSubjectId] = useState(0);
  const [topicId, setTopicId] = useState(0);
  const [aiSubjectId, setAiSubjectId] = useState(0);
  const [aiTopicId, setAiTopicId] = useState(0);
  const [studySyncMessage, setStudySyncMessage] = useState('');
  const [examSyncMessage, setExamSyncMessage] = useState('');
  const [aiSyncMessage, setAiSyncMessage] = useState('');
  const [solved, setSolved] = useState('');
  const [correct, setCorrect] = useState('');
  const [examName, setExamName] = useState('');
  const [tytNet, setTytNet] = useState('');
  const [aytNet, setAytNet] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [goalPromptInput, setGoalPromptInput] = useState('');

  const stats = useMemo(
    () =>
      createStudyStats(
        studyLogs,
        mockExams,
        department,
        profile?.dailyQuestionGoal ?? 180,
        profile?.streakCount ?? 0,
        profile?.gemBalance ?? 0,
        subjects,
      ),
    [department, mockExams, profile?.dailyQuestionGoal, profile?.gemBalance, profile?.streakCount, studyLogs, subjects],
  );

  const selectedSubject = subjects.find((item) => item.id === subjectId);
  const selectedTopic = selectedSubject?.topics.find((item) => item.id === topicId);
  const calendarDays = useMemo(
    () => buildCalendarDays(studyLogs, profile?.dailyQuestionGoal ?? 180),
    [profile?.dailyQuestionGoal, studyLogs],
  );

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted) return;
        const user = data.session?.user;
        if (user) {
          await applyProfileFromUser(user);
        }
      })
      .catch(() => {
        setProfile(null);
      })
      .finally(() => {
        if (mounted) setAuthReady(true);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) {
        setProfile(null);
        return;
      }

      applyProfileFromUser(user);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function applyProfileFromUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
    const fallback = profileFromUser(user);
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, department, daily_question_goal, streak_count, gem_balance, last_goal_completed_date, daily_goal_set')
      .eq('id', user.id)
      .maybeSingle();

    const nextProfile = data ? profileFromProfileRow(data, fallback.email) : fallback;
    setProfile(nextProfile);
    setDepartment(nextProfile.department);
    setGoalPromptInput(nextProfile.dailyGoalSet ? String(nextProfile.dailyQuestionGoal) : '');
  }

  useEffect(() => {
    if (!profile) return;

    loadSubjects();
    loadStudyLogs();
    loadMockExams();
    loadAiQuestions();
  }, [profile]);

  async function loadSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, exam_type, topics(id, name)')
      .order('id', { ascending: true });

    if (error || !data) {
      setStudySyncMessage(error?.message ?? 'Ders listesi yüklenemedi.');
      return;
    }

    const nextSubjects = data.map((subject) => ({
      id: subject.id,
      name: prettifySubjectName(subject.name),
      examType: subject.exam_type as Subject['examType'],
      group: getSubjectGroup(subject.name),
      topics: [...(subject.topics ?? [])]
        .sort((a, b) => a.id - b.id)
        .map((topic) => ({
          id: topic.id,
          name: prettifyTopicName(topic.name),
        })),
    }));

    if (nextSubjects.length === 0) {
      setStudySyncMessage('Supabase dersleri görünmüyor. docs/supabase-catalog-fix.sql dosyasını SQL Editor içinde çalıştır.');
      return;
    }

    setSubjects(nextSubjects);
    setStudySyncMessage('');
    setSubjectId((currentSubjectId) => {
      const nextSubject = nextSubjects.find((subject) => subject.id === currentSubjectId) ?? nextSubjects[0];
      setTopicId((currentTopicId) => {
        if (nextSubject.topics.some((topic) => topic.id === currentTopicId)) return currentTopicId;
        return nextSubject.topics[0]?.id ?? 0;
      });
      return nextSubject.id;
    });
    setAiSubjectId((currentSubjectId) => {
      const nextSubject = nextSubjects.find((subject) => subject.id === currentSubjectId) ?? nextSubjects[0];
      setAiTopicId((currentTopicId) => {
        if (nextSubject.topics.some((topic) => topic.id === currentTopicId)) return currentTopicId;
        return nextSubject.topics[0]?.id ?? 0;
      });
      return nextSubject.id;
    });
  }

  async function loadStudyLogs() {
    const { data, error } = await supabase
      .from('study_logs')
      .select('id, subject_id, topic_id, solved_count, correct_count, wrong_count, studied_at, subjects(name), topics(name)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      setStudySyncMessage(error?.message ?? 'Çalışma kayıtları yüklenemedi.');
      return;
    }

    if (data.length === 0) {
      setStudyLogs([]);
      return;
    }

    setStudyLogs(data.map(mapStudyLogRow));
  }

  async function loadMockExams() {
    const { data, error } = await supabase
      .from('mock_exams')
      .select('id, name, exam_date, tyt_net, ayt_net')
      .order('exam_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error || !data) {
      setExamSyncMessage(error?.message ?? 'Deneme kayıtları yüklenemedi.');
      return;
    }

    if (data.length === 0) {
      setMockExams([]);
      return;
    }

    setMockExams(data.map(mapMockExamRow));
  }

  async function loadAiQuestions() {
    const { data, error } = await supabase
      .from('ai_questions')
      .select('id, subject_id, topic_id, prompt, solution, status, created_at, subjects(name), topics(name)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      setAiSyncMessage(error?.message ?? 'AI kayıtları yüklenemedi.');
      return;
    }

    setAiQuestions(data.map(mapAiQuestionRow));
  }

  function selectSubject(nextSubjectId: number) {
    const nextSubject = subjects.find((item) => item.id === nextSubjectId);
    if (!nextSubject) return;

    setSubjectId(nextSubject.id);
    setTopicId(nextSubject.topics[0]?.id ?? 0);
  }

  function selectAiSubject(nextSubjectId: number) {
    const nextSubject = subjects.find((item) => item.id === nextSubjectId);
    if (!nextSubject) return;

    setAiSubjectId(nextSubject.id);
    setAiTopicId(nextSubject.topics[0]?.id ?? 0);
  }

  async function addStudyLog() {
    const solvedNumber = Number(solved);
    const correctNumber = Number(correct);
    if (solvedNumber <= 0 || correctNumber < 0) return;
    if (!selectedSubject || !selectedTopic) {
      setStudySyncMessage('Ders ve konu listesi henüz hazır değil. Birkaç saniye sonra tekrar dene.');
      return;
    }

    setStudySyncMessage('');

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setStudySyncMessage('Kayıt eklemek için giriş yapmalısın.');
      return;
    }

    const correctSafe = Math.min(correctNumber, solvedNumber);
    const solvedBeforeInsert = stats.todaySolved;
    const { data, error } = await supabase
      .from('study_logs')
      .insert({
        user_id: userData.user.id,
        subject_id: selectedSubject.id,
        topic_id: selectedTopic.id,
        solved_count: solvedNumber,
        correct_count: correctSafe,
        studied_at: getTurkeyDateKey(),
      })
      .select('id, subject_id, topic_id, solved_count, correct_count, wrong_count, studied_at, subjects(name), topics(name)')
      .single();

    if (error || !data) {
      setStudySyncMessage(error?.message ?? 'Çalışma kaydı eklenemedi.');
      return;
    }

    setStudyLogs((current) => [
      mapStudyLogRow(data),
      ...current,
    ]);
    setSolved('');
    setCorrect('');
    await updateGoalCompletion(userData.user.id, solvedBeforeInsert + solvedNumber);
    setStudySyncMessage('Çalışma kaydı Supabase’e eklendi.');
  }

  async function addMockExam() {
    if (!examName.trim()) return;
    const normalizedTytNet = normalizeExamNet(tytNet);
    const normalizedAytNet = normalizeExamNet(aytNet);
    if (normalizedTytNet > 120 || normalizedAytNet > 80) {
      setExamSyncMessage('TYT neti 120, AYT neti 80 üstünde olamaz.');
      return;
    }

    setExamSyncMessage('');
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setExamSyncMessage('Deneme eklemek için giriş yapmalısın.');
      return;
    }

    const { data, error } = await supabase
      .from('mock_exams')
      .insert({
        user_id: userData.user.id,
        name: examName.trim(),
        exam_date: getTurkeyDateKey(),
        tyt_net: normalizedTytNet,
        ayt_net: normalizedAytNet,
      })
      .select('id, name, exam_date, tyt_net, ayt_net')
      .single();

    if (error || !data) {
      setExamSyncMessage(error?.message ?? 'Deneme kaydı eklenemedi.');
      return;
    }

    setMockExams((current) => [
      mapMockExamRow(data),
      ...current,
    ]);
    setExamName('');
    setTytNet('');
    setAytNet('');
    setExamSyncMessage('Deneme sonucu Supabase’e eklendi.');
  }

  async function addAiQuestion() {
    const selectedAiSubject = subjects.find((item) => item.id === aiSubjectId);
    const selectedAiTopic = selectedAiSubject?.topics.find((item) => item.id === aiTopicId);
    if (!profile || profile.gemBalance <= 0) {
      setAiSyncMessage('AI isteği için en az 1 elmas gerekir.');
      return;
    }
    if (!selectedAiSubject || !selectedAiTopic) {
      setAiSyncMessage('Ders ve konu listesi hazır değil.');
      return;
    }
    if (!aiPrompt.trim()) {
      setAiSyncMessage('Soru metni veya not gir.');
      return;
    }

    setAiSyncMessage('');
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setAiSyncMessage('AI isteği için giriş yapmalısın.');
      return;
    }

    const { data: question, error } = await supabase
      .from('ai_questions')
      .insert({
        user_id: userData.user.id,
        image_path: `manual-entry/${userData.user.id}/${Date.now()}`,
        subject_id: selectedAiSubject.id,
        topic_id: selectedAiTopic.id,
        prompt: aiPrompt.trim(),
        status: 'pending',
      })
      .select('id, subject_id, topic_id, prompt, solution, status, created_at, subjects(name), topics(name)')
      .single();

    if (error || !question) {
      setAiSyncMessage(error?.message ?? 'AI isteği kaydedilemedi.');
      return;
    }

    const nextGemBalance = Math.max(profile.gemBalance - 1, 0);
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ gem_balance: nextGemBalance })
      .eq('id', userData.user.id);

    if (profileError) {
      setAiSyncMessage(profileError.message);
      return;
    }

    await supabase.from('gem_transactions').insert({
      user_id: userData.user.id,
      amount: -1,
      reason: 'ai_question_spent',
      related_ai_question_id: question.id,
    });

    const nextQuestion = mapAiQuestionRow(question);
    setProfile((current) => (current ? { ...current, gemBalance: nextGemBalance } : current));
    setAiQuestions((current) => [nextQuestion, ...current]);
    setAiPrompt('');
    setAiSyncMessage('AI isteği kaydedildi. Çözüm üretiliyor...');

    const { data: solvedQuestion, error: solveError } = await supabase.functions.invoke('solve-question', {
      body: { questionId: question.id },
    });

    if (solveError) {
      setAiQuestions((current) =>
        current.map((item) => (item.id === question.id ? { ...item, status: 'failed', solution: solveError.message } : item)),
      );
      setAiSyncMessage(solveError.message);
      return;
    }

    setAiQuestions((current) =>
      current.map((item) =>
        item.id === question.id
          ? {
              ...item,
              status: 'solved',
              solution: typeof solvedQuestion?.solution === 'string' ? solvedQuestion.solution : item.solution,
            }
          : item,
      ),
    );
    setAiSyncMessage('AI çözümü hazır.');
  }

  function openStudyForSubject(nextSubjectId: number) {
    selectSubject(nextSubjectId);
    setActiveTab('study');
  }

  function completeAuth(nextProfile: UserProfile) {
    setProfile(nextProfile);
    setDepartment(nextProfile.department);
    setGoalPromptInput(nextProfile.dailyGoalSet ? String(nextProfile.dailyQuestionGoal) : '');
  }

  async function selectDepartment(nextDepartment: Department) {
    setDepartment(nextDepartment);
    setProfile((current) => (current ? { ...current, department: nextDepartment } : current));

    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    await supabase.auth.updateUser({
      data: {
        department: nextDepartment,
      },
    });
    await supabase.from('profiles').update({ department: normalizeDepartment(nextDepartment) }).eq('id', data.user.id);
  }

  async function updateDailyGoal(nextGoal: number) {
    setProfile((current) => (current ? { ...current, dailyQuestionGoal: nextGoal, dailyGoalSet: true } : current));
    setGoalPromptInput(String(nextGoal));

    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    await supabase.from('profiles').update({ daily_question_goal: nextGoal, daily_goal_set: true }).eq('id', data.user.id);
  }

  async function saveInitialDailyGoal() {
    const nextGoal = Math.round(Number(goalPromptInput));
    if (!Number.isFinite(nextGoal) || nextGoal <= 0) return;

    await updateDailyGoal(nextGoal);
  }

  async function updateGoalCompletion(userId: string, todaySolvedAfterInsert: number) {
    if (!profile || todaySolvedAfterInsert < profile.dailyQuestionGoal) return;

    const today = getTurkeyDateKey();
    if (profile.lastGoalCompletedDate === today) return;

    const nextStreak = isTurkeyYesterday(profile.lastGoalCompletedDate) ? profile.streakCount + 1 : 1;
    const nextGemBalance = profile.gemBalance + 1;

    setProfile({
      ...profile,
      streakCount: nextStreak,
      gemBalance: nextGemBalance,
      lastGoalCompletedDate: today,
    });

    await supabase
      .from('profiles')
      .update({
        streak_count: nextStreak,
        gem_balance: nextGemBalance,
        last_goal_completed_date: today,
      })
      .eq('id', userId);

    await supabase.from('gem_transactions').insert({
      user_id: userId,
      amount: 1,
      reason: 'daily_goal_completed',
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setActiveTab('home');
    setStudyLogs([]);
    setMockExams([]);
    setAiQuestions([]);
    setStudySyncMessage('');
    setExamSyncMessage('');
    setAiSyncMessage('');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        {!authReady ? (
          <View style={styles.authShell}>
            <Text style={styles.authBrand}>StudyPulse</Text>
            <Text style={styles.authCopy}>Oturum kontrol ediliyor...</Text>
          </View>
        ) : !profile ? (
          <AuthScreen onComplete={completeAuth} />
        ) : (
          <>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {activeTab === 'home' && (
            <HomeScreen
              stats={stats}
              studyLogs={studyLogs}
              subjects={subjects}
              calendarDays={calendarDays}
              detailMode={detailMode}
              showCalendar={showCalendar}
              department={department}
              profile={profile}
              onToggleDetails={() => setDetailMode((value) => !value)}
              onToggleCalendar={() => setShowCalendar((value) => !value)}
              onOpenSettings={() => setActiveTab('settings')}
              onOpenStudy={() => setActiveTab('study')}
              onOpenSubject={openStudyForSubject}
            />
          )}
          {activeTab === 'study' && (
            <StudyScreen
              subjects={subjects}
              selectedSubjectId={subjectId}
              selectedTopicId={topicId}
              solved={solved}
              correct={correct}
              setSubjectId={selectSubject}
              setTopicId={setTopicId}
              setSolved={setSolved}
              setCorrect={setCorrect}
              addStudyLog={addStudyLog}
              studyLogs={studyLogs}
              syncMessage={studySyncMessage}
            />
          )}
          {activeTab === 'exams' && (
            <ExamScreen
              examName={examName}
              tytNet={tytNet}
              aytNet={aytNet}
              setExamName={setExamName}
              setTytNet={setTytNet}
              setAytNet={setAytNet}
              addMockExam={addMockExam}
              mockExams={mockExams}
              syncMessage={examSyncMessage}
            />
          )}
          {activeTab === 'analytics' && <AnalyticsScreen stats={stats} studyLogs={studyLogs} />}
          {activeTab === 'ai' && (
            <AiScreen
              subjects={subjects}
              selectedSubjectId={aiSubjectId}
              selectedTopicId={aiTopicId}
              prompt={aiPrompt}
              gemBalance={profile.gemBalance}
              aiQuestions={aiQuestions}
              syncMessage={aiSyncMessage}
              onSelectSubject={selectAiSubject}
              onSelectTopic={setAiTopicId}
              onChangePrompt={setAiPrompt}
              onSubmit={addAiQuestion}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsScreen
              profile={profile}
              onSelectDepartment={selectDepartment}
              onUpdateDailyGoal={updateDailyGoal}
              onSignOut={signOut}
            />
          )}
            </ScrollView>

            <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                accessibilityRole="button"
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={styles.tabButton}
              >
                <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                  <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
                </View>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
            </View>

            {!profile.dailyGoalSet && (
              <DailyGoalPrompt
                value={goalPromptInput}
                onChangeText={setGoalPromptInput}
                onSubmit={saveInitialDailyGoal}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function profileFromUser(user: { id?: string; email?: string; user_metadata?: Record<string, unknown> }): UserProfile {
  const metadata = user.user_metadata ?? {};
  return {
    id: user.id,
    fullName: (metadata.full_name as string | undefined) ?? 'StudyPulse User',
    email: user.email ?? '',
    department: parseDepartment(metadata.department),
    dailyQuestionGoal: 180,
    streakCount: 0,
    gemBalance: 0,
    lastGoalCompletedDate: null,
    dailyGoalSet: false,
  };
}

function profileFromProfileRow(
  row: {
    id: string;
    full_name: string | null;
    department: string | null;
    daily_question_goal: number | null;
    streak_count: number | null;
    gem_balance: number | null;
    last_goal_completed_date: string | null;
    daily_goal_set: boolean | null;
  },
  email: string,
): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name ?? 'StudyPulse User',
    email,
    department: parseDepartment(row.department),
    dailyQuestionGoal: row.daily_question_goal ?? 180,
    streakCount: row.streak_count ?? 0,
    gemBalance: row.gem_balance ?? 0,
    lastGoalCompletedDate: row.last_goal_completed_date,
    dailyGoalSet: row.daily_goal_set ?? false,
  };
}

function buildCalendarDays(logs: StudyLog[], target: number): CalendarDay[] {
  const totals = new Map<string, number>();

  logs.forEach((log) => {
    const key = getStudyLogDateKey(log.date);
    totals.set(key, (totals.get(key) ?? 0) + log.solved);
  });

  const todayKey = getTurkeyDateKey();

  return Array.from({ length: 7 }, (_, index) => {
    const key = shiftDateKey(todayKey, index - 6);
    const solved = totals.get(key) ?? 0;

    return {
      label: index === 6 ? 'Bugün' : getShortWeekdayForDateKey(key),
      solved,
      reachedGoal: solved >= target,
    };
  });
}

function parseDepartment(value: unknown): Department {
  if (value === 'Edebiyat' || value === 'Eşit Ağırlık' || value === 'Sayısal' || value === 'Dil') return value;
  if (value === 'Esit Agirlik') return 'Eşit Ağırlık';
  if (value === 'Sayisal') return 'Sayısal';
  return 'Sayısal';
}

function normalizeDepartment(department: Department) {
  if (department === 'Sayısal') return 'Sayisal';
  if (department === 'Eşit Ağırlık') return 'Esit Agirlik';
  return department;
}

function mapStudyLogRow(row: {
  id: number;
  subject_id: number;
  topic_id: number;
  solved_count: number;
  correct_count: number;
  wrong_count: number;
  studied_at: string;
  subjects: { name: string } | { name: string }[] | null;
  topics: { name: string } | { name: string }[] | null;
}): StudyLog {
  const subject = Array.isArray(row.subjects) ? row.subjects[0] : row.subjects;
  const topic = Array.isArray(row.topics) ? row.topics[0] : row.topics;

  return {
    id: row.id,
    subjectId: row.subject_id,
    topicId: row.topic_id,
    subject: prettifySubjectName(subject?.name ?? 'Ders'),
    topic: prettifyTopicName(topic?.name ?? 'Konu'),
    solved: row.solved_count,
    correct: row.correct_count,
    wrong: row.wrong_count,
    date: row.studied_at,
  };
}

function mapMockExamRow(row: {
  id: number;
  name: string;
  exam_date: string;
  tyt_net: number | string;
  ayt_net: number | string;
}): MockExam {
  return {
    id: row.id,
    name: row.name,
    tytNet: Number(row.tyt_net) || 0,
    aytNet: Number(row.ayt_net) || 0,
    date: row.exam_date,
  };
}

function mapAiQuestionRow(row: {
  id: number;
  subject_id: number | null;
  topic_id: number | null;
  prompt: string | null;
  solution: string | null;
  status: string;
  created_at: string;
  subjects: { name: string } | { name: string }[] | null;
  topics: { name: string } | { name: string }[] | null;
}): AiQuestion {
  const subject = Array.isArray(row.subjects) ? row.subjects[0] : row.subjects;
  const topic = Array.isArray(row.topics) ? row.topics[0] : row.topics;

  return {
    id: row.id,
    subjectId: row.subject_id,
    topicId: row.topic_id,
    subject: prettifySubjectName(subject?.name ?? 'Ders'),
    topic: prettifyTopicName(topic?.name ?? 'Konu'),
    prompt: row.prompt ?? '',
    solution: row.solution,
    status: parseAiStatus(row.status),
    createdAt: row.created_at.slice(0, 10),
  };
}

function parseAiStatus(status: string): AiQuestion['status'] {
  if (status === 'solved' || status === 'failed') return status;
  return 'pending';
}

function normalizeExamNet(value: string) {
  const normalized = Number(value.replace(',', '.'));
  if (!Number.isFinite(normalized)) return 0;
  return Math.max(0, normalized);
}

function prettifySubjectName(name: string) {
  const names: Record<string, string> = {
    'Turk Dili ve Edebiyati': 'Türk Dili ve Edebiyatı',
    Cografya: 'Coğrafya',
    'Din Kulturu': 'Din Kültürü',
    'Yabanci Dil': 'Yabancı Dil',
  };
  return names[name] ?? name;
}

function prettifyTopicName(name: string) {
  const names: Record<string, string> = {
    Turev: 'Türev',
    Integral: 'İntegral',
    'Siir Bilgisi': 'Şiir Bilgisi',
    'Edebi Akimlar': 'Edebi Akımlar',
    'Ilk Turk Devletleri': 'İlk Türk Devletleri',
    'Osmanli Kurulus': 'Osmanlı Kuruluş',
    'Kurtulus Savasi': 'Kurtuluş Savaşı',
    'Canlilarin Temel Bilesenleri': 'Canlıların Temel Bileşenleri',
    Hucre: 'Hücre',
    Kalitim: 'Kalıtım',
    'Dogal Sistemler': 'Doğal Sistemler',
    'Beseri Sistemler': 'Beşeri Sistemler',
    'Turkiye Cografyasi': 'Türkiye Coğrafyası',
    Mantik: 'Mantık',
    Inanc: 'İnanç',
    Ibadet: 'İbadet',
    'Ahlak ve Degerler': 'Ahlak ve Değerler',
  };
  return names[name] ?? name;
}

function getSubjectGroup(name: string): Subject['group'] {
  if (name === 'Matematik') return 'Matematik';
  if (name === 'Turk Dili ve Edebiyati') return 'Türkçe';
  if (name === 'Fizik' || name === 'Kimya' || name === 'Biyoloji') return 'Fen';
  if (name === 'Yabanci Dil') return 'Dil';
  return 'Sosyal';
}
