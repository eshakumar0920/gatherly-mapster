
// Define meetup interface in a separate file to avoid deep type instantiation
export interface Meetup {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  points: number;
  createdBy: string;
  creatorAvatar?: string;
  lobbySize: number;
  category?: string; // Added category property as optional
  attendees?: string[];
  latitude?: number;  // Added latitude property as optional
  longitude?: number; // Added longitude property as optional
}

// Event data as it comes from Supabase
export interface EventRow {
  id: number;
  title: string;
  description: string | null;
  location: string;
  event_date: string;
  created_at: string;
  creator_id: number;
  creator_name: string | null;  // Added to match the new database column
  semester: string | null;
  organizer_xp_reward: number | null;
  xp_reward: number | null;
  category?: string;
  lobby_size: number | null;  // Added to match the new database column
  latitude?: number;  // Added latitude property as optional
  longitude?: number; // Added longitude property as optional
}
