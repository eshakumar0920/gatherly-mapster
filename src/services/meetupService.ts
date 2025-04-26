import { Meetup } from "@/types/meetup";
import { format } from "date-fns";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Friend, Tag, sampleFriends } from "./types";

// Create valid dates for the mock meetups
const createValidDate = (year: number, month: number, day: number, hour: number, minute: number) => {
  try {
    const date = new Date(year, month - 1, day, hour, minute);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return format(date, "yyyy-MM-dd HH:mm:ss");
  } catch (error) {
    console.error("Error creating date:", error);
    return "Invalid date";
  }
};

// Student information with realistic avatars and names
const students = [
  {
    name: "Olivia Martinez",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    name: "Ethan Chen",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    name: "Sophia Patel",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg"
  },
  {
    name: "Lucas Williams",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg"
  },
  {
    name: "Ava Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg"
  }
];

// Mock data for meetups updated with student creators
export const meetups: Meetup[] = [
  {
    id: "1",
    title: "Tech Innovators Meetup",
    description: "Connect with fellow tech enthusiasts and discuss the latest innovations!",
    dateTime: createValidDate(2025, 2, 15, 18, 0),
    location: "ECSW Building, Room 2.412",
    points: 5,
    createdBy: students[0].name,
    creatorAvatar: students[0].avatar,
    lobbySize: 20,
    category: "Technology",
    attendees: []
  },
  {
    id: "2",
    title: "Art & Design Networking",
    description: "A casual meetup for artists, designers, and creative minds to share ideas and inspiration.",
    dateTime: createValidDate(2025, 3, 22, 19, 30),
    location: "SP/N Gallery Lounge",
    points: 3,
    createdBy: students[1].name,
    creatorAvatar: students[1].avatar,
    lobbySize: 15,
    category: "Art",
    attendees: []
  },
  {
    id: "3",
    title: "Entrepreneurship Workshop",
    description: "Learn from successful student entrepreneurs and network with like-minded peers.",
    dateTime: createValidDate(2025, 4, 10, 16, 0),
    location: "Blackstone LaunchPad",
    points: 7,
    createdBy: students[2].name,
    creatorAvatar: students[2].avatar,
    lobbySize: 25,
    category: "Business",
    attendees: []
  },
  {
    id: "4",
    title: "Music Jam Session",
    description: "Open mic and jam session for musicians of all skill levels.",
    dateTime: createValidDate(2025, 5, 5, 20, 0),
    location: "Student Union Music Room",
    points: 4,
    createdBy: students[3].name,
    creatorAvatar: students[3].avatar,
    lobbySize: 12,
    category: "Music",
    attendees: []
  },
  {
    id: "5",
    title: "Wellness and Mindfulness",
    description: "Guided meditation and stress-relief techniques for students.",
    dateTime: createValidDate(2025, 6, 18, 17, 30),
    location: "Recreation Center Yoga Studio",
    points: 3,
    createdBy: students[4].name,
    creatorAvatar: students[4].avatar,
    lobbySize: 15,
    category: "Wellness",
    attendees: []
  }
];

interface UserState {
  joinedLobbies: string[] | null;
  attendedMeetups: string[] | null;
  points: number;
  level: number;
  name: string;
  email: string;
  friends: Friend[];
  tags: Tag[];
  selectedSticker: number | null;
  joinMeetupLobby: (meetupId: string) => void;
  attendMeetup: (meetupId: string, points: number) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  updateTags: (tags: Tag[]) => void;
  updateProfile: (name: string, email: string) => void;
  setSelectedSticker: (sticker: number | null) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      joinedLobbies: [],
      attendedMeetups: [],
      points: 0,
      level: 1,
      name: "John Doe",
      email: "johndoe@example.com",
      friends: sampleFriends,
      tags: ["Technology", "Gaming"],
      selectedSticker: null,
      joinMeetupLobby: (meetupId: string) =>
        set((state) => ({
          joinedLobbies: [...(state.joinedLobbies || []), meetupId],
        })),
      attendMeetup: (meetupId: string, points: number) =>
        set((state) => {
          const newPoints = state.points + points;
          const newLevel = Math.floor(newPoints / 10) + 1;
          
          return {
            attendedMeetups: [...(state.attendedMeetups || []), meetupId],
            points: newPoints,
            level: newLevel,
          };
        }),
      addFriend: (friend: Friend) =>
        set((state) => ({
          friends: [...state.friends, friend]
        })),
      removeFriend: (friendId: string) =>
        set((state) => ({
          friends: state.friends.filter(friend => friend.id !== friendId)
        })),
      updateTags: (tags: Tag[]) =>
        set(() => ({
          tags
        })),
      updateProfile: (name: string, email: string) =>
        set(() => ({
          name,
          email
        })),
      setSelectedSticker: (sticker: number | null) =>
        set(() => ({
          selectedSticker: sticker
        })),
      reset: () => set({ 
        joinedLobbies: [], 
        attendedMeetups: [], 
        points: 0,
        level: 1,
        name: "John Doe",
        email: "johndoe@example.com",
        friends: [],
        tags: [],
        selectedSticker: null
      }),
    }),
    {
      name: 'user-storage',
    }
  )
);

export const getMeetups = () => {
  return meetups;
};
