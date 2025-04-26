
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
  category?: string;
  attendees: Participant[];
}

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
  participants?: Participant[];
}

export interface Participant {
  attendance_status: string | null;
  event_id: number;
  id: number;
  joined_at: string;
  user_id: number;
  xp_earned: number | null;
}
