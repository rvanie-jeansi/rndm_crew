import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/AppContext';
import type { MoneyBudget, Task, TaskType, TimeBudget } from '@/types';
import { formatDistance } from '@/utils/format';

const TASK_EMOJI: Record<TaskType, string> = {
  walk: '🚶',
  find_place: '📍',
  photo: '📸',
  visit_cafe: '☕',
  roll_dice: '🎲',
  question: '💬',
};

const TIME_LABEL: Record<TimeBudget, string> = {
  '30m': '30 мин',
  '1h': '1 час',
  '2h': '2 часа',
  all_day: 'Весь день',
};

const MONEY_LABEL: Record<MoneyBudget, string> = {
  low: '0–500 ₽',
  mid: '500–1500 ₽',
  high: '1500+ ₽',
};

function TaskRow({ task, isCurrent }: { task: Task; isCurrent: boolean }) {
  const theme = useTheme();

  const done = task.status === 'done';
  const skipped = task.status === 'skipped';
  const accent = done ? theme.success : skipped ? theme.textSecondary : theme.text;

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.taskRow, isCurrent && { borderColor: theme.primary, borderWidth: 2 }]}>
      <ThemedText style={[styles.taskRowEmoji, { opacity: skipped ? 0.5 : 1 }]}>
        {TASK_EMOJI[task.type]}
      </ThemedText>
      <View style={styles.taskRowBody}>
        <ThemedText type="smallBold" style={{ color: accent }}>
          {task.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {task.distanceMeters ? `${formatDistance(task.distanceMeters)} · ` : ''}+{task.xp} XP
          {skipped ? ' · пропущено' : ''}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

export default function AdventureScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const { adventures, completeTask, skipTask, finishAdventure } = useApp();

  const [busy, setBusy] = useState(false);

  const adventure = adventures.find((item) => item.id === params.id);

  if (!adventure) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.centerSafe}>
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle" style={styles.emptyEmoji}>
              🧭
            </ThemedText>
            <ThemedText type="subtitle" style={styles.centerText}>
              Приключение не найдено
            </ThemedText>
            <Pressable
              onPress={() => router.replace('/(tabs)')}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.accent },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={styles.primaryLabel}>На главную</ThemedText>
            </Pressable>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const total = adventure.tasks.length;
  const doneCount = adventure.tasks.filter((item) => item.status === 'done').length;
  const skippedCount = adventure.tasks.filter((item) => item.status === 'skipped').length;
  const progress = total > 0 ? doneCount / total : 0;
  const currentTask = adventure.tasks.find((item) => item.status === 'pending');
  const allResolved = !currentTask;

  const act = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    await action();
    setBusy(false);
  };

  const finish = () => act(() => finishAdventure(adventure.id));

  if (adventure.status === 'completed') {
    const earnedXp = adventure.tasks
      .filter((item) => item.status === 'done')
      .reduce((sum, item) => sum + item.xp, 0);

    return (
      <ThemedView style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.centerSafe}>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.successEmoji}>{adventure.emoji}</ThemedText>
            <ThemedText type="subtitle" style={styles.centerText}>
              Приключение завершено!
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              Выполнено заданий: {doneCount} из {total}
              {skippedCount > 0 ? ` · пропущено ${skippedCount}` : ''}
            </ThemedText>
            <ThemedText style={styles.earnedXp}>
              Заработано: +{earnedXp} XP
            </ThemedText>
            <Pressable
              onPress={() => router.replace('/(tabs)')}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.accent },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={styles.primaryLabel}>На главную</ThemedText>
            </Pressable>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: `${adventure.emoji} ${adventure.title}` }} />
      <SafeAreaView edges={['bottom']} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          bounces={false}
          keyboardShouldPersistTaps="handled">
          <ThemedView type="backgroundElement" style={styles.headerCard}>
            <View style={styles.headerTop}>
              <ThemedText style={styles.headerEmoji}>{adventure.emoji}</ThemedText>
              <ThemedText type="subtitle" style={styles.headerTitle}>
                {adventure.title}
              </ThemedText>
            </View>
            <View style={styles.metaRow}>
              <ThemedView type="backgroundSelected" style={styles.metaChip}>
                <ThemedText type="small">{TIME_LABEL[adventure.timeBudget]}</ThemedText>
              </ThemedView>
              <ThemedView type="backgroundSelected" style={styles.metaChip}>
                <ThemedText type="small">{MONEY_LABEL[adventure.moneyBudget]}</ThemedText>
              </ThemedView>
              <ThemedView type="backgroundSelected" style={styles.metaChip}>
                <ThemedText type="small">
                  {adventure.totalDistanceMeters
                    ? `~${formatDistance(adventure.totalDistanceMeters)}`
                    : 'без дистанции'}
                </ThemedText>
              </ThemedView>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(progress * 100)}%`, backgroundColor: theme.primary },
                ]}
              />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {doneCount} из {total} выполнено
              {skippedCount > 0 ? ` · ${skippedCount} пропущено` : ''}
            </ThemedText>
          </ThemedView>

          {currentTask && (
            <ThemedView type="backgroundElement" style={styles.currentCard}>
              <ThemedText type="smallBold" themeColor="primary">
                Следующее задание · {TASK_EMOJI[currentTask.type]}
              </ThemedText>
              <ThemedText type="smallBold" style={styles.currentTitle}>
                {currentTask.title}
              </ThemedText>
              {currentTask.description ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {currentTask.description}
                </ThemedText>
              ) : null}
              <ThemedText type="small" themeColor="textSecondary" style={styles.currentMeta}>
                {currentTask.distanceMeters
                  ? `${formatDistance(currentTask.distanceMeters)} · `
                  : ''}
                +{currentTask.xp} XP
              </ThemedText>
              <View style={styles.currentActions}>
                <Pressable
                  onPress={() => act(() => completeTask(adventure.id, currentTask.id))}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: theme.success },
                    pressed && styles.pressed,
                    busy && styles.disabled,
                  ]}>
                  <ThemedText style={styles.actionLabel}>Сделано ✓</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => act(() => skipTask(adventure.id, currentTask.id))}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: theme.backgroundSelected },
                    pressed && styles.pressed,
                    busy && styles.disabled,
                  ]}>
                  <ThemedText type="small" style={styles.skipLabel}>
                    Пропустить
                  </ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          )}

          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Все задания
          </ThemedText>
          {adventure.tasks.map((task) => (
            <TaskRow key={task.id} task={task} isCurrent={task.id === currentTask?.id} />
          ))}

          {allResolved && (
            <Pressable
              onPress={finish}
              disabled={busy}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.accent },
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}>
              <ThemedText style={styles.primaryLabel}>Завершить приключение</ThemedText>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centerSafe: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: Spacing.four,
    gap: Spacing.three,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: Spacing.six,
  },
  card: {
    maxWidth: 420,
    width: '100%',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerCard: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
  headerTop: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerEmoji: {
    fontSize: 56,
    lineHeight: 64,
  },
  headerTitle: {
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  metaChip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  progressTrack: {
    height: 8,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(128, 128, 128, 0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Spacing.five,
  },
  currentCard: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.two,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentTitle: {
    fontSize: 18,
    lineHeight: 26,
  },
  currentMeta: {
    marginTop: Spacing.one,
  },
  currentActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two + Spacing.one,
    borderRadius: Spacing.three,
  },
  actionLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 700,
  },
  skipLabel: {
    fontWeight: 600,
  },
  sectionLabel: {
    marginTop: Spacing.one,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two + Spacing.one,
    borderRadius: Spacing.three,
  },
  taskRowEmoji: {
    fontSize: 24,
    lineHeight: 30,
  },
  taskRowBody: {
    flex: 1,
    gap: Spacing.half,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
    marginTop: Spacing.one,
  },
  primaryLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  emptyEmoji: {
    fontSize: 56,
    lineHeight: 64,
  },
  successEmoji: {
    fontSize: 72,
    lineHeight: 80,
  },
  centerText: {
    textAlign: 'center',
  },
  earnedXp: {
    fontWeight: 700,
  },
});