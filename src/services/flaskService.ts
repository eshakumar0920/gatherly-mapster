import { eventsApi, Event as FlaskEvent, useApiErrorHandling } from './api';
import { useToast } from "@/hooks/use-toast";
import { useCallback } from 'react';

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
  }, []);
  
  // Fetch a single event by ID
  const fetchEventById = useCallback(async (eventId: number): Promise<FlaskEvent | null> => {
    const response = await eventsApi.getEventById(eventId);
    
    if (response.error) {
      handleApiError(response.error);
      return null;
    }
    
    return response.data || null;
  }, []);
  
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
  }, [toast]);
  
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
  }, [toast]);
  
  // Get event participants
  const getEventParticipants = useCallback(async (eventId: number) => {
    const response = await eventsApi.getEventParticipants(eventId);
    
    if (response.error) {
      handleApiError(response.error);
      return [];
    }
    
    return response.data || [];
  }, []);

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
  }, [toast]);
  
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
  
  // Fetch all meetups with error handling
  const fetchMeetups = useCallback(async (): Promise<FlaskMeetup[]> => {
    const response = await meetupsApi.getAllMeetups();
    
    if (response.error) {
      handleApiError(response.error);
      return [];
    }
    
    return response.data || [];
  }, []);
  
  // Fetch a single meetup by ID
  const fetchMeetupById = useCallback(async (meetupId: string): Promise<FlaskMeetup | null> => {
    const response = await meetupsApi.getMeetupById(meetupId);
    
    if (response.error) {
      handleApiError(response.error);
      return null;
    }
    
    return response.data || null;
  }, []);
  
  // Join a meetup lobby
  const joinMeetupLobby = useCallback(async (meetupId: string): Promise<boolean> => {
    const response = await meetupsApi.joinMeetupLobby(meetupId, {});
    
    if (response.error) {
      handleApiError(response.error);
      return false;
    }
    
    toast({
      title: "Joined lobby",
      description: "You've joined the meetup lobby. Don't forget to scan the QR code at the meetup to check in and earn points!",
    });
    
    return true;
  }, [toast]);
  
  // Check in to a meetup
  const checkInToMeetup = useCallback(async (meetupId: string): Promise<boolean> => {
    const response = await meetupsApi.checkInToMeetup(meetupId, {});
    
    if (response.error) {
      handleApiError(response.error);
      return false;
    }
    
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
  
  // Get user points
  const getUserPoints = useCallback(async (userId: string) => {
    const response = await userApi.getUserPoints(userId);
    
    if (response.error) {
      handleApiError(response.error);
      return 0;
    }
    
    return response.data || 0;
  }, []);
  
  return {
    getUserPoints
  };
}
