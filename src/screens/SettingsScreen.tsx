import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';
import type { Department, UserProfile } from '../types';

const departments: Department[] = ['Sayısal', 'Eşit Ağırlık', 'Edebiyat', 'Dil'];

export function SettingsScreen({
  profile,
  onSelectDepartment,
  onUpdateDailyGoal,
}: {
  profile: UserProfile;
  onSelectDepartment: (department: Department) => void;
  onUpdateDailyGoal: (goal: number) => void;
}) {
  const [page, setPage] = useState<'root' | 'user' | 'app'>('root');
  const [goalInput, setGoalInput] = useState(String(profile.dailyQuestionGoal));

  function saveGoal() {
    const nextGoal = Number(goalInput);
    if (!Number.isFinite(nextGoal) || nextGoal <= 0) return;
    onUpdateDailyGoal(Math.round(nextGoal));
  }

  if (page === 'user') {
    return (
      <View style={styles.screen}>
        <TouchableOpacity accessibilityRole="button" onPress={() => setPage('root')}>
          <Text style={styles.settingsBack}>‹ Ayarlar</Text>
        </TouchableOpacity>
        <Text style={styles.todayTitle}>Kullanıcı Ayarları</Text>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsCardTitle}>Bölüm seç</Text>
          <Text style={styles.settingsText}>Ana ekrandaki odak dersler bölümüne göre değişir.</Text>
          <View style={styles.authDepartmentGrid}>
            {departments.map((department) => (
              <TouchableOpacity
                accessibilityRole="button"
                key={department}
                onPress={() => onSelectDepartment(department)}
                style={[styles.authDepartmentChip, profile.department === department && styles.authDepartmentChipActive]}
              >
                <Text style={[styles.authDepartmentText, profile.department === department && styles.authDepartmentTextActive]}>
                  {department}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsCardTitle}>Günlük hedef soru sayısı</Text>
          <Text style={styles.settingsText}>Bu hedef tamamlanınca streak güncellenir ve 1 elmas kazanılır.</Text>
          <View style={styles.goalInputRow}>
            <TextInput
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="numeric"
              style={[styles.input, styles.goalInput]}
              placeholderTextColor="#808b96"
            />
            <TouchableOpacity accessibilityRole="button" onPress={saveGoal} style={styles.goalSaveButton}>
              <Text style={styles.goalSaveText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (page === 'app') {
    return (
      <View style={styles.screen}>
        <TouchableOpacity accessibilityRole="button" onPress={() => setPage('root')}>
          <Text style={styles.settingsBack}>‹ Ayarlar</Text>
        </TouchableOpacity>
        <Text style={styles.todayTitle}>Uygulama Ayarları</Text>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsCardTitle}>Bildirimler</Text>
          <Text style={styles.settingsText}>Günlük hatırlatma ve hedef uyarıları sonraki fazda eklenecek.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.todayTitle}>Ayarlar</Text>
      <Text style={styles.weekText}>{profile.fullName}</Text>

      <TouchableOpacity accessibilityRole="button" onPress={() => setPage('user')} style={styles.settingsRow}>
        <View>
          <Text style={styles.settingsRowTitle}>Kullanıcı Ayarları</Text>
          <Text style={styles.settingsRowMeta}>Bölüm, günlük hedef, streak ayarları</Text>
        </View>
        <Text style={styles.settingsChevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity accessibilityRole="button" onPress={() => setPage('app')} style={styles.settingsRow}>
        <View>
          <Text style={styles.settingsRowTitle}>Uygulama Ayarları</Text>
          <Text style={styles.settingsRowMeta}>Bildirimler ve deneyim ayarları</Text>
        </View>
        <Text style={styles.settingsChevron}>›</Text>
      </TouchableOpacity>
    </View>
  );
}
