
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from 'react';

// Define event interfaces based on your Flask API
export interface FlaskEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  creator_id: number;
  participants_count?: number;
}

export function useFlaskEventService() {
  const { toast } = useToast();

  // Search events with filters
  const searchEvents = useCallback(async (
    query?: string,
    location?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<FlaskEvent[]> => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (location) params.append('location', location);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('event-api/search', {
        body: { params: params.toString() }
      });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error searching events:', error);
      toast({
        title: "Error",
        description: "Failed to search events. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);

  // Get all events
  const getAllEvents = useCallback(async (): Promise<FlaskEvent[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('event-api/events');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);

  // Get event by ID
  const getEventById = useCallback(async (eventId: number): Promise<FlaskEvent | null> => {
    try {
      const { data, error } = await supabase.functions.invoke(`event-api/events/${eventId}`);
      
      if (error) throw error;
      
      return data || null;
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      toast({
        title: "Error",
        description: "Failed to fetch event details. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Create a new event
  const createEvent = useCallback(async (eventData: Omit<FlaskEvent, 'id'>): Promise<{id?: number, success: boolean}> => {
    try {
      const { data, error } = await supabase.functions.invoke('event-api/events', {
        method: 'POST',
        body: eventData
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      
      return { id: data.id, success: true };
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
      return { success: false };
    }
  }, [toast]);

  // Join an event
  const joinEvent = useCallback(async (eventId: number, userId: number): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke(`event-api/events/${eventId}/join`, {
        method: 'POST',
        body: { user_id: userId }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "You've joined the event!",
      });
      
      return true;
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: "Error",
        description: "Failed to join event. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Leave an event
  const leaveEvent = useCallback(async (eventId: number, userId: number): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke(`event-api/events/${eventId}/leave`, {
        method: 'POST',
        body: { user_id: userId }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "You've left the event.",
      });
      
      return true;
    } catch (error) {
      console.error('Error leaving event:', error);
      toast({
        title: "Error",
        description: "Failed to leave event. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Get event participants
  const getEventParticipants = useCallback(async (eventId: number) => {
    try {
      const { data, error } = await supabase.functions.invoke(`event-api/events/${eventId}/participants`);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching event participants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch event participants. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);

  return {
    searchEvents,
    getAllEvents,
    getEventById,
    createEvent,
    joinEvent,
    leaveEvent,
    getEventParticipants
  };
}
