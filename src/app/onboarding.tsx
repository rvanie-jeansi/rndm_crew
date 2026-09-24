import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { INTERESTS } from '@/data/interests';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/AppContext';

const AVATARS = ['🎲', '🗺️', '🦊', '🌙', '⚡', '🎯', '🍕', '🌊'];
const MIN_NAME_LENGTH = 2;

export default function OnboardingScreen() {
  const theme = useTheme();
  const { completeOnboarding } = useApp();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(AVATARS[0]);
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const nameReady = name.trim().length >= MIN_NAME_LENGTH;
  const valid = nameReady && interests.length > 0;

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    await completeOnboarding({ name, emoji, interests });
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            bounces={false}>
            <View style={styles.hero}>
              <ThemedText type="subtitle" style={styles.emoji}>
                🎲
              </ThemedText>
              <ThemedText type="subtitle" style={styles.title}>
                Знакомимся
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Скажи, как тебя зовут и что интересно, — приключения станут личными
              </ThemedText>
            </View>

            <ThemedView type="backgroundElement" style={styles.section}>
              <ThemedText type="smallBold">Как тебя зовут?</ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Имя"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                maxLength={24}
                autoCorrect={false}
              />
            </ThemedView>

            <ThemedView type="backgroundElement" style={styles.section}>
              <ThemedText type="smallBold">Твой аватар</ThemedText>
              <View style={styles.avatars}>
                {AVATARS.map((item) => {
                  const selected = item === emoji;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setEmoji(item)}
                      style={({ pressed }) => [
                        styles.avatar,
                        { backgroundColor: theme.background },
                        selected && { borderColor: theme.primary, borderWidth: 2 },
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText style={styles.avatarEmoji}>{item}</ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </ThemedView>

            <ThemedView type="backgroundElement" style={styles.section}>
              <ThemedText type="smallBold">Что тебе интересно?</ThemedText>
              <View style={styles.chips}>
                {INTERESTS.map((interest) => {
                  const selected = interests.includes(interest.id);
                  return (
                    <Pressable key={interest.id} onPress={() => toggleInterest(interest.id)}>
                      <ThemedView
                        type={selected ? 'primarySoft' : 'backgroundSelected'}
                        style={styles.chip}>
                        <ThemedText
                          type="small"
                          style={selected ? { color: theme.primary, fontWeight: 700 } : undefined}>
                          {interest.emoji} {interest.label}
                        </ThemedText>
                      </ThemedView>
                    </Pressable>
                  );
                })}
              </View>
              {!nameReady && interests.length === 0 && (
                <ThemedText type="small" themeColor="textSecondary">
                  Выбери хотя бы одно
                </ThemedText>
              )}
            </ThemedView>

            <Pressable
              onPress={submit}
              disabled={!valid || saving}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: theme.accent },
                (!valid || saving) && styles.ctaDisabled,
                pressed && styles.ctaPressed,
              ]}>
              <ThemedText style={styles.ctaLabel}>Поехали!</ThemedText>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
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
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  emoji: {
    fontSize: 56,
    lineHeight: 64,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  section: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.four,
  },
  input: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    fontSize: 16,
    fontWeight: 500,
  },
  avatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarEmoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  pressed: {
    opacity: 0.7,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.one + Spacing.half,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
    marginTop: Spacing.two,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 700,
  },
});