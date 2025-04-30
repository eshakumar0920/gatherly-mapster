
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventRow, Meetup } from "@/types/meetup";
import { useToast } from "@/hooks/use-toast";
import { meetups as sampleMeetups } from "@/services/meetupService";
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
            description: "Could not load meetups from the database. Using sample data instead.",
            variant: "destructive"
          });
          
          // Fall back to filtered sample meetups
          const filteredMeetups = selectedCategory 
            ? sampleMeetups.filter(m => m.category?.toLowerCase() === selectedCategory.toLowerCase())
            : sampleMeetups;
          
          setAllMeetups(filteredMeetups);
          return;
        }
        
        if (data && data.length > 0) {
          const eventRows = data as unknown as EventRow[];
          const databaseMeetups: Meetup[] = eventRows.map(event => ({
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
          
          // Combine sample meetups with database meetups
          const dbIds = new Set(databaseMeetups.map(m => m.id));
          const nonDuplicateSampleMeetups = sampleMeetups.filter(m => !dbIds.has(m.id));
          
          // Apply category filter to sample meetups if needed
          const filteredSampleMeetups = selectedCategory 
            ? nonDuplicateSampleMeetups.filter(m => m.category?.toLowerCase() === selectedCategory.toLowerCase())
            : nonDuplicateSampleMeetups;
          
          setAllMeetups([...databaseMeetups, ...filteredSampleMeetups]);
        } else {
          // If no database meetups, just show sample meetups
          const filteredSampleMeetups = selectedCategory 
            ? sampleMeetups.filter(m => m.category?.toLowerCase() === selectedCategory.toLowerCase())
            : sampleMeetups;
          
          setAllMeetups(filteredSampleMeetups);
        }
      } catch (error) {
        console.error("Error in fetching meetups:", error);
        
        // Fall back to sample meetups on error
        const filteredSampleMeetups = selectedCategory 
          ? sampleMeetups.filter(m => m.category?.toLowerCase() === selectedCategory.toLowerCase())
          : sampleMeetups;
          
        setAllMeetups(filteredSampleMeetups);
        
        toast({
          title: "Connection error",
          description: "Using sample meetups while we try to reconnect",
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

  return { allMeetups, isLoading, setAllMeetups };
};
