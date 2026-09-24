/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1D2E',
    background: '#FDFDFF',
    backgroundElement: '#F1F0F8',
    backgroundSelected: '#E5E3F1',
    textSecondary: '#6B6E80',
    primary: '#6C5CE7',
    primarySoft: '#ECEAFB',
    accent: '#FF6B4A',
    accentSoft: '#FFEAE3',
    success: '#22B07D',
    successSoft: '#E0F5EC',
    warning: '#F2A33C',
    warningSoft: '#FCF0DE',
    danger: '#E5484D',
  },
  dark: {
    text: '#F5F5FA',
    background: '#12121A',
    backgroundElement: '#20202E',
    backgroundSelected: '#2C2C40',
    textSecondary: '#9A9CB0',
    primary: '#8B7CFF',
    primarySoft: '#2D2947',
    accent: '#FF7A5C',
    accentSoft: '#40241D',
    success: '#3CCF9E',
    successSoft: '#17352A',
    warning: '#FFB84D',
    warningSoft: '#3A2E17',
    danger: '#F2555A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
