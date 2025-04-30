import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EventType, MeetupType, Tag, Friend, UserActions } from './types';

interface UserState {
  name: string;
  email: string;
  points: number;
  level: number;
  attendedMeetups: MeetupType[];
  friends: Friend[];
  tags: Tag[];
  selectedSticker: number | null;
  avatar: string | null;
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      name: "Temoc",
      email: "temoc@utdallas.edu",
      points: 22,
      level: 2,
      attendedMeetups: [],
      friends: [],
      tags: ["Technology", "Academic", "Gaming"],
      selectedSticker: null,
      avatar: null,
      addAttendedMeetup: (meetup: MeetupType) => {
        set((state) => ({
          ...state,
          attendedMeetups: [...state.attendedMeetups, meetup],
          points: state.points + 5,
          level: Math.floor((state.points + 5) / 10)
        }));
      },
      addFriend: (friend: Friend) => {
        set((state) => ({
          ...state,
          friends: [...state.friends, friend]
        }));
      },
      removeFriend: (friendId: string) => {
        set((state) => ({
          ...state,
          friends: state.friends.filter(friend => friend.id !== friendId)
        }));
      },
      updateProfile: (name: string, email: string) => {
        set((state) => ({
          ...state,
          name,
          email
        }));
      },
      updateTags: (tags: Tag[]) => {
        set((state) => ({
          ...state,
          tags
        }));
      },
      updateAvatar: (avatarUrl: string) => {
        set((state) => ({
          ...state,
          avatar: avatarUrl
        }));
      },
      setSelectedSticker: (stickerIndex: number | null) => {
        set((state) => ({
          ...state,
          selectedSticker: stickerIndex
        }));
      },
    }),
    {
      name: "user-storage"
    }
  )
);
