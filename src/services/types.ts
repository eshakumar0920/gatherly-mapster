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

export interface UserActions {
  addAttendedMeetup: (meetup: MeetupType) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  updateProfile: (name: string, email: string) => void;
  updateTags: (tags: Tag[]) => void;
  updateAvatar: (avatarUrl: string) => void;
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
