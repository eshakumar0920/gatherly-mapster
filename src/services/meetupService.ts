
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Meetup } from "@/types/meetup";
import { Friend, Tag, sampleFriends } from "./types";

// Enhanced mock meetup data with a more professional appearance
export const meetups: Meetup[] = [
  {
    id: "101",
    title: "Algorithm Study Group",
    description: "Weekly meetup for computer science students to practice algorithm problems together and prepare for technical interviews.",
    dateTime: "2025-05-10T14:00:00",
    location: "ECSS Building, Room 2.306",
    points: 5,
    createdBy: "CS Student Association",
    creatorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80",
    lobbySize: 15,
    category: "academic"
  },
  {
    id: "102",
    title: "Machine Learning Workshop",
    description: "Hands-on session exploring neural networks and practical applications of ML with TensorFlow and PyTorch.",
    dateTime: "2025-05-15T17:30:00",
    location: "ECSN Building, Room 2.126",
    points: 8,
    createdBy: "AI Research Club",
    creatorAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&h=200&q=80",
    lobbySize: 20,
    category: "tech"
  },
  {
    id: "103",
    title: "Chess Tournament",
    description: "Monthly chess competition open to players of all skill levels. Prizes for top performers!",
    dateTime: "2025-05-12T18:00:00",
    location: "Student Union, Galaxy Rooms",
    points: 4,
    createdBy: "UTD Chess Club",
    creatorAvatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=200&h=200&q=80", 
    lobbySize: 32,
    category: "competition"
  },
  {
    id: "104",
    title: "Ultimate Frisbee Game",
    description: "Casual ultimate frisbee game on the soccer fields. No experience required, just come have fun!",
    dateTime: "2025-05-08T16:00:00",
    location: "Soccer Fields, UTD",
    points: 3,
    createdBy: "Recreational Sports",
    creatorAvatar: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&w=200&h=200&q=80",
    lobbySize: 14,
    category: "sports"
  },
  {
    id: "105",
    title: "Student Government Meeting",
    description: "Open student government meeting discussing upcoming campus initiatives and funding opportunities.",
    dateTime: "2025-05-14T15:30:00",
    location: "Student Services Building, SSB 3.300",
    points: 6,
    createdBy: "Student Government",
    creatorAvatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&h=200&q=80",
    lobbySize: 25,
    category: "community"
  },
  {
    id: "106",
    title: "Anime & Manga Club",
    description: "Weekly gathering to watch anime, discuss manga, and share fan theories. Snacks provided!",
    dateTime: "2025-05-09T19:00:00",
    location: "McDermott Library, MC 2.524",
    points: 3,
    createdBy: "Anime Club",
    creatorAvatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=200&h=200&q=80",
    lobbySize: 20,
    category: "entertainment"
  },
  {
    id: "107",
    title: "Resume Workshop",
    description: "Get personalized feedback on your resume from career advisors and industry professionals.",
    dateTime: "2025-05-11T13:00:00",
    location: "JSOM Building, Room 1.118",
    points: 7,
    createdBy: "Career Center",
    creatorAvatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&h=200&q=80",
    lobbySize: 15,
    category: "career"
  },
  {
    id: "108",
    title: "Game Development Hackathon",
    description: "24-hour game development challenge. Form teams and create a playable game from scratch!",
    dateTime: "2025-05-16T09:00:00",
    location: "ECSW Building, Makerspace",
    points: 10,
    createdBy: "Game Dev Society",
    creatorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200&q=80",
    lobbySize: 30,
    category: "gaming"
  },
  {
    id: "109",
    title: "Photography Club Meetup",
    description: "Join fellow photography enthusiasts for a campus photo walk. All skill levels welcome!",
    dateTime: "2025-05-18T15:00:00",
    location: "Arts Building, Room A2.200",
    points: 4,
    createdBy: "Photography Club",
    creatorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
    lobbySize: 20,
    category: "arts"
  },
  {
    id: "110",
    title: "Book Club: Science Fiction",
    description: "This month we're discussing 'Project Hail Mary' by Andy Weir. New members welcome!",
    dateTime: "2025-05-20T18:30:00",
    location: "McDermott Library, MC 3.612",
    points: 3,
    createdBy: "Literary Society",
    creatorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=80",
    lobbySize: 15,
    category: "academic"
  },
  {
    id: "111",
    title: "Debate Club: Tech Ethics",
    description: "Join our monthly debate on ethical issues in modern technology. This month: AI regulation.",
    dateTime: "2025-05-22T17:00:00",
    location: "Green Hall, Room 2.302",
    points: 6,
    createdBy: "Debate Society",
    creatorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80",
    lobbySize: 24,
    category: "academic"
  },
  {
    id: "112",
    title: "Language Exchange: Spanish",
    description: "Practice your Spanish conversation skills with fellow students in a casual, supportive environment.",
    dateTime: "2025-05-24T14:00:00",
    location: "Student Union, Room 2.602",
    points: 4,
    createdBy: "Language Club",
    creatorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
    lobbySize: 18,
    category: "cultural"
  }
];

// UserStore with persist middleware to maintain state across page refreshes
interface UserStore {
  points: number;
  level: number;
  joinedLobbies: string[];
  attendedMeetups: string[];
  name: string;
  email: string;
  friends: Friend[];
  tags: Tag[];
  selectedSticker: number | null;
  profileImage: string | null;
  attendMeetup: (meetupId: string, pointsEarned: number) => void;
  joinMeetupLobby: (meetupId: string) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  updateTags: (tags: Tag[]) => void;
  updateProfile: (name: string, email: string) => void;
  setSelectedSticker: (sticker: number | null) => void;
  updateProfileImage: (imageUrl: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      points: 0,
      level: 1,
      joinedLobbies: [],
      attendedMeetups: [],
      name: "Student User",
      email: "student@university.edu",
      friends: sampleFriends,
      tags: ["Technology", "Academic"],
      selectedSticker: null,
      profileImage: null,
      attendMeetup: (meetupId: string, pointsEarned: number) =>
        set((state) => ({
          points: state.points + pointsEarned,
          attendedMeetups: [...state.attendedMeetups, meetupId],
          // Level up when points exceed current level * 10
          level: Math.floor(state.points / 10) + 1 > state.level 
            ? Math.floor(state.points / 10) + 1 
            : state.level
        })),
      joinMeetupLobby: (meetupId: string) =>
        set((state) => ({
          joinedLobbies: [...state.joinedLobbies, meetupId],
        })),
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
      updateProfileImage: (imageUrl: string) =>
        set(() => ({
          profileImage: imageUrl
        })),
    }),
    {
      name: "user-storage",
    }
  )
);
