import { Text, TouchableOpacity, View } from 'react-native';
import { GoalRing, MiniDetail, Pill, SuggestedStudyBlock, StudyBlock, StudyCalendar, SubjectBar, SummaryMetric } from '../components/ui';
import type { CalendarDay, Department, StudyLog, Subject, UserProfile } from '../types';
import type { StudyStats } from '../utils/study';
import { getRecommendedSubjectNames, getSubjectShortLabel } from '../utils/study';
import { styles } from '../styles';
import { getStudyLogDateKey, getTurkeyDateKey } from '../utils/date';

export function HomeScreen({
  stats,
  studyLogs,
  subjects,
  calendarDays,
  detailMode,
  showCalendar,
  department,
  profile,
  onToggleDetails,
  onToggleCalendar,
  onOpenSettings,
  onOpenStudy,
  onOpenSubject,
}: {
  stats: StudyStats;
  studyLogs: StudyLog[];
  subjects: Subject[];
  calendarDays: CalendarDay[];
  detailMode: boolean;
  showCalendar: boolean;
  department: Department;
  profile: UserProfile | null;
  onToggleDetails: () => void;
  onToggleCalendar: () => void;
  onOpenSettings: () => void;
  onOpenStudy: () => void;
  onOpenSubject: (subjectId: number) => void;
}) {
  const todayLogs = studyLogs.filter((log) => getStudyLogDateKey(log.date) === getTurkeyDateKey());
  const suggestedSubjects = getRecommendedSubjectNames(department)
    .map((name) => subjects.find((subject) => subject.name === name))
    .filter((subject): subject is Subject => Boolean(subject))
    .filter((subject) => !todayLogs.some((log) => log.subjectId === subject.id))
    .slice(0, 4);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" onPress={onOpenSettings} style={styles.profileButton}>
          <Text style={styles.profileButtonText}>{profile?.fullName?.[0]?.toUpperCase() ?? 'P'}</Text>
        </TouchableOpacity>
        <View style={styles.topStats}>
          <Pill icon="◆" value={stats.gems.toLocaleString('tr-TR')} tone="blue" caption="AI hak" />
          <Pill icon="●" value={stats.streak.toString()} tone="flame" />
          <TouchableOpacity accessibilityRole="button" onPress={onToggleCalendar} style={styles.calendarButton}>
            <Text style={styles.calendarIcon}>▰</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateBlock}>
        <Text style={styles.todayTitle}>Today</Text>
        <Text style={styles.weekText}>Week {stats.week} · {department}</Text>
      </View>

      {showCalendar && <StudyCalendar days={calendarDays} target={stats.dailyQuestionGoal} />}

      <View style={styles.focusCard}>
        <Text style={styles.focusLabel}>Focus Track</Text>
        <Text style={styles.focusText}>{stats.departmentPlan.headline}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitleLarge}>Summary</Text>
        <TouchableOpacity accessibilityRole="button" onPress={onToggleDetails}>
          <Text style={styles.detailsLink}>{detailMode ? 'Summary' : 'Details'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <SummaryMetric value={stats.todaySolved.toString()} label="Solved" />
          <GoalRing progress={stats.progress} remaining={stats.remaining} />
          <SummaryMetric value={stats.todayWrong.toString()} label="Review" />
        </View>

        {detailMode ? (
          <View style={styles.detailGrid}>
            <MiniDetail label="Correct" value={stats.totalCorrect.toString()} />
            <MiniDetail label="Accuracy" value={`%${stats.accuracy}`} />
            <MiniDetail label="Weak" value={stats.weakest?.topic ?? '-'} />
          </View>
        ) : (
          <View style={styles.subjectBars}>
            {stats.departmentPlan.primarySubjectIds.map((subjectId) => (
              <SubjectBar
                key={subjectId}
                label={getSubjectShortLabel(subjectId, subjects)}
                value={stats.subjectProgress[subjectId] ?? 0}
                target={stats.departmentPlan.targets[subjectId]}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitleLarge}>Study Blocks</Text>
        <TouchableOpacity accessibilityRole="button" onPress={onOpenStudy}>
          <Text style={styles.detailsLink}>More</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.blockList}>
        {todayLogs.map((log) => (
          <StudyBlock key={log.id} log={log} onAdd={() => onOpenSubject(log.subjectId)} />
        ))}
        {todayLogs.length === 0 &&
          suggestedSubjects.map((subject) => (
            <SuggestedStudyBlock
              key={subject.id}
              subject={subject.name}
              topic={subject.topics[0]?.name ?? 'Konu seç'}
              target={stats.departmentPlan.targets[subject.id] ?? 35}
              onAdd={() => onOpenSubject(subject.id)}
            />
          ))}
      </View>
    </View>
  );
}
