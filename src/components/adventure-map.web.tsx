import { StyleSheet, View } from 'react-native';

import { type AdventureMapProps } from '@/components/adventure-map.props';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function AdventureMap(_props: AdventureMapProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText style={styles.emoji}>🗺️</ThemedText>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.text}>
          Карта доступна в мобильном приложении
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    gap: Spacing.two,
    maxWidth: 320,
  },
  emoji: {
    fontSize: 48,
    lineHeight: 56,
  },
  text: {
    textAlign: 'center',
  },
});