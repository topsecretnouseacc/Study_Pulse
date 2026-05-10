import { Text, TouchableOpacity, View } from 'react-native';
import { PageTitle } from '../components/ui';
import { styles } from '../styles';

export function AiScreen() {
  return (
    <View style={styles.screen}>
      <PageTitle title="AI Solver" subtitle="Fotoğraftan adım adım soru çözümü." />
      <View style={styles.aiPanel}>
        <Text style={styles.aiMark}>AI</Text>
        <Text style={styles.aiTitle}>Soru fotoğrafından adım adım çözüm</Text>
        <Text style={styles.aiCopy}>
          Bu modül ikinci fazda OpenAI API ve Supabase Storage ile bağlanacak. API anahtarı mobil uygulamada tutulmayacak.
        </Text>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Fotoğraf yükleme alanı</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
