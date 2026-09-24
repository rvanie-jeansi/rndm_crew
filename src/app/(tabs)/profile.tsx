import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { ACHIEVEMENTS } from '@/data/achievements';
import { INTERESTS } from '@/data/interests';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/AppContext';
import { formatDistance } from '@/utils/format';
import { levelFromXp } from '@/utils/levels';

export default function ProfileScreen() {
  const theme = useTheme();
  const { profile, stats } = useApp();

  const { level, currentXp, neededXp } = levelFromXp(stats.xp);
  const progress = Math.min(1, currentXp / neededXp);
  const unlockedSet = new Set(stats.achievements);
  const interestLabels =
    profile?.interests
      .map((id) => INTERESTS.find((interest) => interest.id === id)?.label)
      .filter((label): label is string => Boolean(label)) ?? [];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          bounces={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.primarySoft, borderColor: theme.primary },
              ]}>
              <ThemedText style={styles.avatarEmoji}>{profile?.emoji ?? '🎲'}</ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.name}>
              {profile?.name ?? 'Путник'}
            </ThemedText>
            {interestLabels.length > 0 && (
              <View style={styles.chips}>
                {interestLabels.map((label) => (
                  <ThemedView key={label} type="backgroundSelected" style={styles.chip}>
                    <ThemedText type="small">{label}</ThemedText>
                  </ThemedView>
                ))}
              </View>
            )}
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.levelRow}>
              <ThemedView type="primarySoft" style={styles.levelBadge}>
                <ThemedText type="smallBold" style={{ color: theme.primary }}>
                  Уровень {level}
                </ThemedText>
              </ThemedView>
              <ThemedText type="small" themeColor="textSecondary">
                {stats.xp} XP всего
              </ThemedText>
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
              {currentXp} / {neededXp} XP до уровня {level + 1}
            </ThemedText>
          </ThemedView>

          <View style={styles.statsGrid}>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText type="subtitle">{stats.completedAdventures}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                приключений завершено
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText type="subtitle">{stats.totalTasksDone}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                заданий выполнено
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText type="subtitle">{stats.totalPlacesVisited}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                мест отмечено
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText type="subtitle">{formatDistance(stats.totalDistanceMeters)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                пройдено всего
              </ThemedText>
            </ThemedView>
          </View>

          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Достижения · {unlockedSet.size} из {ACHIEVEMENTS.length}
          </ThemedText>
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = unlockedSet.has(achievement.id);
            return (
              <ThemedView
                key={achievement.id}
                type="backgroundElement"
                style={[styles.achievement, !unlocked && { opacity: 0.45 }]}>
                <View style={styles.achievementIcon}>
                  <ThemedText style={styles.achievementEmoji}>
                    {unlocked ? achievement.emoji : '🔒'}
                  </ThemedText>
                </View>
                <View style={styles.achievementBody}>
                  <ThemedText type="smallBold">{achievement.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {achievement.description}
                  </ThemedText>
                </View>
                {unlocked && (
                  <ThemedText type="smallBold" style={{ color: theme.success }}>
                    ✓
                  </ThemedText>
                )}
              </ThemedView>
            );
          })}
        </ScrollView>
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
  },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarEmoji: {
    fontSize: 44,
    lineHeight: 52,
  },
  name: {
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  chip: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBadge: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  progressTrack: {
    height: 10,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(128, 128, 128, 0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Spacing.five,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statCard: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.half,
  },
  sectionLabel: {
    marginTop: Spacing.one,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.four,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
  },
  achievementEmoji: {
    fontSize: 24,
    lineHeight: 30,
  },
  achievementBody: {
    flex: 1,
    gap: Spacing.half,
  },
});