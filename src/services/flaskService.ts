
import { meetupsApi, eventsApi, userApi, useApiErrorHandling } from './api';
import { useToast } from "@/hooks/use-toast";
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { EventRow, Meetup } from "@/types/meetup";

// Define types for meetups that match your Flask backend
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
  category?: string; // Added category property as optional
  attendees?: string[];
}

export function useMeetupService() {
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandling();
  
  // Fetch all meetups with error handling
  const fetchMeetups = useCallback(async (): Promise<FlaskMeetup[]> => {
    try {
      // Try Flask API first
      const response = await meetupsApi.getAllMeetups();
      
      if (response.error) {
        console.log("Flask API error, falling back to Supabase:", response.error);
        // Fall back to Supabase
        const { data, error } = await supabase.from('events').select('*');
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        // Transform Supabase data to FlaskMeetup format
        if (data && data.length > 0) {
          const eventRows = data as unknown as EventRow[];
          return eventRows.map(event => ({
            id: event.id.toString(),
            title: event.title,
            description: event.description || "No description available",
            dateTime: new Date(event.event_date).toLocaleString(),
            location: event.location,
            points: event.xp_reward || 3,
            createdBy: "Student",
            creatorAvatar: undefined,
            lobbySize: 5,
            category: event.category || "Other",
            attendees: []
          }));
        }
        
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching meetups:", error);
      return [];
    }
  }, []);
  
  // Fetch a single meetup by ID
  const fetchMeetupById = useCallback(async (meetupId: string): Promise<FlaskMeetup | null> => {
    try {
      // Try Flask API first
      const response = await meetupsApi.getMeetupById(meetupId);
      
      if (response.error) {
        console.log("Flask API error, falling back to Supabase:", response.error);
        // Fall back to Supabase
        const { data, error } = await supabase.from('events').select('*').eq('id', parseInt(meetupId)).single();
        
        if (error) {
          console.error("Supabase error:", error);
          // Don't throw error here, let it return null and use mock data instead
          return null;
        }
        
        // Transform Supabase data to FlaskMeetup format
        const event = data as unknown as EventRow;
        return {
          id: event.id.toString(),
          title: event.title,
          description: event.description || "No description available",
          dateTime: new Date(event.event_date).toLocaleString(),
          location: event.location,
          points: event.xp_reward || 3,
          createdBy: "Student",
          creatorAvatar: undefined,
          lobbySize: 5,
          category: event.category || "Other",
          attendees: []
        };
      }
      
      return response.data || null;
    } catch (error) {
      console.error("Error fetching meetup by ID:", error);
      return null;
    }
  }, []);
  
  // Join a meetup lobby
  const joinMeetupLobby = useCallback(async (meetupId: string): Promise<boolean> => {
    try {
      // Try Flask API first
      const response = await meetupsApi.joinMeetupLobby(meetupId, {});
      
      if (response.error) {
        console.log("Flask API error for joining lobby, using local state instead:", response.error);
        // Don't show error to user since we'll fall back to local state
        return true; // Return success to use the local state management instead
      }
      
      toast({
        title: "Joined lobby",
        description: "You've joined the meetup lobby. Don't forget to scan the QR code at the meetup to check in and earn points!",
      });
      
      return true;
    } catch (error) {
      console.error("Error joining meetup lobby:", error);
      // Don't show error toast here since we'll use local state
      return true; // Return success for local state management
    }
  }, [toast]);
  
  // Check in to a meetup
  const checkInToMeetup = useCallback(async (meetupId: string): Promise<boolean> => {
    try {
      // Try Flask API first
      const response = await meetupsApi.checkInToMeetup(meetupId, {});
      
      if (response.error) {
        console.log("Flask API error for check-in, using local state instead:", response.error);
        // Don't show error to user since we'll fall back to local state
        return false; // Return false to use local state management instead
      }
      
      toast({
        title: "Check-in successful!",
        description: `You've checked in to this meetup and earned points!`,
      });
      
      return true;
    } catch (error) {
      console.error("Error checking in to meetup:", error);
      // Don't show error toast here since we'll use local state
      return false; // Return false to use local state management
    }
  }, [toast]);
  
  return {
    fetchMeetups,
    fetchMeetupById,
    joinMeetupLobby,
    checkInToMeetup
  };
}

// Example usage for events and user services
export function useEventService() {
  const { handleApiError } = useApiErrorHandling();
  
  // Fetch all events
  const fetchEvents = useCallback(async () => {
    const response = await eventsApi.getAllEvents();
    
    if (response.error) {
      handleApiError(response.error);
      return [];
    }
    
    return response.data || [];
  }, []);
  
  // Other event-related functions...
  
  return {
    fetchEvents
  };
}

export function useUserService() {
  const { handleApiError } = useApiErrorHandling();
  
  // Get user points
  const getUserPoints = useCallback(async (userId: string) => {
    const response = await userApi.getUserPoints(userId);
    
    if (response.error) {
      handleApiError(response.error);
      return 0;
    }
    
    return response.data || 0;
  }, []);
  
  // Other user-related functions...
  
  return {
    getUserPoints
  };
}
