import {
  Scissors,
  Wand2,
  Sparkles,
  Smile,
  Zap,
  Droplet,
  Hand,
  Flame,
  Eye,
  Palette,
  Mars,
  Venus,
  Rocket,
  Star,
} from 'lucide-react';

/**
 * Maps icon name strings to Lucide React icon components
 * Used by categories and audiences to display icons
 */
export const ICON_MAP = {
  // Categories
  'Scissors': Scissors,
  'Wand2': Wand2,
  'Sparkles': Sparkles,
  'Smile': Smile,
  'Zap': Zap,
  'Droplet': Droplet,
  'Hand': Hand,
  'Flame': Flame,
  'Eye': Eye,
  'Palette': Palette,
  // Audiences
  'Mars': Mars,
  'Venus': Venus,
  'Rocket': Rocket,
  'Star': Star,
};

/**
 * Get icon component for a given icon name
 * Returns null if icon not found
 */
export function getIcon(iconName) {
  return ICON_MAP[iconName] || null;
}

/**
 * Render icon component with given size and className
 */
export function renderIcon(iconName, size = 16, className = '') {
  const IconComponent = getIcon(iconName);
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
}
