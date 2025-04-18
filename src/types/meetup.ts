
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
  category: string;
  attendees: string[];
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
  semester: string | null;
  organizer_xp_reward: number | null;
  xp_reward: number | null;
  category?: string;
}
