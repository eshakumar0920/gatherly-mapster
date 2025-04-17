
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

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
  attendees?: string[]; // Array of user IDs who have joined
}

export type Tag = 'Gaming' | 'Sports' | 'Academic' | 'Arts' | 'Music' | 'Technology' | 'Food' | 'Outdoors' | 
                  'Reading' | 'Photography' | 'Fitness' | 'Movies' | 'Science' | 'Cooking' | 'Fashion' | 'Design' | 'Travel';

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  tags?: Tag[];
}

// Mock data for meetups
export const meetups: Meetup[] = [
  {
    id: "1",
    title: "Hey guys I am looking to play chess @2pm...",
    description: "Looking for chess partners at the Student Union. All skill levels welcome!",
    dateTime: "Today @2pm",
    location: "Student Union",
    points: 3,
    createdBy: "Alex Chen",
    creatorAvatar: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=200&h=200&auto=format&fit=crop",
    lobbySize: 4,
    attendees: ["Jane Cooper"]
  },
  {
    id: "2",
    title: "Pickleball partner needed Monday @5pm...",
    description: "Need a partner for pickleball on Monday afternoon. Intermediate level preferred.",
    dateTime: "Monday @5pm",
    location: "Recreation Center East Courts",
    points: 3,
    createdBy: "Jordan Smith",
    creatorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&auto=format&fit=crop",
    lobbySize: 2,
    attendees: []
  },
  {
    id: "3",
    title: "Looking for a reading buddy in the library Tue...",
    description: "Let's read together at the library and discuss books. Bringing coffee and snacks!",
    dateTime: "Tuesday @3pm",
    location: "McDermott Library 3rd Floor",
    points: 3,
    createdBy: "Sofia Martinez",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop",
    lobbySize: 3,
    attendees: ["Wade Warren", "Esther Howard"]
  },
  {
    id: "4",
    title: "Swimming group on Fridays pull up!",
    description: "Weekly swimming session for exercise and fun. All levels welcome.",
    dateTime: "Friday @6pm",
    location: "Activity Center Pool",
    points: 3,
    createdBy: "Michael Johnson",
    creatorAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&auto=format&fit=crop",
    lobbySize: 8,
    attendees: ["Cameron Williamson"]
  },
  {
    id: "5",
    title: "Looking for biology study sessions",
    description: "Group study for BIOL 2311. Bring your notes and questions.",
    dateTime: "Wednesday @4pm",
    location: "Science Building Room 2.410",
    points: 3,
    createdBy: "Emily Parker",
    creatorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&auto=format&fit=crop",
    lobbySize: 6,
    attendees: []
  },
  {
    id: "6",
    title: "Sand Volleyball @ 7pm",
    description: "Casual sand volleyball game. Teams will be formed on site.",
    dateTime: "Thursday @7pm",
    location: "Phase 8 Sand Courts",
    points: 6,
    createdBy: "David Thompson",
    creatorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&auto=format&fit=crop",
    lobbySize: 12,
    attendees: ["Brooklyn Simmons", "Robert Fox"]
  },
  {
    id: "7",
    title: "Ping-pong tournament Fri",
    description: "Student-organized ping-pong tournament with prizes for winners!",
    dateTime: "Friday @5pm",
    location: "Residence Hall West Common Area",
    points: 8,
    createdBy: "Sarah Wilson",
    creatorAvatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&auto=format&fit=crop",
    lobbySize: 16,
    attendees: []
  },
  {
    id: "8",
    title: "Valorant Comet LANding 3pm",
    description: "LAN party for Valorant players. Bring your own laptop.",
    dateTime: "Saturday @3pm",
    location: "ECSW 1.355",
    points: 1,
    createdBy: "Ryan Garcia",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&auto=format&fit=crop",
    lobbySize: 10,
    attendees: []
  },
  {
    id: "9",
    title: "Calc 1 study buddy rn @ library",
    description: "Need help with Calculus 1? Join me at the library for a study session.",
    dateTime: "Today @7pm",
    location: "McDermott Library 2nd Floor",
    points: 3,
    createdBy: "Olivia Kim",
    creatorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&auto=format&fit=crop",
    lobbySize: 5,
    attendees: ["Jenny Wilson", "Robert Fox", "Jane Cooper", "Wade Warren", "Esther Howard"]
  }
];

// Get all meetups
export const getMeetups = () => {
  return meetups;
};

