import { Text } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

/**
 * Common icons for hobbies.
 * Keys are names stored in DB, values are component names.
 */
export const HOBBY_ICONS = [
  { name: 'Music', icon: 'Music' },
  { name: 'Reading', icon: 'Book' },
  { name: 'Running', icon: 'Footprints' },
  { name: 'Art', icon: 'Palette' },
  { name: 'Cooking', icon: 'Utensils' },
  { name: 'Piano', icon: 'Keyboard' },
  { name: 'Photography', icon: 'Camera' },
  { name: 'Yoga', icon: 'Activity' },
  { name: 'Swimming', icon: 'Waves' },
  { name: 'Cycling', icon: 'Bike' },
  { name: 'Writing', icon: 'PenTool' },
  { name: 'Games', icon: 'Gamepad2' },
  { name: 'Coding', icon: 'Code' },
  { name: 'Language', icon: 'Languages' },
  { name: 'Learning', icon: 'Brain' },
  { name: 'Meditation', icon: 'Heart' },
  { name: 'Singing', icon: 'Mic' },
  { name: 'Sports', icon: 'Dumbbell' },
  { name: 'Coffee', icon: 'Coffee' },
  { name: 'Star', icon: 'Star' },
];

/**
 * IconRenderer
 * Handles both emojis and Lucide icon names.
 */
export function IconRenderer({ iconName, size = 20, color = '#111827', style }) {
  if (!iconName) return null;

  // Check if it's an emoji (simplified check: non-alphanumeric or starts with emoji range)
  const isEmoji = /\p{Emoji}/u.test(iconName) && !/^[a-zA-Z0-9]+$/.test(iconName);

  if (isEmoji) {
    return <Text style={[{ fontSize: size }, style]}>{iconName}</Text>;
  }

  // Find the component from lucide-react-native
  const IconComponent = LucideIcons[iconName];

  if (IconComponent) {
    return <IconComponent size={size} color={color} style={style} />;
  }

  // Fallback to text if not found
  return <Text style={[{ fontSize: size }, style]}>{iconName}</Text>;
}
