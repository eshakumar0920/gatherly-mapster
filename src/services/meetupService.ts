
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MeetupType, Tag, Friend, UserActions } from './types';
import { supabase } from "@/integrations/supabase/client";

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
  userId: string | null;
  joinedLobbies: string[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
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
      tags: ["Technology", "Academic", "Gaming"] as Tag[],
      selectedSticker: null,
      avatar: null,
      userId: null,
      joinedLobbies: [],
      isLoading: false,
      isSyncing: false,
      lastSyncTime: null,
      
      addAttendedMeetup: (meetup: MeetupType | string) => {
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
          set(state => ({
            ...state,
            attendedMeetups: [...state.attendedMeetups, meetupObject],
            points: state.points + 5,
            level: Math.floor((state.points + 5) / 10)
          }));
        } else {
          set(state => ({
            ...state,
            attendedMeetups: [...state.attendedMeetups, meetup],
            points: state.points + (meetup.points || 5),
            level: Math.floor((state.points + (meetup.points || 5)) / 10)
          }));
        }
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
      updateProfile: async (name: string, email: string) => {
        const { userId } = get();
        set(state => ({ ...state, name, email }));

        if (userId) {
          set(state => ({ ...state, isSyncing: true }));
          try {
            await supabase
              .from('profiles')
              .update({ name, email })
              .eq('id', userId);

            set(state => ({ 
              ...state, 
              isSyncing: false, 
              lastSyncTime: Date.now() 
            }));
          } catch (error) {
            console.error('Error updating profile:', error);
            set(state => ({ ...state, isSyncing: false }));
          }
        }
      },
      updateTags: async (tags: Tag[]) => {
        const { userId } = get();
        set(state => ({ ...state, tags }));

        if (userId) {
          set(state => ({ ...state, isSyncing: true }));
          try {
            await supabase
              .from('profiles')
              .update({ tags })
              .eq('id', userId);

            set(state => ({ 
              ...state, 
              isSyncing: false, 
              lastSyncTime: Date.now()
            }));
          } catch (error) {
            console.error('Error updating tags:', error);
            set(state => ({ ...state, isSyncing: false }));
          }
        }
      },
      updateAvatar: async (avatarUrl: string) => {
        const { userId } = get();
        set(state => ({ ...state, avatar: avatarUrl }));

        if (userId) {
          set(state => ({ ...state, isSyncing: true }));
          try {
            await supabase
              .from('profiles')
              .update({ avatar_url: avatarUrl })
              .eq('id', userId);

            set(state => ({ 
              ...state, 
              isSyncing: false, 
              lastSyncTime: Date.now() 
            }));
          } catch (error) {
            console.error('Error updating avatar:', error);
            set(state => ({ ...state, isSyncing: false }));
          }
        }
      },
      setSelectedSticker: async (stickerIndex: number | null) => {
        const { userId } = get();
        set(state => ({ ...state, selectedSticker: stickerIndex }));

        if (userId) {
          set(state => ({ ...state, isSyncing: true }));
          try {
            await supabase
              .from('profiles')
              .update({ selected_sticker: stickerIndex })
              .eq('id', userId);

            set(state => ({ 
              ...state, 
              isSyncing: false, 
              lastSyncTime: Date.now() 
            }));
          } catch (error) {
            console.error('Error updating selected sticker:', error);
            set(state => ({ ...state, isSyncing: false }));
          }
        }
      },
      joinMeetupLobby: (meetupId: string) => {
        set((state) => ({
          ...state,
          joinedLobbies: [...state.joinedLobbies, meetupId]
        }));
      },
      attendMeetup: (meetupId: string, points: number) => {
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
        
        set(state => ({
          ...state,
          attendedMeetups: [...state.attendedMeetups, meetup],
          points: state.points + points,
          level: Math.floor((state.points + points) / 10)
        }));
      },
      setUserId: async (userId: string) => {
        set(state => ({ ...state, userId, isLoading: true }));
        
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (error) {
            console.error('Error fetching profile:', error);
            set(state => ({ ...state, isLoading: false }));
            return;
          }
          
          if (profile) {
            set(state => ({
              ...state,
              name: profile.name || state.name,
              email: profile.email || state.email,
              avatar: profile.avatar_url || state.avatar,
              tags: profile.tags as Tag[] || state.tags,
              points: profile.points || state.points,
              level: profile.level || state.level,
              selectedSticker: profile.selected_sticker !== null ? profile.selected_sticker : state.selectedSticker,
              lastSyncTime: Date.now(),
              isLoading: false
            }));
          } else {
            const currentState = get();
            await supabase
              .from('profiles')
              .upsert({
                id: userId,
                name: currentState.name,
                email: currentState.email,
                avatar_url: currentState.avatar,
                tags: currentState.tags,
                points: currentState.points,
                level: currentState.level,
                selected_sticker: currentState.selectedSticker
              });
            
            set(state => ({ ...state, isLoading: false, lastSyncTime: Date.now() }));
          }
        } catch (error) {
          console.error('Error in setUserId:', error);
          set(state => ({ ...state, isLoading: false }));
        }
      },
      syncProfile: async () => {
        const { userId } = get();
        if (!userId) return;
        
        set(state => ({ ...state, isSyncing: true }));
        
        try {
          const currentState = get();
          await supabase
            .from('profiles')
            .upsert({
              id: userId,
              name: currentState.name,
              email: currentState.email,
              avatar_url: currentState.avatar,
              tags: currentState.tags,
              points: currentState.points,
              level: currentState.level,
              selected_sticker: currentState.selectedSticker
            });
          
          set(state => ({ 
            ...state, 
            isSyncing: false, 
            lastSyncTime: Date.now() 
          }));
        } catch (error) {
          console.error('Error syncing profile:', error);
          set(state => ({ ...state, isSyncing: false }));
        }
      }
    }),
    {
      name: "user-storage"
    }
  )
);
