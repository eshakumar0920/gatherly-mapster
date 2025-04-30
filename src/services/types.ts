
// Common types used across the application
export type Tag = 
  | "Technology" 
  | "Arts" 
  | "Music" 
  | "Sports" 
  | "Food" 
  | "Outdoors" 
  | "Gaming" 
  | "Reading" 
  | "Photography" 
  | "Fitness" 
  | "Movies"
  | "Science" 
  | "Cooking" 
  | "Fashion" 
  | "Design" 
  | "Travel" 
  | "Academic";

// Event point classification based on lobby size
export type PointClassification = 'small' | 'medium' | 'large' | 'mega';

export interface PointClassificationDetail {
  type: PointClassification;
  minSize: number;
  maxSize: number;
  basePoints: number;
  color: string;
  label: string;
}

export const pointClassifications: PointClassificationDetail[] = [
  { type: 'small', minSize: 1, maxSize: 5, basePoints: 10, color: 'bg-green-100 text-green-800', label: 'Small Group' },
  { type: 'medium', minSize: 6, maxSize: 15, basePoints: 20, color: 'bg-blue-100 text-blue-800', label: 'Medium Group' },
  { type: 'large', minSize: 16, maxSize: 30, basePoints: 30, color: 'bg-purple-100 text-purple-800', label: 'Large Group' },
  { type: 'mega', minSize: 31, maxSize: 100, basePoints: 50, color: 'bg-yellow-100 text-yellow-800', label: 'Mega Event' },
];

// Add missing MeetupType definition
export interface MeetupType {
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
}

// Add EventType for compatibility
export interface EventType {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category?: string;
}

export interface UserActions {
  // Modified to accept either a MeetupType object or a string meetupId
  addAttendedMeetup: (meetup: MeetupType | string) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  updateProfile: (name: string, email: string) => void;
  updateTags: (tags: Tag[]) => void;
  updateAvatar: (avatarUrl: string) => void;
  // Add missing actions
  setSelectedSticker: (stickerIndex: number | null) => void;
  joinMeetupLobby: (meetupId: string) => void;
  attendMeetup: (meetupId: string, points: number) => void;
  setUserId: (userId: string) => void;
  syncProfile: () => Promise<void>;
}

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  tags?: Tag[];
}

// Sample friends data
export const sampleFriends: Friend[] = [
  {
    id: "friend1",
    name: "Taylor Swift",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&auto=format&fit=crop",
    tags: ['Music', 'Arts']
  },
  {
    id: "friend2",
    name: "Raj Patel",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&auto=format&fit=crop",
    tags: ['Technology', 'Gaming']
  }
];
