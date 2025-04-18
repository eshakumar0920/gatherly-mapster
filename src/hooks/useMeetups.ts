
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventRow, Meetup } from "@/types/meetup";
import { useToast } from "@/hooks/use-toast";

export const useMeetups = (selectedCategory: string | null) => {
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
            description: "Could not load meetups from the database",
            variant: "destructive"
          });
          return;
        }
        
        if (data && data.length > 0) {
          // Use a type assertion to avoid deep instantiation
          const eventRows = data as unknown as EventRow[];
          const supabaseMeetups: Meetup[] = eventRows.map(event => ({
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
          
          setAllMeetups(supabaseMeetups);
        } else {
          setAllMeetups([]);
        }
      } catch (error) {
        console.error("Error in fetching meetups:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeetups();
  }, [selectedCategory, toast]);

  return { allMeetups, isLoading, setAllMeetups };
};
