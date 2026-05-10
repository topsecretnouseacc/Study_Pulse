import { Text, View } from 'react-native';
import { PageTitle, ProgressRow } from '../components/ui';
import type { StudyLog } from '../types';
import type { StudyStats } from '../utils/study';
import { styles } from '../styles';

export function AnalyticsScreen({ stats, studyLogs }: { stats: StudyStats; studyLogs: StudyLog[] }) {
  return (
    <View style={styles.screen}>
      <PageTitle title="Stats" subtitle="Zayıf konuları ve doğruluk oranlarını gör." />
      <View style={styles.analysisCard}>
        <Text style={styles.cardTitle}>Performans özeti</Text>
        <Text style={styles.analysisText}>
          Toplam {stats.totalSolved} soru içinde doğruluk oranın %{stats.accuracy}. En çok dikkat isteyen konu{' '}
          {stats.weakest?.subject} / {stats.weakest?.topic}.
        </Text>
      </View>

      <Text style={styles.sectionTitleLarge}>Topic Accuracy</Text>
      {studyLogs.map((log) => {
        const rate = Math.round((log.correct / log.solved) * 100);
        return <ProgressRow key={log.id} label={`${log.subject} - ${log.topic}`} value={rate} />;
      })}
    </View>
  );
}
