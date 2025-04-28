
import { useState, useEffect } from "react";
import { Meetup } from "@/types/meetup";
import { useToast } from "@/hooks/use-toast";
import { meetupsApi } from "@/services/api";

export const useMeetups = (selectedCategory: string | null) => {
  const [allMeetups, setAllMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMeetups = async () => {
      try {
        setIsLoading(true);
        const response = await meetupsApi.getAllMeetups();
        
        if (response.error) {
          console.error("Error fetching meetups:", response.error);
          toast({
            title: "Error fetching meetups",
            description: "Could not load meetups from the server",
            variant: "destructive"
          });
          setAllMeetups([]);
          return;
        }
        
        if (response.data && Array.isArray(response.data)) {
          // Map backend "event" model to our frontend "meetup" model
          const mappedMeetups: Meetup[] = response.data.map(event => ({
            id: event.id.toString(),
            title: event.title,
            description: event.description || "No description available",
            dateTime: event.event_date || event.dateTime,
            location: event.location,
            points: event.xp_reward || event.points || 3,
            createdBy: event.creator_name || event.createdBy || "Anonymous",
            creatorAvatar: event.creator_avatar || event.creatorAvatar,
            lobbySize: event.lobby_size || event.lobbySize || 5,
            category: event.category || "Other",
            attendees: event.attendees || []
          }));
          
          // Filter by category if one is selected
          const filteredMeetups = selectedCategory 
            ? mappedMeetups.filter(m => m.category?.toLowerCase() === selectedCategory.toLowerCase())
            : mappedMeetups;
          
          setAllMeetups(filteredMeetups);
        } else {
          setAllMeetups([]);
        }
      } catch (error) {
        console.error("Error in fetching meetups:", error);
        setAllMeetups([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeetups();
  }, [selectedCategory, toast]);

  return { allMeetups, isLoading, setAllMeetups };
};
