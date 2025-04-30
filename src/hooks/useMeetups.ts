
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventRow, Meetup } from "@/types/meetup";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const useMeetups = (selectedCategory: string | null = null) => {
  const [allMeetups, setAllMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMeetups = async () => {
      try {
        setIsLoading(true);
        let query = supabase.from('events').select('*');
        
        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching meetups:", error);
          toast({
            title: "Error fetching meetups",
            description: "Could not load meetups from the database.",
            variant: "destructive"
          });
          setAllMeetups([]);
          return;
        }
        
        if (data && data.length > 0) {
          const eventRows = data as unknown as EventRow[];
          const meetups: Meetup[] = eventRows.map(event => ({
            id: event.id.toString(),
            title: event.title,
            description: event.description || "No description available",
            dateTime: formatEventDate(event.event_date),
            location: event.location,
            points: event.xp_reward || 3,
            createdBy: event.creator_name || "Anonymous",
            creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80", // Default avatar
            lobbySize: event.lobby_size || 5,
            category: event.category || "Other",
            attendees: []
          }));
          
          setAllMeetups(meetups);
        } else {
          setAllMeetups([]);
          toast({
            title: "No meetups found",
            description: "Try creating a new meetup!",
          });
        }
      } catch (error) {
        console.error("Error in fetching meetups:", error);
        
        setAllMeetups([]);
        
        toast({
          title: "Connection error",
          description: "Could not connect to the database",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeetups();
  }, [selectedCategory, toast]);

  // Helper function to handle date formatting safely
  const formatEventDate = (dateString: string): string => {
    try {
      // Check if it's already a formatted date string
      if (dateString.includes('@') || dateString.includes('/')) {
        return dateString;
      }
      
      // Try to parse as ISO date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, "MMM d, yyyy h:mm a");
      }
      
      // Return the original if we can't parse it
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const createMeetup = async (meetupData: Partial<Meetup>, userId: string, userName: string): Promise<Meetup | null> => {
    try {
      const { data, error } = await supabase.from('events').insert({
        title: meetupData.title,
        description: meetupData.description,
        location: meetupData.location,
        event_date: meetupData.dateTime,
        creator_id: parseInt(userId),
        creator_name: userName,
        created_at: new Date().toISOString(),
        semester: "Spring 2025",
        xp_reward: meetupData.points || 3,
        organizer_xp_reward: 5,
        category: meetupData.category,
        lobby_size: meetupData.lobbySize || 5
      }).select().single();

      if (error) {
        console.error("Error creating meetup:", error);
        toast({
          title: "Error creating meetup",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      if (!data) {
        toast({
          title: "Error creating meetup",
          description: "No data returned from database",
          variant: "destructive"
        });
        return null;
      }
      
      const eventRow = data as unknown as EventRow;
      const newMeetup: Meetup = {
        id: eventRow.id.toString(),
        title: eventRow.title,
        description: eventRow.description || "No description available",
        dateTime: formatEventDate(eventRow.event_date),
        location: eventRow.location,
        points: eventRow.xp_reward || 3,
        createdBy: eventRow.creator_name || userName,
        creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
        lobbySize: eventRow.lobby_size || 5,
        category: eventRow.category || "Other",
        attendees: []
      };
      
      setAllMeetups(prev => [newMeetup, ...prev]);
      
      toast({
        title: "Meetup created!",
        description: "Your meetup has been successfully created.",
      });
      
      return newMeetup;
    } catch (error) {
      console.error("Error in meetup creation:", error);
      toast({
        title: "Error creating meetup",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    }
  };

  const joinMeetupLobby = async (meetupId: string, userId: string): Promise<boolean> => {
    try {
      // First check if user is already in the lobby
      const { data: existingParticipant, error: checkError } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', parseInt(meetupId))
        .eq('user_id', parseInt(userId))
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error("Error checking participant:", checkError);
        return false;
      }
      
      // If participant already exists, don't add again
      if (existingParticipant) {
        toast({
          title: "Already joined",
          description: "You've already joined this meetup lobby.",
        });
        return true;
      }
      
      // Insert participant
      const { error } = await supabase.from('participants').insert({
        event_id: parseInt(meetupId),
        user_id: parseInt(userId),
        joined_at: new Date().toISOString(),
        attendance_status: 'registered'
      });
      
      if (error) {
        console.error("Error joining meetup lobby:", error);
        toast({
          title: "Error joining lobby",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Joined lobby",
        description: "You've joined the meetup lobby. Don't forget to check in when you attend to earn points!",
      });
      
      return true;
    } catch (error) {
      console.error("Error joining meetup lobby:", error);
      toast({
        title: "Error joining lobby",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  const checkInToMeetup = async (meetupId: string, userId: string): Promise<boolean> => {
    try {
      // Update participant status to attended
      const { error } = await supabase
        .from('participants')
        .update({ 
          attendance_status: 'attended',
          xp_earned: 3 // Default XP value
        })
        .eq('event_id', parseInt(meetupId))
        .eq('user_id', parseInt(userId));
      
      if (error) {
        console.error("Error checking in to meetup:", error);
        toast({
          title: "Error checking in",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Check-in successful!",
        description: "You've checked in to this meetup and earned points!",
      });
      
      return true;
    } catch (error) {
      console.error("Error checking in to meetup:", error);
      toast({
        title: "Error checking in",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  return { 
    allMeetups, 
    isLoading, 
    setAllMeetups,
    createMeetup,
    joinMeetupLobby,
    checkInToMeetup 
  };
};
