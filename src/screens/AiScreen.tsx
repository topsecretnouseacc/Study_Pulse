import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ActivityRow, ChipSelector, PageTitle } from '../components/ui';
import { styles } from '../styles';
import type { AiQuestion, Subject } from '../types';
import { formatDateLabel } from '../utils/date';

export function AiScreen({
  subjects,
  selectedSubjectId,
  selectedTopicId,
  prompt,
  selectedImageUri,
  gemBalance,
  aiQuestions,
  syncMessage,
  onSelectSubject,
  onSelectTopic,
  onChangePrompt,
  onPickImage,
  onTakePhoto,
  onRemoveImage,
  onSubmit,
}: {
  subjects: Subject[];
  selectedSubjectId: number;
  selectedTopicId: number;
  prompt: string;
  selectedImageUri: string | null;
  gemBalance: number;
  aiQuestions: AiQuestion[];
  syncMessage: string;
  onSelectSubject: (subjectId: number) => void;
  onSelectTopic: (topicId: number) => void;
  onChangePrompt: (value: string) => void;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onRemoveImage: () => void;
  onSubmit: () => void;
}) {
  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId);
  const canSubmit = gemBalance > 0 && Boolean(selectedSubject) && Boolean(prompt.trim() || selectedImageUri);

  return (
    <View style={styles.screen}>
      <PageTitle title="AI Solver" subtitle="Sorunu yaz, fotoğraf ekle, çözümü geçmişte sakla." />

      <View style={styles.aiPanel}>
        <Text style={styles.aiMark}>AI</Text>
        <Text style={styles.aiTitle}>Soru çözüm isteği</Text>
        <Text style={styles.aiCopy}>
          Sorunu yazıyla anlatabilir ya da fotoğrafını ekleyebilirsin. Her çözüm isteği 1 elmas harcar.
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

        <View style={styles.imagePickerWrap}>
          <Text style={styles.inputLabel}>Soru görseli</Text>
          {selectedImageUri ? (
            <View style={styles.aiImagePreviewCard}>
              <Image source={{ uri: selectedImageUri }} style={styles.aiImagePreview} />
              <TouchableOpacity accessibilityRole="button" onPress={onRemoveImage} style={styles.aiImageRemoveButton}>
                <Text style={styles.aiImageRemoveText}>Kaldır</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.aiImageEmpty}>
              <Text style={styles.aiImageEmptyTitle}>Fotoğraf ekle</Text>
              <Text style={styles.aiImageEmptyText}>Kamera ya da galeriden net bir soru görseli seç.</Text>
            </View>
          )}
          <View style={styles.aiImageActions}>
            <TouchableOpacity accessibilityRole="button" onPress={onTakePhoto} style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={onPickImage} style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Galeri</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Soru metni veya not</Text>
          <TextInput
            value={prompt}
            onChangeText={onChangePrompt}
            placeholder="İstersen soruyla ilgili kısa bir not gir"
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
          <Text style={styles.primaryButtonText}>1 elmas ile çözüm iste</Text>
        </TouchableOpacity>
      </View>

      {syncMessage ? <Text style={styles.syncMessage}>{syncMessage}</Text> : null}

      <Text style={styles.sectionTitleLarge}>AI History</Text>
      {aiQuestions.map((question) => (
        <View key={question.id} style={styles.aiHistoryCard}>
          <ActivityRow
            title={`${question.subject} - ${question.topic}`}
            meta={`${formatDateLabel(question.createdAt)} · ${formatStatus(question.status)}`}
          />
          {question.imagePath && !question.imagePath.startsWith('manual-entry/') ? (
            <Text style={styles.aiQuestionText}>Fotoğraflı soru</Text>
          ) : null}
          {question.prompt ? <Text style={styles.aiQuestionText}>{question.prompt}</Text> : null}
          {question.solution ? <Text style={styles.aiSolutionText}>{question.solution}</Text> : null}
        </View>
      ))}
    </View>
  );
}

function formatStatus(status: AiQuestion['status']) {
  if (status === 'solved') return 'Çözüldü';
  if (status === 'failed') return 'Başarısız';
  return 'Bekliyor';
}
