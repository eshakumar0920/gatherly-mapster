import { meetupsApi, eventsApi, useApiErrorHandling, EventSearchParams } from './api';
import { useToast } from "@/hooks/use-toast";
import { useCallback } from 'react';
import { EventRow, Meetup } from "@/types/meetup";
import { supabase } from "@/integrations/supabase/client";

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
  category?: string;
  attendees?: string[];
}

export function useMeetupService() {
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandling();
  
  const fetchMeetups = useCallback(async (): Promise<FlaskMeetup[]> => {
    try {
      console.log("Fetching meetups from Flask API");
      const response = await meetupsApi.getAllMeetups();
      
      if (response.error) {
        console.log("Flask API error:", response.error);
        return [];
      }
      
      console.log("Received meetups data from API:", response.data);
      return Array.isArray(response.data) ? response.data.map(event => ({
        id: event.id.toString(),
        title: event.title,
        description: event.description || "No description available",
        dateTime: event.event_date || event.dateTime,
        location: event.location,
        points: event.xp_reward || event.points || 3,
        createdBy: event.creator_name || event.createdBy || "Anonymous",
        creatorAvatar: event.creator_avatar || event.creatorAvatar,
        lobbySize: event.lobby_size || event.lobbySize || 5,
        category: event.category || "Other",
        attendees: event.attendees || []
      })) : [];
    } catch (error) {
      console.error("Error fetching meetups:", error);
      return [];
    }
  }, []);
  
  const fetchMeetupById = useCallback(async (meetupId: string): Promise<FlaskMeetup | null> => {
    try {
      const response = await meetupsApi.getMeetupById(meetupId);
      
      if (response.error) {
        console.log("Flask API error:", response.error);
        return null;
      }
      
      if (!response.data) return null;
      
      return {
        id: response.data.id.toString(),
        title: response.data.title,
        description: response.data.description || "No description available",
        dateTime: response.data.event_date || response.data.dateTime,
        location: response.data.location,
        points: response.data.xp_reward || response.data.points || 3,
        createdBy: response.data.creator_name || response.data.createdBy || "Anonymous",
        creatorAvatar: response.data.creator_avatar || response.data.creatorAvatar,
        lobbySize: response.data.lobby_size || response.data.lobbySize || 5,
        category: response.data.category || "Other",
        attendees: response.data.attendees || []
      };
    } catch (error) {
      console.error("Error fetching meetup by ID:", error);
      return null;
    }
  }, []);
  
  const joinMeetupLobby = useCallback(async (meetupId: string): Promise<boolean> => {
    try {
      const response = await meetupsApi.joinMeetupLobby(meetupId, {});
      
      if (response.error) {
        console.log("Flask API error for joining lobby:", response.error);
        return false;
      }
      
      toast({
        title: "Joined lobby",
        description: "You've joined the meetup lobby. Don't forget to scan the QR code at the meetup to check in and earn points!",
      });
      
      return true;
    } catch (error) {
      console.error("Error joining meetup lobby:", error);
      return false;
    }
  }, [toast]);
  
  const checkInToMeetup = useCallback(async (meetupId: string): Promise<boolean> => {
    try {
      const response = await meetupsApi.checkInToMeetup(meetupId, {});
      
      if (response.error) {
        console.log("Flask API error for check-in:", response.error);
        return false;
      }
      
      toast({
        title: "Check-in successful!",
        description: `You've checked in to this meetup and earned points!`,
      });
      
      return true;
    } catch (error) {
      console.error("Error checking in to meetup:", error);
      return false;
    }
  }, [toast]);

  const createMeetup = useCallback(async (meetupData: any): Promise<FlaskMeetup | null> => {
    try {
      const backendEventData = {
        title: meetupData.title,
        description: meetupData.description,
        event_date: meetupData.dateTime,
        location: meetupData.location,
        category: meetupData.category,
        lobby_size: meetupData.lobbySize
      };
      
      const response = await meetupsApi.createMeetup(backendEventData);
      
      if (response.error) {
        toast({
          title: "Error creating meetup",
          description: response.error,
          variant: "destructive"
        });
        return null;
      }
      
      toast({
        title: "Meetup created!",
        description: "Your meetup has been successfully created.",
      });
      
      return response.data;
    } catch (error) {
      console.error("Error creating meetup:", error);
      toast({
        title: "Error creating meetup",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);
  
  return {
    fetchMeetups,
    fetchMeetupById,
    joinMeetupLobby,
    checkInToMeetup,
    createMeetup
  };
}

export function useEventService() {
  const { handleApiError } = useApiErrorHandling();
  const { toast } = useToast();
  
  const searchEvents = useCallback(async (params: EventSearchParams) => {
    try {
      console.log("Searching events with params:", params);
      const response = await eventsApi.searchEvents(params);
      
      if (response.error) {
        handleApiError(response.error);
        console.log("Flask API error, falling back to Supabase:", response.error);
        
        const { data, error } = await supabase.from('events').select('*');
        
        if (error) {
          console.error("Supabase error:", error);
          return [];
        }
        
        console.log("Supabase events data:", data);
        
        if (data && Array.isArray(data) && data.length > 0) {
          return data.map(event => ({
            id: event.id.toString(),
            title: event.title,
            description: event.description || "No description available",
            date: new Date(event.event_date).toLocaleDateString(),
            time: new Date(event.event_date).toLocaleTimeString(),
            location: event.location,
            category: event.category || "Other",
            image: `https://source.unsplash.com/random/300x200?${encodeURIComponent(event.category || 'event')}`
          }));
        }
        
        return [];
      }
      
      console.log("Received search events data from API:", response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error searching events:", error);
      return [];
    }
  }, [handleApiError]);
  
  const joinEvent = useCallback(async (eventId: string, userId: string) => {
    try {
      const response = await eventsApi.joinEvent(eventId, userId);
      
      if (response.error) {
        handleApiError(response.error);
        return false;
      }
      
      toast({
        title: "Success",
        description: "You have successfully joined this event!",
      });
      
      return true;
    } catch (error) {
      console.error("Error joining event:", error);
      return false;
    }
  }, [handleApiError, toast]);
  
  const leaveEvent = useCallback(async (eventId: string, userId: string) => {
    try {
      const response = await eventsApi.leaveEvent(eventId, userId);
      
      if (response.error) {
        handleApiError(response.error);
        return false;
      }
      
      toast({
        title: "Success",
        description: "You have successfully left this event.",
      });
      
      return true;
    } catch (error) {
      console.error("Error leaving event:", error);
      return false;
    }
  }, [handleApiError, toast]);
  
  const getEventById = useCallback(async (eventId: string) => {
    try {
      const response = await eventsApi.getEventById(eventId);
      
      if (response.error) {
        handleApiError(response.error);
        return null;
      }
      
      return response.data || null;
    } catch (error) {
      console.error("Error getting event details:", error);
      return null;
    }
  }, [handleApiError]);
  
  const fetchEvents = useCallback(async () => {
    const response = await eventsApi.getAllEvents();
    
    if (response.error) {
      handleApiError(response.error);
      return [];
    }
    
    return response.data || [];
  }, [handleApiError]);
  
  return {
    searchEvents,
    joinEvent,
    leaveEvent,
    getEventById,
    fetchEvents
  };
}

export function useUserService() {
  const { handleApiError } = useApiErrorHandling();
  
  const getUserPoints = useCallback(async (userId: string) => {
    const numericUserId = parseInt(userId, 10);
    
    if (isNaN(numericUserId)) {
      console.error("Invalid user ID:", userId);
      return 0;
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('current_xp')
      .eq('id', numericUserId)
      .single();
    
    if (error || !data) {
      return 0;
    }
    
    return data.current_xp || 0;
  }, []);
  
  return {
    getUserPoints
  };
}
