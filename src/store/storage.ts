import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_VERSION = 'v1';

export const StorageKeys = {
  profile: `random.${STORAGE_VERSION}.profile`,
  adventures: `random.${STORAGE_VERSION}.adventures`,
  visitedPlaces: `random.${STORAGE_VERSION}.visitedPlaces`,
  stats: `random.${STORAGE_VERSION}.stats`,
} as const;

export async function loadJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ошибки записи не должны ронять UI: молча пропускаем.
  }
}