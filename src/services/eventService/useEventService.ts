
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useApiErrorHandling } from '../api';
import { eventsApi } from '../api';
import { FlaskEvent } from '../types/flaskTypes';

export function useEventService() {
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandling();
  
  // Fetch all events with error handling
  const fetchEvents = useCallback(async (params?: { location?: string; date?: string; q?: string }): Promise<FlaskEvent[]> => {
    try {
      const response = await eventsApi.getAllEvents(params);
      
      if (response.error) {
        handleApiError(response.error);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch events:", error);
      handleApiError("An unexpected error occurred while fetching events");
      return [];
    }
  }, [handleApiError]);
  
  // Fetch a single event by ID
  const fetchEventById = useCallback(async (eventId: number): Promise<FlaskEvent | null> => {
    try {
      const response = await eventsApi.getEventById(eventId);
      
      if (response.error) {
        handleApiError(response.error);
        return null;
      }
      
      return response.data || null;
    } catch (error) {
      console.error("Failed to fetch event details:", error);
      handleApiError("An unexpected error occurred while fetching event details");
      return null;
    }
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
