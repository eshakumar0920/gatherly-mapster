import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventRow, Meetup } from "@/types/meetup";
import { useToast } from "@/hooks/use-toast";
import { meetups as sampleMeetups } from "@/services/meetupService";

export const useMeetups = (selectedCategory: string | null) => {
  const [allMeetups, setAllMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMeetups = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching meetups with category filter:", selectedCategory || "all");
        
        let query = supabase.from('events').select('*, participants(*)');
        
        if (selectedCategory && selectedCategory !== 'all') {
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
          console.log("Fetched meetups from Supabase:", data);
          const databaseMeetups: Meetup[] = data.map((event: EventRow) => ({
            id: event.id.toString(),
            title: event.title,
            description: event.description || "No description available",
            dateTime: new Date(event.event_date).toISOString(),
            location: event.location,
            points: event.xp_reward || 3,
            xp_reward: event.xp_reward || 3,
            createdBy: "UTD Student",
            creatorAvatar: undefined,
            lobbySize: 5,
            category: event.category || "Other",
            attendees: (event.participants || []).map(p => ({
              ...p,
              name: `Student ${p.user_id}`
            }))
          }));
          
          setAllMeetups(databaseMeetups);
        } else {
          console.log("No meetups found in database, using sample data");
          const filteredSampleMeetups = selectedCategory && selectedCategory !== 'all'
            ? sampleMeetups.filter(m => m.category?.toLowerCase() === selectedCategory.toLowerCase())
            : sampleMeetups;
          
          setAllMeetups(filteredSampleMeetups);
        }
      } catch (error) {
        console.error("Error in fetching meetups:", error);
        const filteredSampleMeetups = selectedCategory && selectedCategory !== 'all'
          ? sampleMeetups.filter(m => m.category?.toLowerCase() === selectedCategory.toLowerCase())
          : sampleMeetups;
        setAllMeetups(filteredSampleMeetups);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeetups();
  }, [selectedCategory, toast]);

  return { allMeetups, isLoading, setAllMeetups };
};
