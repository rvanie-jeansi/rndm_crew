import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { generateAdventure } from '@/engine/generator';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/AppContext';
import type { MoneyBudget, TimeBudget } from '@/types';

const TIME_OPTIONS: { value: TimeBudget; emoji: string; label: string }[] = [
  { value: '30m', emoji: '⚡', label: '30 мин' },
  { value: '1h', emoji: '🕐', label: '1 час' },
  { value: '2h', emoji: '🕑', label: '2 часа' },
  { value: 'all_day', emoji: '🌞', label: 'Весь день' },
];

const MONEY_OPTIONS: { value: MoneyBudget; emoji: string; label: string }[] = [
  { value: 'low', emoji: '🙌', label: '0–500 ₽' },
  { value: 'mid', emoji: '☕', label: '500–1500 ₽' },
  { value: 'high', emoji: '✨', label: '1500+ ₽' },
];

type OptionChipProps = {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

function OptionChip({ emoji, label, selected, onPress }: OptionChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chipWrap, pressed && styles.pressed]}>
      <ThemedView type={selected ? 'primarySoft' : 'backgroundSelected'} style={styles.chip}>
        <ThemedText
          type="small"
          style={selected ? { color: theme.primary, fontWeight: 700 } : undefined}>
          {emoji} {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { profile, adventures, addAdventure } = useApp();

  const [time, setTime] = useState<TimeBudget>('1h');
  const [money, setMoney] = useState<MoneyBudget>('mid');

  const activeAdventure = adventures.find((item) => item.status === 'active');
  const activeDone =
    activeAdventure?.tasks.filter((item) => item.status === 'done').length ?? 0;
  const activeTotal = activeAdventure?.tasks.length ?? 0;

  const generate = () => {
    const adventure = generateAdventure({
      time,
      money,
      interests: profile?.interests ?? [],
      excludeScenarioId: adventures[0]?.scenarioId,
    });
    void addAdventure(adventure);
    router.push(`/adventure/${adventure.id}`);
  };

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
            Выбери время и бюджет — мы придумаем приключение рядом
          </ThemedText>
        </ThemedView>

        {activeAdventure && (
          <Pressable
            onPress={() => router.push(`/adventure/${activeAdventure.id}`)}
            style={({ pressed }) => [pressed && styles.pressed]}>
            <ThemedView type="backgroundElement" style={styles.activeCard}>
              <View style={styles.activeHeader}>
                <ThemedText style={styles.activeEmoji}>{activeAdventure.emoji}</ThemedText>
                <View style={styles.activeBody}>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    Активное приключение
                  </ThemedText>
                  <ThemedText type="default" style={styles.activeTitle}>
                    {activeAdventure.title}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Выполнено {activeDone} из {activeTotal} заданий
                  </ThemedText>
                  <View style={styles.activeTrack}>
                    <View
                      style={[
                        styles.activeFill,
                        {
                          width: `${Math.round(
                            (activeTotal > 0 ? activeDone / activeTotal : 0) * 100,
                          )}%`,
                          backgroundColor: theme.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
              <View
                style={[
                  styles.continueButton,
                  { backgroundColor: theme.primary },
                ]}>
                <ThemedText style={styles.continueLabel}>Продолжить</ThemedText>
              </View>
            </ThemedView>
          </Pressable>
        )}

        <ThemedView type="backgroundElement" style={styles.optionsCard}>
          <ThemedText type="smallBold">Время</ThemedText>
          <View style={styles.chips}>
            {TIME_OPTIONS.map((option) => (
              <OptionChip
                key={option.value}
                emoji={option.emoji}
                label={option.label}
                selected={time === option.value}
                onPress={() => setTime(option.value)}
              />
            ))}
          </View>

          <ThemedText type="smallBold">Бюджет</ThemedText>
          <View style={styles.chips}>
            {MONEY_OPTIONS.map((option) => (
              <OptionChip
                key={option.value}
                emoji={option.emoji}
                label={option.label}
                selected={money === option.value}
                onPress={() => setMoney(option.value)}
              />
            ))}
          </View>
        </ThemedView>

        <Pressable
          onPress={generate}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: theme.accent },
            pressed && styles.ctaPressed,
          ]}>
          <ThemedText style={styles.ctaLabel}>Сгенерировать!</ThemedText>
        </Pressable>
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
  optionsCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.four,
  },
  activeCard: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  activeEmoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  activeBody: {
    flex: 1,
    gap: Spacing.half,
  },
  activeTitle: {
    fontWeight: 700,
  },
  activeTrack: {
    height: 6,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(128, 128, 128, 0.25)',
    overflow: 'hidden',
    marginTop: Spacing.one,
  },
  activeFill: {
    height: '100%',
    borderRadius: Spacing.three,
  },
  continueButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  continueLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 700,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chipWrap: {
    borderRadius: Spacing.five,
  },
  chip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});