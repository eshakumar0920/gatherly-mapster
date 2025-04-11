import { meetupsApi, eventsApi, userApi, useApiErrorHandling } from './api';
import { useToast } from "@/hooks/use-toast";
import { useCallback } from 'react';

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
  attendees?: string[];
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