// User store for points, level, friends and tags
interface UserState {
  points: number;
  level: number;
  name: string;
  email: string;
  joinedLobbies: string[]; // Meetups the user has joined the lobby for
  attendedMeetups: string[]; // Meetups the user has checked into with QR code
  friends: Friend[];
  tags: Tag[];
  selectedSticker: number | null;
  addPoints: (points: number) => void;
  joinMeetupLobby: (meetupId: string) => void;
  attendMeetup: (meetupId: string, points: number) => void;
  getLevel: () => number;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  updateTags: (tags: Tag[]) => void;
  updateProfile: (name: string, email: string) => void;
  setSelectedSticker: (stickerIndex: number | null) => void;
}

// Sample friends data
const sampleFriends: Friend[] = [
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

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      points: 0,
      level: 1,
      name: "UTD Student",
      email: "student@utdallas.edu",
      joinedLobbies: [],
      attendedMeetups: [],
      friends: sampleFriends,
      tags: ['Academic', 'Technology'],
      selectedSticker: null,
      addPoints: (points: number) => 
        set(state => {
          const newPoints = state.points + points;
          const newLevel = Math.floor(newPoints / 10) + 1;
          
          return { 
            points: newPoints,
            level: newLevel
          };
        }),
      joinMeetupLobby: (meetupId: string) =>
        set(state => {
          if (state.joinedLobbies.includes(meetupId)) {
            return state; // Already in lobby
          }
          
          // Check if the meetup is full
          const meetup = meetups.find(m => m.id === meetupId);
          if (meetup && meetup.attendees && meetup.attendees.length >= meetup.lobbySize) {
            return state; // Meetup is full
          }
          
          // Add user to attendees (in a real app, we would use the user's ID)
          if (meetup && meetup.attendees) {
            meetup.attendees.push("currentUser");
          }
          
          return {
            joinedLobbies: [...state.joinedLobbies, meetupId]
          };
        }),
      attendMeetup: (meetupId: string, points: number) => 
        set(state => {
          if (state.attendedMeetups.includes(meetupId)) {
            return state; // Already checked in
          }
          
          const newPoints = state.points + points;
          const newLevel = Math.floor(newPoints / 10) + 1;
          
          return {
            points: newPoints,
            level: newLevel,
            attendedMeetups: [...state.attendedMeetups, meetupId]
          };
        }),
      getLevel: () => {
        const state = get();
        return Math.floor(state.points / 10) + 1;
      },
      addFriend: (friend: Friend) =>
        set(state => ({
          friends: [...state.friends, friend]
        })),
      removeFriend: (friendId: string) =>
        set(state => ({
          friends: state.friends.filter(friend => friend.id !== friendId)
        })),
      updateTags: (tags: Tag[]) =>
        set(state => ({
          tags: tags
        })),
      updateProfile: (name: string, email: string) =>
        set(state => ({
          name,
          email
        })),
      setSelectedSticker: (stickerIndex: number | null) =>
        set(state => ({
          selectedSticker: stickerIndex
        }))
    }),
    {
      name: 'user-points-storage'
    }
  )
);

export const getMeetupDetails = async (meetupId: string) => {
  try {
    // Convert string ID to integer for database query
    const eventId = parseInt(meetupId, 10);
    
    // Check if the conversion resulted in a valid number
    if (isNaN(eventId)) {
      console.error('Invalid meetup ID format:', meetupId);
      return meetups.find(m => m.id === meetupId);
    }
    
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        events_box(box_data),
        event_metadata(meta_key, meta_value)
      `)
      .eq('event_id', eventId)
      .single();

    if (eventError) {
      console.error('Error fetching meetup details:', eventError);
      // Fall back to mock data if fetch fails
      return meetups.find(m => m.id === meetupId);
    }

    // Map Supabase data to Meetup type if needed
    return {
      id: eventData.event_id.toString(),
      title: eventData.title,
      description: eventData.description || '',
      dateTime: eventData.event_time,
      location: eventData.location,
      points: 3, // Default points, adjust as needed
      createdBy: 'Unknown', // Add logic to get creator name if possible
      lobbySize: 5, // Default lobby size, adjust as needed
      creatorAvatar: null,
      attendees: []
    } as Meetup;
  } catch (error) {
    console.error('Unexpected error in getMeetupDetails:', error);
    return meetups.find(m => m.id === meetupId);
  }
};
