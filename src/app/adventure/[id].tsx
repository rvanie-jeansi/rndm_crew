import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function AdventureScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.emoji}>
            🧭
          </ThemedText>
          <ThemedText type="subtitle" style={styles.title}>
            Приключение
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Здесь будут задания твоего приключения: прогулки, фото, кафе и кубики за направление
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    maxWidth: 420,
    width: '100%',
    alignItems: 'center',
    gap: Spacing.three,
  },
  emoji: {
    fontSize: 64,
    lineHeight: 72,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
});