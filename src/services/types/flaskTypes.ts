
// Shared types for Flask API integration

// Event types
export interface FlaskEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  creator_id: number;
  participants_count?: number;
  category?: string;
  image_url?: string;
}

// Meetup types
export interface FlaskMeetup {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  points: number;
  createdBy: string;
  creatorAvatar?: string;
  lobbySize: number;
  attendees?: string[];
}

// User leveling system types
export interface UserProgress {
  user_id: number;
  username: string;
  current_level: number;
  current_xp: number;
  total_xp_earned: number;
  current_tier: string;
  active_weeks_streak: number;
  activity_bonus: string;
  next_level: number | null;
  xp_for_next_level: number;
  xp_needed_for_level: number;
  progress_percent: number;
  max_level_reached: boolean;
  current_semester: string;
  recent_activities: UserActivity[];
}

export interface UserActivity {
  timestamp: string;
  activity_type: string;
  xp_earned: number;
  description: string;
}

export interface Level {
  level_number: number;
  level_xp: number;
  total_xp: number;
  tier: string;
}

export interface LootBox {
  id: number;
  type_name: string;
  description: string;
  tier: string;
  icon_url: string;
  is_opened: boolean;
  awarded_at: string;
  opened_at: string | null;
  awarded_for: string;
}

// Rewards system types
export interface UserReward {
  id: number;
  reward_id: number;
  name: string;
  description: string;
  image_url: string;
  tier: string;
  category: string;
  theme: string;
  is_rare: boolean;
  is_equipped: boolean;
  acquired_at: string;
  loot_box_id: number;
}

export interface RewardType {
  id: number;
  name: string;
  description: string;
  image_url: string;
  tier: string;
  category: string;
  theme: string;
  is_rare: boolean;
}

export interface CategoryTheme {
  categories: string[];
  themes: string[];
}
