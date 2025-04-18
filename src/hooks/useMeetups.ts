
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
        
        const { data: rawData, error } = await query;
        
        if (error) {
          console.error("Error fetching meetups:", error);
          toast({
            title: "Error fetching meetups",
            description: "Could not load meetups from the database",
            variant: "destructive"
          });
          return;
        }
        
        if (rawData && rawData.length > 0) {
          const supabaseMeetups = rawData.map((event) => {
            const typedEvent = event as EventRow;
            const meetup: Meetup = {
              id: typedEvent.id.toString(),
              title: typedEvent.title,
              description: typedEvent.description || "No description available",
              dateTime: new Date(typedEvent.event_date).toLocaleString(),
              location: typedEvent.location,
              points: typedEvent.xp_reward || 3,
              createdBy: "Student",
              creatorAvatar: undefined,
              lobbySize: 5,
              category: typedEvent.category || "Other",
              attendees: []
            };
            return meetup;
          });
          
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
