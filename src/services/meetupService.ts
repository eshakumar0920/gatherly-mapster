import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MeetupType, Tag, Friend, UserActions } from './types';

interface UserState {
  name: string;
  email: string;
  points: number;
  level: number;
  attendedMeetups: string[]; // Changed from MeetupType[] to string[]
  friends: Friend[];
  tags: Tag[];
  selectedSticker: number | null;
  userId: string | null;
  joinedLobbies: string[];
  avatar: string | null;
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      name: "Temoc",
      email: "temoc@utdallas.edu",
      points: 22,
      level: 2,
      attendedMeetups: [],
      friends: [],
      tags: ["Technology", "Academic", "Gaming"],
      selectedSticker: null,
      avatar: null,
      userId: null,
      joinedLobbies: [],
      addAttendedMeetup: (meetup: MeetupType | string) => {
        set((state) => {
          // Handle both MeetupType objects and string IDs
          if (typeof meetup === 'string') {
            // Just add the ID to the attendedMeetups array
            return {
              ...state,
              attendedMeetups: [...state.attendedMeetups, meetup],
              points: state.points + 5,
              level: Math.floor((state.points + 5) / 10)
            };
          } else {
            return {
              ...state,
              attendedMeetups: [...state.attendedMeetups, meetup.id],
              points: state.points + (meetup.points || 5),
              level: Math.floor((state.points + (meetup.points || 5)) / 10)
            };
          }
        });
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
      joinMeetupLobby: (meetupId: string) => {
        set((state) => ({
          ...state,
          joinedLobbies: [...state.joinedLobbies, meetupId]
        }));
      },
      attendMeetup: (meetupId: string, points: number) => {
        set((state) => {
          // Just store the ID in the attendedMeetups array
          return {
            ...state,
            attendedMeetups: [...state.attendedMeetups, meetupId],
            points: state.points + points,
            level: Math.floor((state.points + points) / 10)
          };
        });
      },
      setUserId: (id) => {
        console.log("Setting userId in store to:", id);
        set({ userId: id });
      },
      // Alias for attendMeetup to support existing code
      checkInToMeetup: (meetupId: string, points: number) => {
        set((state) => {
          return {
            ...state,
            attendedMeetups: [...state.attendedMeetups, meetupId],
            points: state.points + points,
            level: Math.floor((state.points + points) / 10)
          };
        });
      }
    }),
    {
      name: "user-storage"
    }
  )
);
