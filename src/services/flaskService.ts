
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
