
import { 
  Badge, 
  Gift, 
  Star, 
  Award, 
  Medal, 
  Trophy, 
  Crown,
  Heart,
  Diamond,
  Rocket,
  Zap,
  Shield,
  Target,
  Flag,
  Sparkles,
  Flame,
  Lightbulb,
  Aperture,
  Compass
} from 'lucide-react';

export type StickerType = {
  level: number;
  icon: any;
  color: string;
  name: string;
  description?: string;
};

export const stickers: StickerType[] = [
  { level: 1, icon: Badge, color: 'text-blue-400', name: 'Beginner Badge', description: 'Your first step on the journey' },
  { level: 2, icon: Gift, color: 'text-green-400', name: 'Gift Badge', description: 'Awarded for your first contribution' },
  { level: 3, icon: Star, color: 'text-yellow-400', name: 'Star Badge', description: 'You\'re becoming a regular!' },
  { level: 4, icon: Award, color: 'text-purple-400', name: 'Award Badge', description: 'Recognition for your participation' },
  { level: 5, icon: Medal, color: 'text-pink-400', name: 'Medal Badge', description: 'You\'ve shown dedication' },
  { level: 6, icon: Trophy, color: 'text-amber-500', name: 'Trophy Badge', description: 'A significant achievement' },
  { level: 7, icon: Crown, color: 'text-yellow-500', name: 'Crown Badge', description: 'Leading by example' },
  { level: 8, icon: Heart, color: 'text-red-500', name: 'Heart Badge', description: 'Appreciated by the community' },
  { level: 9, icon: Diamond, color: 'text-blue-500', name: 'Diamond Badge', description: 'Rare and valuable contributor' },
  { level: 10, icon: Rocket, color: 'text-orange-500', name: 'Rocket Badge', description: 'Your progress is taking off!' },
  { level: 12, icon: Zap, color: 'text-yellow-400', name: 'Zap Badge', description: 'Bringing energy to the community' },
  { level: 14, icon: Shield, color: 'text-slate-600', name: 'Shield Badge', description: 'A defender of community values' },
  { level: 16, icon: Target, color: 'text-red-600', name: 'Target Badge', description: 'Focused on achieving goals' },
  { level: 18, icon: Flame, color: 'text-orange-600', name: 'Flame Badge', description: 'Your passion is burning bright' },
  { level: 20, icon: Sparkles, color: 'text-indigo-500', name: 'Sparkles Badge', description: 'You bring magic to the community' },
  { level: 21, icon: Lightbulb, color: 'text-yellow-600', name: 'Lightbulb Badge', description: 'Your bright ideas shine' },
  { level: 22, icon: Flag, color: 'text-green-600', name: 'Flag Badge', description: 'You\'ve claimed new territory' },
  { level: 23, icon: Aperture, color: 'text-purple-600', name: 'Aperture Badge', description: 'You have a unique perspective' },
  { level: 24, icon: Compass, color: 'text-blue-600', name: 'Compass Badge', description: 'Guiding others on their journey' },
  { level: 25, icon: Crown, color: 'text-yellow-600', name: 'Gold Crown Badge', description: 'The pinnacle of achievement' },
];
