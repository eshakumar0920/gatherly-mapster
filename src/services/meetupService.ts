
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MeetupType, Tag, Friend, UserActions } from './types';

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
  // Add missing state properties
  userId: string | null;
  joinedLobbies: string[];
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
      // Initialize new state properties
      userId: null,
      joinedLobbies: [],
      addAttendedMeetup: (meetup: MeetupType | string) => {
        set((state) => {
          // Handle both MeetupType objects and string IDs
          if (typeof meetup === 'string') {
            const meetupObject: MeetupType = {
              id: meetup,
              title: "Attended Meetup",
              description: "Attended via check-in",
              dateTime: new Date().toISOString(),
              location: "UTD",
              points: 5, // Default points
              createdBy: "System",
              lobbySize: 0
            };
            return {
              ...state,
              attendedMeetups: [...state.attendedMeetups, meetupObject],
              points: state.points + 5,
              level: Math.floor((state.points + 5) / 10)
            };
          } else {
            return {
              ...state,
              attendedMeetups: [...state.attendedMeetups, meetup],
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
      // Add new actions
      joinMeetupLobby: (meetupId: string) => {
        set((state) => ({
          ...state,
          joinedLobbies: [...state.joinedLobbies, meetupId]
        }));
      },
      attendMeetup: (meetupId: string, points: number) => {
        set((state) => {
          const meetup: MeetupType = {
            id: meetupId,
            title: "Attended Meetup",
            description: "Attended via check-in",
            dateTime: new Date().toISOString(),
            location: "UTD",
            points: points,
            createdBy: "System",
            lobbySize: 0
          };
          
          return {
            ...state,
            attendedMeetups: [...state.attendedMeetups, meetup],
            points: state.points + points,
            level: Math.floor((state.points + points) / 10)
          };
        });
      },
      setUserId: (userId: string) => {
        set((state) => ({
          ...state,
          userId
        }));
      },
    }),
    {
      name: "user-storage"
    }
  )
);
