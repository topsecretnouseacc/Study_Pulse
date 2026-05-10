import { Text, View } from 'react-native';
import { ActivityRow, ChipSelector, FormCard, Input, PageTitle } from '../components/ui';
import type { StudyLog, Subject } from '../types';
import { styles } from '../styles';

export function StudyScreen(props: {
  subjects: Subject[];
  selectedSubjectId: number;
  selectedTopicId: number;
  solved: string;
  correct: string;
  setSubjectId: (value: number) => void;
  setTopicId: (value: number) => void;
  setSolved: (value: string) => void;
  setCorrect: (value: string) => void;
  addStudyLog: () => void;
  studyLogs: StudyLog[];
  syncMessage: string;
}) {
  const selectedSubject = props.subjects.find((subject) => subject.id === props.selectedSubjectId) ?? props.subjects[0];

  return (
    <View style={styles.screen}>
      <PageTitle title="Log Study" subtitle="Ders ve konuyu listeden seçerek temiz veri oluştur." />
      <FormCard title="Çalışma kaydı ekle" actionLabel="Kaydı ekle" onAction={props.addStudyLog}>
        <ChipSelector
          label="Ders"
          options={props.subjects.map((subject) => ({ id: subject.id, label: subject.name }))}
          selectedId={props.selectedSubjectId}
          onSelect={props.setSubjectId}
        />
        <ChipSelector
          label="Konu"
          options={selectedSubject.topics.map((topic) => ({ id: topic.id, label: topic.name }))}
          selectedId={props.selectedTopicId}
          onSelect={props.setTopicId}
        />
        <View style={styles.inputRow}>
          <Input label="Çözülen" value={props.solved} onChangeText={props.setSolved} keyboardType="numeric" placeholder="0" />
          <Input label="Doğru" value={props.correct} onChangeText={props.setCorrect} keyboardType="numeric" placeholder="0" />
        </View>
      </FormCard>

      {props.syncMessage ? <Text style={styles.syncMessage}>{props.syncMessage}</Text> : null}

      <Text style={styles.sectionTitleLarge}>History</Text>
      {props.studyLogs.map((log) => (
        <ActivityRow
          key={log.id}
          title={`${log.subject} - ${log.topic}`}
          meta={`${log.date} · ${log.solved} soru · ${log.correct} doğru · ${log.wrong} yanlış`}
        />
      ))}
    </View>
  );
}
