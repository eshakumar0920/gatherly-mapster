import { Meetup } from "@/types/meetup";
import { format } from "date-fns";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock data for meetups updated to 2025
export const meetups: Meetup[] = [
  {
    id: "1",
    title: "Tech Innovators Meetup",
    description: "Connect with fellow tech enthusiasts and discuss the latest innovations!",
    dateTime: format(new Date(2025, 1, 15, 18, 0), "yyyy-MM-dd HH:mm:ss"),
    location: "ECSW Building, Room 2.412",
    points: 5,
    createdBy: "Alex Johnson",
    creatorAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
    lobbySize: 20,
    category: "Technology",
    attendees: []
  },
  {
    id: "2",
    title: "Art & Design Networking",
    description: "A casual meetup for artists, designers, and creative minds to share ideas and inspiration.",
    dateTime: format(new Date(2025, 2, 22, 19, 30), "yyyy-MM-dd HH:mm:ss"),
    location: "SP/N Gallery Lounge",
    points: 3,
    createdBy: "Emma Rodriguez",
    creatorAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
    lobbySize: 15,
    category: "Art",
    attendees: []
  },
  {
    id: "3",
    title: "Entrepreneurship Workshop",
    description: "Learn from successful student entrepreneurs and network with like-minded peers.",
    dateTime: format(new Date(2025, 3, 10, 16, 0), "yyyy-MM-dd HH:mm:ss"),
    location: "Blackstone LaunchPad",
    points: 7,
    createdBy: "Michael Chen",
    creatorAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
    lobbySize: 25,
    category: "Business",
    attendees: []
  },
  {
    id: "4",
    title: "Music Jam Session",
    description: "Open mic and jam session for musicians of all skill levels.",
    dateTime: format(new Date(2025, 4, 5, 20, 0), "yyyy-MM-dd HH:mm:ss"),
    location: "Student Union Music Room",
    points: 4,
    createdBy: "Sophia Williams",
    creatorAvatar: "https://randomuser.me/api/portraits/women/4.jpg",
    lobbySize: 12,
    category: "Music",
    attendees: []
  },
  {
    id: "5",
    title: "Wellness and Mindfulness",
    description: "Guided meditation and stress-relief techniques for students.",
    dateTime: format(new Date(2025, 5, 18, 17, 30), "yyyy-MM-dd HH:mm:ss"),
    location: "Recreation Center Yoga Studio",
    points: 3,
    createdBy: "Daniel Kim",
    creatorAvatar: "https://randomuser.me/api/portraits/men/5.jpg",
    lobbySize: 15,
    category: "Wellness",
    attendees: []
  }
];

interface UserState {
  joinedLobbies: string[] | null;
  attendedMeetups: string[] | null;
  points: number;
  joinMeetupLobby: (meetupId: string) => void;
  attendMeetup: (meetupId: string, points: number) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      joinedLobbies: [],
      attendedMeetups: [],
      points: 0,
      joinMeetupLobby: (meetupId: string) =>
        set((state) => ({
          joinedLobbies: [...(state.joinedLobbies || []), meetupId],
        })),
      attendMeetup: (meetupId: string, points: number) =>
        set((state) => ({
          attendedMeetups: [...(state.attendedMeetups || []), meetupId],
          points: state.points + points,
        })),
      reset: () => set({ joinedLobbies: [], attendedMeetups: [], points: 0 }),
    }),
    {
      name: 'user-storage',
    }
  )
);

export const getMeetups = () => {
  return meetups;
};
