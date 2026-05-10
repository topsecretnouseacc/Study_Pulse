import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { styles } from '../styles';
import type { Department, UserProfile } from '../types';

const departments: Department[] = ['Sayısal', 'Eşit Ağırlık', 'Edebiyat', 'Dil'];

export function AuthScreen({ onComplete }: { onComplete: (profile: UserProfile) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState<Department>('Sayısal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function submit() {
    if (!email.trim() || !password.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const nextProfile: UserProfile = {
      fullName: fullName.trim() || 'StudyPulse User',
      email: email.trim(),
      department,
      dailyQuestionGoal: 180,
      streakCount: 0,
      gemBalance: 0,
      lastGoalCompletedDate: null,
      dailyGoalSet: false,
    };

    const response =
      mode === 'register'
        ? await supabase.auth.signUp({
            email: nextProfile.email,
            password,
            options: {
              data: {
                full_name: nextProfile.fullName,
                department: nextProfile.department,
              },
            },
          })
        : await supabase.auth.signInWithPassword({
            email: nextProfile.email,
            password,
          });

    if (response.error) {
      setErrorMessage(response.error.message);
      setIsSubmitting(false);
      return;
    }

    if (mode === 'register' && response.data.user) {
      await supabase.from('profiles').upsert({
        id: response.data.user.id,
        full_name: nextProfile.fullName,
        department: normalizeDepartment(nextProfile.department),
        daily_question_goal: nextProfile.dailyQuestionGoal,
        streak_count: nextProfile.streakCount,
        gem_balance: nextProfile.gemBalance,
        daily_goal_set: nextProfile.dailyGoalSet,
      });
    }

    const user = response.data.user;
    const metadata = user?.user_metadata ?? {};
    const savedProfile = user ? await fetchProfile(user.id, user.email ?? nextProfile.email) : null;

    onComplete(
      savedProfile ?? {
        id: user?.id,
        fullName: (metadata.full_name as string | undefined) ?? nextProfile.fullName,
        email: user?.email ?? nextProfile.email,
        department: parseDepartment(metadata.department ?? nextProfile.department),
        dailyQuestionGoal: nextProfile.dailyQuestionGoal,
        streakCount: nextProfile.streakCount,
        gemBalance: nextProfile.gemBalance,
        lastGoalCompletedDate: nextProfile.lastGoalCompletedDate,
        dailyGoalSet: nextProfile.dailyGoalSet,
      },
    );

    setIsSubmitting(false);
  }

  return (
    <View style={styles.authShell}>
      <View style={styles.authHeader}>
        <Text style={styles.authBrand}>StudyPulse</Text>
        <Text style={styles.authTitle}>{mode === 'register' ? 'YKS planını kur' : 'Tekrar hoş geldin'}</Text>
        <Text style={styles.authCopy}>
          Günlük soru hedefini, bölüm odağını ve AI soru çözüm haklarını tek yerden takip et.
        </Text>
      </View>

      <View style={styles.authCard}>
        <View style={styles.authModeRow}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setMode('register')}
            style={[styles.authModeButton, mode === 'register' && styles.authModeButtonActive]}
          >
            <Text style={[styles.authModeText, mode === 'register' && styles.authModeTextActive]}>Kaydol</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setMode('login')}
            style={[styles.authModeButton, mode === 'login' && styles.authModeButtonActive]}
          >
            <Text style={[styles.authModeText, mode === 'login' && styles.authModeTextActive]}>Giriş</Text>
          </TouchableOpacity>
        </View>

        {mode === 'register' && (
          <View style={styles.authInputWrap}>
            <Text style={styles.inputLabel}>Ad Soyad</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              placeholder="Adını ve soyadını gir"
              placeholderTextColor="#808b96"
            />
          </View>
        )}

        <View style={styles.authInputWrap}>
          <Text style={styles.inputLabel}>E-posta</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            placeholder="E-posta adresini gir"
            placeholderTextColor="#808b96"
          />
        </View>

        <View style={styles.authInputWrap}>
          <Text style={styles.inputLabel}>Şifre</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholder="Şifreni gir"
            placeholderTextColor="#808b96"
          />
        </View>

        {mode === 'register' && (
          <View style={styles.authInputWrap}>
            <Text style={styles.inputLabel}>Bölüm</Text>
            <View style={styles.authDepartmentGrid}>
              {departments.map((item) => (
                <TouchableOpacity
                  accessibilityRole="button"
                  key={item}
                  onPress={() => setDepartment(item)}
                  style={[styles.authDepartmentChip, item === department && styles.authDepartmentChipActive]}
                >
                  <Text style={[styles.authDepartmentText, item === department && styles.authDepartmentTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {errorMessage && <Text style={styles.authErrorText}>{errorMessage}</Text>}

        <TouchableOpacity accessibilityRole="button" onPress={submit} style={styles.authSubmitButton}>
          <Text style={styles.authSubmitText}>
            {isSubmitting ? 'Bağlanıyor...' : mode === 'register' ? 'Hesap oluştur' : 'Giriş yap'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

async function fetchProfile(userId: string, email: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, department, daily_question_goal, streak_count, gem_balance, last_goal_completed_date, daily_goal_set')
    .eq('id', userId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    fullName: data.full_name ?? 'StudyPulse User',
    email,
    department: parseDepartment(data.department),
    dailyQuestionGoal: data.daily_question_goal ?? 180,
    streakCount: data.streak_count ?? 0,
    gemBalance: data.gem_balance ?? 0,
    lastGoalCompletedDate: data.last_goal_completed_date,
    dailyGoalSet: data.daily_goal_set ?? false,
  };
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
