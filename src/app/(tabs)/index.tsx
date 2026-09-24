import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TIME_OPTIONS = ['30 мин', '1 ч', '2 ч', 'весь день'];
const BUDGET_OPTIONS = ['0–500 ₽', '500–1500 ₽', '1500+ ₽'];

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.hero}>
          <ThemedText type="title" themeColor="primary" style={styles.logo}>
            RANDOM
          </ThemedText>
          <ThemedText type="subtitle" style={styles.tagline}>
            Надоело сидеть дома?
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.hint}>
            Случайные приключения рядом с тобой
          </ThemedText>
        </ThemedView>

        <Pressable
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: theme.accent },
            pressed && styles.ctaPressed,
          ]}>
          <ThemedText style={styles.ctaLabel}>Мне скучно!</ThemedText>
        </Pressable>

        <ThemedView type="backgroundElement" style={styles.optionsCard}>
          <ThemedText type="smallBold">Время</ThemedText>
          <View style={styles.chips}>
            {TIME_OPTIONS.map((label) => (
              <ThemedView key={label} type="backgroundSelected" style={styles.chip}>
                <ThemedText type="small">{label}</ThemedText>
              </ThemedView>
            ))}
          </View>

          <ThemedText type="smallBold">Бюджет</ThemedText>
          <View style={styles.chips}>
            {BUDGET_OPTIONS.map((label) => (
              <ThemedView key={label} type="backgroundSelected" style={styles.chip}>
                <ThemedText type="small">{label}</ThemedText>
              </ThemedView>
            ))}
          </View>

          <ThemedText type="small" themeColor="textSecondary" style={styles.comingSoon}>
            Выбор и генератор — уже скоро
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
    paddingBottom: BottomTabInset + Spacing.four,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.four,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.six,
  },
  logo: {
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: 2,
  },
  tagline: {
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
  },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 700,
  },
  optionsCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.four,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  comingSoon: {
    marginTop: Spacing.two,
  },
});