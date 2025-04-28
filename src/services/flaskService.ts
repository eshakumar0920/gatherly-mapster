
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
      const response = await fetch('/events');
      
      if (!response.ok) {
        console.log("Flask API error:", response.statusText);
        return [];
      }
      
      const data = await response.json();
      console.log("Received meetups data from API:", data);
      
      return Array.isArray(data) ? data.map(event => ({
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
      const response = await fetch(`/events/${meetupId}`);
      
      if (!response.ok) {
        console.log("Flask API error:", response.statusText);
        return null;
      }
      
      const data = await response.json();
      if (!data) return null;
      
      return {
        id: data.id.toString(),
        title: data.title,
        description: data.description || "No description available",
        dateTime: data.event_date || data.dateTime,
        location: data.location,
        points: data.xp_reward || data.points || 3,
        createdBy: data.creator_name || data.createdBy || "Anonymous",
        creatorAvatar: data.creator_avatar || data.creatorAvatar,
        lobbySize: data.lobby_size || data.lobbySize || 5,
        category: data.category || "Other",
        attendees: data.attendees || []
      };
    } catch (error) {
      console.error("Error fetching meetup by ID:", error);
      return null;
    }
  }, []);
  
  const joinMeetupLobby = useCallback(async (meetupId: string): Promise<boolean> => {
    try {
      const userId = "1";
      
      const response = await fetch(`/events/${meetupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (!response.ok) {
        console.log("Flask API error for joining lobby:", response.statusText);
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
      console.log("Creating meetup with data:", meetupData);
      
      const backendEventData = {
        title: meetupData.title,
        description: meetupData.description,
        event_date: meetupData.dateTime,
        location: meetupData.location,
        creator_id: 1,
        category: meetupData.category,
        lobby_size: meetupData.lobbySize
      };
      
      console.log("Sending to backend:", backendEventData);
      
      const response = await fetch('/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendEventData),
      });
      
      console.log("API response status:", response.status, response.statusText);
      
      // Try to get the response content regardless of status
      let responseText;
      try {
        responseText = await response.text();
        console.log("Raw response:", responseText);
      } catch (textError) {
        console.error("Failed to get response text:", textError);
        responseText = "Unable to read response";
      }
      
      // Try to parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed JSON response:", data);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError, "Raw text:", responseText);
        toast({
          title: "Error creating meetup",
          description: "The server returned an invalid response",
          variant: "destructive"
        });
        return null;
      }
      
      if (!response.ok) {
        const errorMessage = data && data.error 
          ? data.error 
          : response.statusText || "An unexpected error occurred";
        
        console.error("Error response from server:", errorMessage);
        toast({
          title: "Error creating meetup",
          description: errorMessage,
          variant: "destructive"
        });
        return null;
      }
      
      toast({
        title: "Meetup created!",
        description: "Your meetup has been successfully created.",
      });
      
      if (data && data.id) {
        const newMeetup = await fetchMeetupById(data.id.toString());
        return newMeetup;
      } else {
        console.warn("Created meetup, but ID was not returned");
        return null;
      }
    } catch (error) {
      console.error("Error creating meetup:", error);
      toast({
        title: "Error creating meetup",
        description: "An unexpected error occurred while creating your meetup",
        variant: "destructive"
      });
      return null;
    }
  }, [toast, fetchMeetupById]);
  
  const searchMeetups = useCallback(async (searchParams: EventSearchParams): Promise<FlaskMeetup[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (searchParams.query) {
        queryParams.append('q', searchParams.query);
      }
      
      if (searchParams.category) {
        queryParams.append('category', searchParams.category);
      }
      
      if (searchParams.location) {
        queryParams.append('location', searchParams.location);
      }
      
      const response = await fetch(`/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        console.log("Flask API error:", response.statusText);
        return [];
      }
      
      const data = await response.json();
      
      return Array.isArray(data) ? data.map(event => ({
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
      console.error("Error searching meetups:", error);
      return [];
    }
  }, []);
  
  return {
    fetchMeetups,
    fetchMeetupById,
    joinMeetupLobby,
    checkInToMeetup,
    createMeetup,
    searchMeetups
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
