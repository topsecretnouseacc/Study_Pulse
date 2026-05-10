import { Text, View } from 'react-native';
import { ActivityRow, FormCard, Input, PageTitle } from '../components/ui';
import type { MockExam } from '../types';
import { styles } from '../styles';

export function ExamScreen(props: {
  examName: string;
  tytNet: string;
  aytNet: string;
  setExamName: (value: string) => void;
  setTytNet: (value: string) => void;
  setAytNet: (value: string) => void;
  addMockExam: () => void;
  mockExams: MockExam[];
  syncMessage: string;
}) {
  return (
    <View style={styles.screen}>
      <PageTitle title="Mock Exams" subtitle="TYT ve AYT deneme netlerini takip et." />
      <FormCard title="Deneme sonucu ekle" actionLabel="Denemeyi kaydet" onAction={props.addMockExam}>
        <Input label="Deneme adı" value={props.examName} onChangeText={props.setExamName} />
        <View style={styles.inputRow}>
          <Input label="TYT net" value={props.tytNet} onChangeText={props.setTytNet} keyboardType="decimal-pad" />
          <Input label="AYT net" value={props.aytNet} onChangeText={props.setAytNet} keyboardType="decimal-pad" />
        </View>
      </FormCard>

      {props.syncMessage ? <Text style={styles.syncMessage}>{props.syncMessage}</Text> : null}

      <Text style={styles.sectionTitleLarge}>Exam History</Text>
      {props.mockExams.map((exam) => (
        <ActivityRow key={exam.id} title={exam.name} meta={`${exam.date} · TYT ${exam.tytNet} · AYT ${exam.aytNet}`} />
      ))}
    </View>
  );
}
