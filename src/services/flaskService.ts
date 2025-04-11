import { eventsApi } from './api';
import { useToast } from "@/hooks/use-toast";
import { useCallback } from 'react';
import { useApiErrorHandling } from './api';

// Define types for events that match your Flask backend
export interface FlaskEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  creator_id: number;
  participants_count?: number;
}

// Define types for meetups
export interface FlaskMeetup {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  points: number;
  createdBy: string;
  creatorAvatar?: string;
  lobbySize: number;
  attendees?: string[];
}

// Define types for user leveling system
export interface UserProgress {
  user_id: number;
  username: string;
  current_level: number;
  current_xp: number;
  total_xp_earned: number;
  current_tier: string;
  active_weeks_streak: number;
  activity_bonus: string;
  next_level: number | null;
  xp_for_next_level: number;
  xp_needed_for_level: number;
  progress_percent: number;
  max_level_reached: boolean;
  current_semester: string;
  recent_activities: UserActivity[];
}

export interface UserActivity {
  timestamp: string;
  activity_type: string;
  xp_earned: number;
  description: string;
}

export interface Level {
  level_number: number;
  level_xp: number;
  total_xp: number;
  tier: string;
}

export interface LootBox {
  id: number;
  type_name: string;
  description: string;
  tier: string;
  icon_url: string;
  is_opened: boolean;
  awarded_at: string;
  opened_at: string | null;
  awarded_for: string;
}

// New types for rewards system
export interface UserReward {
  id: number;
  reward_id: number;
  name: string;
  description: string;
  image_url: string;
  tier: string;
  category: string;
  theme: string;
  is_rare: boolean;
  is_equipped: boolean;
  acquired_at: string;
  loot_box_id: number;
}

export interface RewardType {
  id: number;
  name: string;
  description: string;
  image_url: string;
  tier: string;
  category: string;
  theme: string;
  is_rare: boolean;
}

export interface CategoryTheme {
  categories: string[];
  themes: string[];
}

// Original event service
export function useEventService() {
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandling();
  
  // Fetch all events with error handling
  const fetchEvents = useCallback(async (params?: { location?: string; date?: string; q?: string }): Promise<FlaskEvent[]> => {
    const response = await eventsApi.getAllEvents(params);
    
    if (response.error) {
      handleApiError(response.error);
      return [];
    }
    
    return response.data || [];
  }, [handleApiError]);
  
  // Fetch a single event by ID
  const fetchEventById = useCallback(async (eventId: number): Promise<FlaskEvent | null> => {
    const response = await eventsApi.getEventById(eventId);
    
    if (response.error) {
      handleApiError(response.error);
      return null;
    }
    
    return response.data || null;
  }, [handleApiError]);
  
  // Join an event
  const joinEvent = useCallback(async (eventId: number, userId: number): Promise<boolean> => {
    const response = await eventsApi.joinEvent(eventId, userId);
    
    if (response.error) {
      handleApiError(response.error);
      return false;
    }
    
    toast({
      title: "Success",
      description: "You've joined the event successfully!",
    });
    
    return true;
  }, [toast, handleApiError]);
  
  // Leave an event
  const leaveEvent = useCallback(async (eventId: number, userId: number): Promise<boolean> => {
    const response = await eventsApi.leaveEvent(eventId, userId);
    
    if (response.error) {
      handleApiError(response.error);
      return false;
    }
    
    toast({
      title: "Success",
      description: "You've left the event successfully!",
    });
    
    return true;
  }, [toast, handleApiError]);
  
  // Get event participants
  const getEventParticipants = useCallback(async (eventId: number) => {
    const response = await eventsApi.getEventParticipants(eventId);
    
    if (response.error) {
      handleApiError(response.error);
      return [];
    }
    
    return response.data || [];
  }, [handleApiError]);

  // Create a new event
  const createEvent = useCallback(async (eventData: Omit<FlaskEvent, 'id'>): Promise<number | null> => {
    const response = await eventsApi.createEvent(eventData);
    
    if (response.error) {
      handleApiError(response.error);
      return null;
    }
    
    toast({
      title: "Event Created",
      description: "Your event has been created successfully!",
    });
    
    return response.data?.id || null;
  }, [toast, handleApiError]);
  
  return {
    fetchEvents,
    fetchEventById,
    joinEvent,
    leaveEvent,
    getEventParticipants,
    createEvent
  };
}

