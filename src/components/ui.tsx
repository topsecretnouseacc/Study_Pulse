import type { ReactNode } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { CalendarDay, Department, StudyLog, UserProfile } from '../types';
import { getSubjectIcon } from '../utils/study';
import { styles } from '../styles';

export function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.pageTitleBlock}>
      <Text style={styles.todayTitle}>{title}</Text>
      <Text style={styles.weekText}>{subtitle}</Text>
    </View>
  );
}

export function Pill({ icon, value, tone, caption }: { icon: string; value: string; tone: 'blue' | 'flame'; caption?: string }) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillIcon, tone === 'blue' ? styles.blueIcon : styles.flameIcon]}>{icon}</Text>
      <View>
        <Text style={styles.pillValue}>{value}</Text>
        {caption && <Text style={styles.pillCaption}>{caption}</Text>}
      </View>
    </View>
  );
}

export function StudyCalendar({ days, target }: { days: CalendarDay[]; target: number }) {
  return (
    <View style={styles.calendarPanel}>
      <View style={styles.calendarPanelHeader}>
        <Text style={styles.calendarTitle}>Study Calendar</Text>
        <Text style={styles.calendarHint}>Hedef: {target} soru</Text>
      </View>
      <View style={styles.calendarGrid}>
        {days.map((day) => {
          const intensity = Math.min(day.solved / target, 1);
          return (
            <View key={day.label} style={styles.calendarDay}>
              <View style={[styles.calendarBubble, day.reachedGoal && styles.calendarBubbleDone, { opacity: 0.45 + intensity * 0.55 }]}>
                <Text style={[styles.calendarBubbleText, day.reachedGoal && styles.calendarBubbleTextDone]}>{day.solved}</Text>
              </View>
              <Text style={styles.calendarDayLabel}>{day.label}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.calendarFootnote}>Hedef tamamlanan her gün 1 elmas kazandırır.</Text>
    </View>
  );
}

export function DailyGoalPrompt({
  value,
  onChangeText,
  onSubmit,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.goalOverlay}>
      <View style={styles.goalPromptCard}>
        <Text style={styles.goalPromptTitle}>Günlük soru hedefin nedir?</Text>
        <Text style={styles.goalPromptText}>
          Bu hedef takvim, streak ve elmas kazanma sistemini belirleyecek. Daha sonra kullanıcı ayarlarından değiştirebilirsin.
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder="Soru sayısı"
          placeholderTextColor="#808b96"
          style={styles.goalPromptInput}
        />
        <TouchableOpacity accessibilityRole="button" onPress={onSubmit} style={styles.authSubmitButton}>
          <Text style={styles.authSubmitText}>Hedefi kaydet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ProfileSettingsPanel({
  department,
  profile,
  onSelectDepartment,
}: {
  department: Department;
  profile: UserProfile | null;
  onSelectDepartment: (department: Department) => void;
}) {
  return (
    <View style={styles.profilePanel}>
      <View>
        <Text style={styles.profilePanelTitle}>Kullanıcı Ayarları</Text>
        <Text style={styles.profilePanelText}>
          {profile ? `${profile.fullName} · ${profile.email}` : 'Bölüm seçimi kayıt olurken alınacak.'}
        </Text>
        <Text style={styles.profilePanelText}>Bölüm seçimini buradan sonradan değiştirebilirsin.</Text>
      </View>
      <View style={styles.departmentGrid}>
        {(['Sayısal', 'Eşit Ağırlık', 'Edebiyat', 'Dil'] as Department[]).map((item) => (
          <TouchableOpacity
            accessibilityRole="button"
            key={item}
            onPress={() => onSelectDepartment(item)}
            style={[styles.departmentChip, item === department && styles.departmentChipActive]}
          >
            <Text style={[styles.departmentChipText, item === department && styles.departmentChipTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function SummaryMetric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.summaryMetric}>
      <Text style={styles.summaryMetricValue}>{value}</Text>
      <Text style={styles.summaryMetricLabel}>{label}</Text>
    </View>
  );
}

export function GoalRing({ progress, remaining }: { progress: number; remaining: number }) {
  const fillDegrees = Math.round(270 * progress);

  return (
    <View style={styles.ringWrap}>
      <View style={styles.ringTrack}>
        <View style={[styles.ringFill, { transform: [{ rotate: `${-135 + fillDegrees}deg` }] }]} />
        <View style={styles.ringCenter}>
          <Text style={styles.remainingValue}>{remaining}</Text>
          <Text style={styles.remainingLabel}>Remaining</Text>
        </View>
      </View>
    </View>
  );
}

export function SubjectBar({ label, value, target }: { label: string; value: number; target: number }) {
  const percentage = Math.min((value / target) * 100, 100);

  return (
    <View style={styles.subjectBarItem}>
      <Text style={styles.subjectBarLabel}>{label}</Text>
      <View style={styles.subjectTrack}>
        <View style={[styles.subjectFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.subjectAmount}>
        {value} / {target}
      </Text>
    </View>
  );
}

export function StudyBlock({ log, onAdd }: { log: StudyLog; onAdd: () => void }) {
  const rate = Math.round((log.correct / log.solved) * 100);

  return (
    <View style={styles.studyBlock}>
      <View style={styles.blockRing}>
        <Text style={styles.blockIcon}>{getSubjectIcon(log.subject)}</Text>
      </View>
      <View style={styles.studyBlockBody}>
        <Text style={styles.blockTitle}>{log.subject}</Text>
        <Text style={styles.blockMeta}>
          {log.correct} / {log.solved} correct
        </Text>
        <View style={styles.aiTagRow}>
          <Text style={styles.aiTag}>AI</Text>
          <Text numberOfLines={1} style={styles.blockTopic}>
            {log.topic} · %{rate}
          </Text>
        </View>
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={onAdd} style={styles.addCircle}>
        <Text style={styles.addCircleText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function SuggestedStudyBlock({
  subject,
  topic,
  target,
  onAdd,
}: {
  subject: string;
  topic: string;
  target: number;
  onAdd: () => void;
}) {
  return (
    <View style={styles.studyBlock}>
      <View style={styles.blockRingMuted}>
        <Text style={styles.blockIcon}>{getSubjectIcon(subject)}</Text>
      </View>
      <View style={styles.studyBlockBody}>
        <Text style={styles.blockTitle}>{subject}</Text>
        <Text style={styles.blockMeta}>{target} soru hedef</Text>
        <View style={styles.aiTagRow}>
          <Text style={styles.planTag}>Plan</Text>
          <Text numberOfLines={1} style={styles.blockTopic}>
            {topic}
          </Text>
        </View>
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={onAdd} style={styles.addCircle}>
        <Text style={styles.addCircleText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function MiniDetail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniDetail}>
      <Text style={styles.miniDetailValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.miniDetailLabel}>{label}</Text>
    </View>
  );
}

export function FormCard({ title, actionLabel, onAction, children }: { title: string; actionLabel: string; onAction: () => void; children: ReactNode }) {
  return (
    <View style={styles.formCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
      <TouchableOpacity accessibilityRole="button" onPress={onAction} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>+ {actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#808b96"
        style={styles.input}
      />
    </View>
  );
}

export function ChipSelector({
  label,
  options,
  selectedId,
  onSelect,
}: {
  label: string;
  options: Array<{ id: number; label: string }>;
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <View style={styles.selectorWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipList}>
        {options.map((option) => {
          const isSelected = option.id === selectedId;
          return (
            <TouchableOpacity
              accessibilityRole="button"
              key={option.id}
              onPress={() => onSelect(option.id)}
              style={[styles.chip, isSelected && styles.chipActive]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function ActivityRow({ title, meta }: { title: string; meta: string }) {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityDot} />
      <View style={styles.activityBody}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityMeta}>{meta}</Text>
      </View>
    </View>
  );
}

export function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>%{value}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${value}%` }]} />
      </View>
    </View>
  );
}
