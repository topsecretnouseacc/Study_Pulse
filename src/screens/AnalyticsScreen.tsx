import { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { PageTitle, ProgressRow } from '../components/ui';
import type { StudyLog } from '../types';
import type { StudyStats } from '../utils/study';
import { styles } from '../styles';
import { getStudyLogDateKey, getTurkeyDateKey, shiftDateKey } from '../utils/date';

type RangeKey = 'today' | 'week' | 'all';

const ranges: Array<{ key: RangeKey; label: string }> = [
  { key: 'today', label: 'Bugün' },
  { key: 'week', label: '7 Gün' },
  { key: 'all', label: 'Tümü' },
];

export function AnalyticsScreen({ stats, studyLogs }: { stats: StudyStats; studyLogs: StudyLog[] }) {
  const [range, setRange] = useState<RangeKey>('week');
  const filteredLogs = useMemo(() => filterLogsByRange(studyLogs, range), [range, studyLogs]);
  const analysis = useMemo(() => createAnalysis(filteredLogs), [filteredLogs]);
  const strongest = analysis.topics.find((item) => item.solved >= 10);
  const weakest = [...analysis.topics].reverse().find((item) => item.solved >= 10);

  return (
    <View style={styles.screen}>
      <PageTitle title="Stats" subtitle="Zayıf konuları ve doğruluk oranlarını gör." />

      <View style={styles.segmentedControl}>
        {ranges.map((item) => {
          const isActive = range === item.key;
          return (
            <TouchableOpacity
              accessibilityRole="button"
              key={item.key}
              onPress={() => setRange(item.key)}
              style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.analysisCard}>
        <Text style={styles.cardTitle}>Performans özeti</Text>
        {analysis.totalSolved === 0 ? (
          <Text style={styles.analysisText}>Bu aralıkta henüz çalışma kaydı yok. İlk kayıt geldiğinde analiz burada oluşacak.</Text>
        ) : (
          <>
            <View style={styles.metricGrid}>
              <Metric value={analysis.totalSolved.toString()} label="Soru" />
              <Metric value={`%${analysis.accuracy}`} label="Doğruluk" />
              <Metric value={analysis.totalWrong.toString()} label="Tekrar" />
            </View>
            <Text style={styles.analysisText}>
              Genel toplamda {stats.totalSolved} soru çözdün. Seçili aralıkta en iyi konu{' '}
              {strongest ? `${strongest.subject} / ${strongest.topic}` : '-'}, en çok tekrar isteyen konu{' '}
              {weakest ? `${weakest.subject} / ${weakest.topic}` : '-'}.
            </Text>
          </>
        )}
      </View>

      <Text style={styles.sectionTitleLarge}>Ders Performansı</Text>
      {analysis.subjects.map((item) => (
        <ProgressRow key={item.subject} label={`${item.subject} · ${item.solved} soru`} value={item.accuracy} />
      ))}

      <Text style={styles.sectionTitleLarge}>Konu Analizi</Text>
      {analysis.topics.map((item) => (
        <ProgressRow
          key={`${item.subject}-${item.topic}`}
          label={`${item.subject} - ${item.topic} · ${item.wrong} yanlış`}
          value={item.accuracy}
        />
      ))}
    </View>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.analysisMetric}>
      <Text style={styles.analysisMetricValue}>{value}</Text>
      <Text style={styles.analysisMetricLabel}>{label}</Text>
    </View>
  );
}

function createAnalysis(logs: StudyLog[]) {
  const totalSolved = logs.reduce((sum, log) => sum + log.solved, 0);
  const totalCorrect = logs.reduce((sum, log) => sum + log.correct, 0);
  const totalWrong = logs.reduce((sum, log) => sum + log.wrong, 0);
  const accuracy = totalSolved === 0 ? 0 : Math.round((totalCorrect / totalSolved) * 100);

  return {
    totalSolved,
    totalCorrect,
    totalWrong,
    accuracy,
    subjects: aggregate(logs, (log) => log.subject),
    topics: aggregate(logs, (log) => `${log.subject}|||${log.topic}`).map((item) => {
      const [subject, topic] = item.key.split('|||');
      return { ...item, subject, topic };
    }),
  };
}

function aggregate(logs: StudyLog[], getKey: (log: StudyLog) => string) {
  const rows = new Map<
    string,
    { key: string; subject: string; topic: string; solved: number; correct: number; wrong: number; accuracy: number }
  >();

  logs.forEach((log) => {
    const key = getKey(log);
    const current = rows.get(key) ?? { key, subject: log.subject, topic: log.topic, solved: 0, correct: 0, wrong: 0, accuracy: 0 };
    current.solved += log.solved;
    current.correct += log.correct;
    current.wrong += log.wrong;
    current.accuracy = current.solved === 0 ? 0 : Math.round((current.correct / current.solved) * 100);
    rows.set(key, current);
  });

  return [...rows.values()].sort((a, b) => b.solved - a.solved || a.accuracy - b.accuracy);
}

function filterLogsByRange(logs: StudyLog[], range: RangeKey) {
  if (range === 'all') return logs;
  if (range === 'today') return logs.filter((log) => getStudyLogDateKey(log.date) === getTurkeyDateKey());

  const startKey = shiftDateKey(getTurkeyDateKey(), -6);

  return logs.filter((log) => {
    const key = getStudyLogDateKey(log.date);
    return key >= startKey;
  });
}
