import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdventureMap } from '@/components/adventure-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocation } from '@/hooks/use-location';
import { useApp } from '@/store/AppContext';
import { genId } from '@/utils/random';

export default function MapScreen() {
  const theme = useTheme();
  const { adventures, visitedPlaces, addVisitedPlace } = useApp();
  const { state, error, current, start } = useLocation();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void start();
  }, [start]);

  const adventure = adventures.find((item) => item.status === 'active') ?? adventures[0];
  const targets =
    adventure?.tasks
      .filter((task) => task.location)
      .map((task) => ({
        id: task.id,
        lat: task.location!.lat,
        lng: task.location!.lng,
        label: task.title,
      })) ?? [];
  const route = targets.map(({ lat, lng }) => ({ lat, lng }));

  const markHere = async () => {
    if (!current || saving) return;
    setSaving(true);
    await addVisitedPlace({
      id: genId('place_'),
      lat: current.lat,
      lng: current.lng,
      name: 'Я был(а) здесь',
      visitedAt: new Date().toISOString(),
      adventureId: adventure?.id,
    });
    setSaving(false);
  };

  const locating = state === 'locating';

  return (
    <ThemedView style={styles.container}>
      <AdventureMap
        targets={targets}
        route={route}
        visited={visitedPlaces}
        user={current}
        accent={theme.accent}
      />

      <SafeAreaView
        pointerEvents="box-none"
        edges={['bottom']}
        style={styles.overlay}>
        <View style={styles.explanation}>
          {state === 'denied' ? (
            <ThemedView type="backgroundElement" style={styles.infoCard}>
              <ThemedText type="smallBold">Геопозиция выключена</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Разреши доступ к местоположению, чтобы отмечать места и мерить дистанцию.
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView type="backgroundElement" style={styles.infoCard}>
              <ThemedText type="smallBold">
                {adventure ? `Цели: ${targets.length}` : 'Нет активного приключения'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Посещено мест: {visitedPlaces.length}
                {locating && !current ? ' · ждём твою позицию…' : ''}
              </ThemedText>
              {error && (
                <ThemedText type="small" themeColor="danger">
                  {error}
                </ThemedText>
              )}
            </ThemedView>
          )}
        </View>

        <Pressable
          onPress={markHere}
          disabled={!current || saving}
          style={({ pressed }) => [
            styles.hereButton,
            { backgroundColor: theme.accent },
            (!current || saving) && styles.disabled,
            pressed && styles.pressed,
          ]}>
          <ThemedText style={styles.hereLabel}>Я здесь</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
  },
  explanation: {
    alignItems: 'stretch',
  },
  infoCard: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.one,
  },
  hereButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
  },
  hereLabel: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});