export function useMeetupService() {
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandling();
  
  // Mock implementation for meetup service since there's no actual meetupsApi
  // Fetch all meetups with error handling
  const fetchMeetups = useCallback(async (): Promise<FlaskMeetup[]> => {
    // For now this is a mock implementation
    console.log("fetchMeetups called - this is a mock implementation");
    return [];
  }, []);
  
  // Fetch a single meetup by ID
  const fetchMeetupById = useCallback(async (meetupId: string): Promise<FlaskMeetup | null> => {
    // For now this is a mock implementation
    console.log(`fetchMeetupById called with id: ${meetupId} - this is a mock implementation`);
    return null;
  }, []);
  
  // Join a meetup lobby
  const joinMeetupLobby = useCallback(async (meetupId: string): Promise<boolean> => {
    // For now this is a mock implementation
    console.log(`joinMeetupLobby called with id: ${meetupId} - this is a mock implementation`);
    
    toast({
      title: "Joined lobby",
      description: "You've joined the meetup lobby. Don't forget to scan the QR code at the meetup to check in and earn points!",
    });
    
    return true;
  }, [toast]);
  
  // Check in to a meetup
  const checkInToMeetup = useCallback(async (meetupId: string): Promise<boolean> => {
    // For now this is a mock implementation
    console.log(`checkInToMeetup called with id: ${meetupId} - this is a mock implementation`);
    
    toast({
      title: "Check-in successful!",
      description: `You've checked in to this meetup and earned points!`,
    });
    
    return true;
  }, [toast]);
  
  return {
    fetchMeetups,
    fetchMeetupById,
    joinMeetupLobby,
    checkInToMeetup
  };
}

export function useUserService() {
  const { handleApiError } = useApiErrorHandling();
  
  // Mock implementation for user service 
  const getUserPoints = useCallback(async (userId: string) => {
    // For now this is a mock implementation
    console.log(`getUserPoints called with userId: ${userId} - this is a mock implementation`);
    return 0;
  }, []);
  
  return {
    getUserPoints
  };
}

// New leveling service
export function useLevelingService() {
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandling();
  
  // Get user progress
  const getUserProgress = useCallback(async (userId: number): Promise<UserProgress | null> => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/progress`);
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to fetch user progress');
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user progress:', error);
      handleApiError('Network error when fetching user progress');
      return null;
    }
  }, [handleApiError]);
  
  // Get all levels
  const getLevels = useCallback(async (): Promise<Level[]> => {
    try {
      const response = await fetch('http://localhost:5000/api/levels');
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to fetch levels');
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching levels:', error);
      handleApiError('Network error when fetching levels');
      return [];
    }
  }, [handleApiError]);
  
  // Get user lootboxes
  const getUserLootboxes = useCallback(async (userId: number): Promise<LootBox[]> => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/lootboxes`);
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to fetch lootboxes');
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching lootboxes:', error);
      handleApiError('Network error when fetching lootboxes');
      return [];
    }
  }, [handleApiError]);
  
  // Open a lootbox
  const openLootbox = useCallback(async (userId: number, lootboxId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/lootboxes/${lootboxId}/open`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to open lootbox');
        return false;
      }
      
      toast({
        title: "Loot Box Opened!",
        description: "You've successfully opened a loot box!",
      });
      
      return true;
    } catch (error) {
      console.error('Error opening lootbox:', error);
      handleApiError('Network error when opening lootbox');
      return false;
    }
  }, [toast, handleApiError]);
  
  // Start a new semester (admin only)
  const startNewSemester = useCallback(async (
    name: string, 
    startDate: string, 
    endDate: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/semester', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          start_date: startDate,
          end_date: endDate
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to start new semester');
        return false;
      }
      
      toast({
        title: "New Semester Started",
        description: `Successfully started new semester: ${name}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error starting new semester:', error);
      handleApiError('Network error when starting new semester');
      return false;
    }
  }, [toast, handleApiError]);
  
  return {
    getUserProgress,
    getLevels,
    getUserLootboxes,
    openLootbox,
    startNewSemester
  };
}

// New rewards service
export function useRewardsService() {
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandling();
  
  // Get user rewards
  const getUserRewards = useCallback(async (userId: number): Promise<UserReward[]> => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/rewards`);
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to fetch user rewards');
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      handleApiError('Network error when fetching user rewards');
      return [];
    }
  }, [handleApiError]);
  
  // Get all reward types
  const getRewardTypes = useCallback(async (params?: { tier?: number; category?: string; theme?: string }): Promise<RewardType[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.tier) queryParams.append('tier', params.tier.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.theme) queryParams.append('theme', params.theme);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await fetch(`http://localhost:5000/api/reward-types${queryString}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to fetch reward types');
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching reward types:', error);
      handleApiError('Network error when fetching reward types');
      return [];
    }
  }, [handleApiError]);
  
  // Equip a reward
  const equipReward = useCallback(async (userId: number, rewardId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/rewards/${rewardId}/equip`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to equip reward');
        return false;
      }
      
      toast({
        title: "Reward Equipped",
        description: "You've successfully equipped the reward!",
      });
      
      return true;
    } catch (error) {
      console.error('Error equipping reward:', error);
      handleApiError('Network error when equipping reward');
      return false;
    }
  }, [toast, handleApiError]);
  
  // Get categories and themes
  const getCategoriesAndThemes = useCallback(async (): Promise<CategoryTheme> => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to fetch categories and themes');
        return { categories: [], themes: [] };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories and themes:', error);
      handleApiError('Network error when fetching categories and themes');
      return { categories: [], themes: [] };
    }
  }, [handleApiError]);
  
  return {
    getUserRewards,
    getRewardTypes,
    equipReward,
    getCategoriesAndThemes
  };
}
