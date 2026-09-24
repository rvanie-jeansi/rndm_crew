import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function OnboardingScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.emoji}>
            🎲
          </ThemedText>
          <ThemedText type="subtitle" style={styles.title}>
            Добро пожаловать в RANDOM
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Скучно? Мы придумаем приключение. Хочется гулять, есть кафешки и открывать место —
            тебе просто повезёт снова
          </ThemedText>

          <Pressable
            onPress={() => router.replace('/(tabs)')}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: theme.accent },
              pressed && styles.ctaPressed,
            ]}>
            <ThemedText style={styles.ctaLabel}>Самое время!</ThemedText>
          </Pressable>
          <ThemedText type="small" themeColor="textSecondary" style={styles.comingSoon}>
            Имя и интересы — в следующем этапе
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
  cta: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
    marginTop: Spacing.two,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 700,
  },
  comingSoon: {
    textAlign: 'center',
  },
});