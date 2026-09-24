export type Interest = {
  id: string;
  emoji: string;
  label: string;
  tags: string[];
};

export const INTERESTS: Interest[] = [
  { id: 'walk', emoji: '🚶', label: 'Прогулки', tags: ['walk'] },
  { id: 'photo', emoji: '📸', label: 'Фото', tags: ['photo'] },
  { id: 'cafe', emoji: '☕', label: 'Кафе', tags: ['cafe'] },
  { id: 'nature', emoji: '🌳', label: 'Природа', tags: ['nature'] },
  { id: 'food', emoji: '🍜', label: 'Еда', tags: ['food'] },
  { id: 'architecture', emoji: '🏛️', label: 'Архитектура', tags: ['architecture'] },
  { id: 'animals', emoji: '🐾', label: 'Животные', tags: ['animals'] },
  { id: 'adventure', emoji: '🎲', label: 'Авантюры', tags: ['dice', 'adventure'] },
];