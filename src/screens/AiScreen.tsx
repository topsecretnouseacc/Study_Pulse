import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ActivityRow, ChipSelector, PageTitle } from '../components/ui';
import { styles } from '../styles';
import type { AiQuestion, Subject } from '../types';
import { formatDateLabel } from '../utils/date';

export function AiScreen({
  subjects,
  selectedSubjectId,
  selectedTopicId,
  prompt,
  gemBalance,
  aiQuestions,
  syncMessage,
  onSelectSubject,
  onSelectTopic,
  onChangePrompt,
  onSubmit,
}: {
  subjects: Subject[];
  selectedSubjectId: number;
  selectedTopicId: number;
  prompt: string;
  gemBalance: number;
  aiQuestions: AiQuestion[];
  syncMessage: string;
  onSelectSubject: (subjectId: number) => void;
  onSelectTopic: (topicId: number) => void;
  onChangePrompt: (value: string) => void;
  onSubmit: () => void;
}) {
  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId);
  const canSubmit = gemBalance > 0 && Boolean(selectedSubject) && Boolean(prompt.trim());

  return (
    <View style={styles.screen}>
      <PageTitle title="AI Solver" subtitle="Soru isteğini kaydet, çözüm motoruna hazırla." />

      <View style={styles.aiPanel}>
        <Text style={styles.aiMark}>AI</Text>
        <Text style={styles.aiTitle}>Soru çözüm isteği</Text>
        <Text style={styles.aiCopy}>
          Bu adım isteği Supabase'e kaydeder ve 1 elmas harcar. Fotoğraf yükleme ve otomatik çözüm motorunu sonraki adımda bağlayacağız.
        </Text>
        <Text style={styles.aiGemText}>{gemBalance} elmas kullanılabilir</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.cardTitle}>Yeni AI isteği</Text>
        {subjects.length === 0 && <Text style={styles.settingsText}>Ders ve konu listesi yükleniyor...</Text>}
        <ChipSelector
          label="Ders"
          options={subjects.map((subject) => ({ id: subject.id, label: subject.name }))}
          selectedId={selectedSubjectId}
          onSelect={onSelectSubject}
        />
        {selectedSubject && (
          <ChipSelector
            label="Konu"
            options={selectedSubject.topics.map((topic) => ({ id: topic.id, label: topic.name }))}
            selectedId={selectedTopicId}
            onSelect={onSelectTopic}
          />
        )}
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Soru metni veya not</Text>
          <TextInput
            value={prompt}
            onChangeText={onChangePrompt}
            placeholder="Soru metnini ya da hatırlatıcı notunu gir"
            placeholderTextColor="#808b96"
            multiline
            style={[styles.input, styles.aiPromptInput]}
          />
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onSubmit}
          disabled={!canSubmit}
          style={[styles.primaryButton, !canSubmit && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>1 elmas ile isteği kaydet</Text>
        </TouchableOpacity>
      </View>

      {syncMessage ? <Text style={styles.syncMessage}>{syncMessage}</Text> : null}

      <Text style={styles.sectionTitleLarge}>AI History</Text>
      {aiQuestions.map((question) => (
        <ActivityRow
          key={question.id}
          title={`${question.subject} - ${question.topic}`}
          meta={`${formatDateLabel(question.createdAt)} · ${formatStatus(question.status)}`}
        />
      ))}
    </View>
  );
}

function formatStatus(status: AiQuestion['status']) {
  if (status === 'solved') return 'Çözüldü';
  if (status === 'failed') return 'Başarısız';
  return 'Bekliyor';
}
