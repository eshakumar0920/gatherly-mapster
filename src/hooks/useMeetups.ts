import { useState, useEffect } from "react";
import { Meetup } from "@/types/meetup";
import { useToast } from "@/hooks/use-toast";
import { useMeetupService } from "@/services/flaskService";

export const useMeetups = (selectedCategory: string | null) => {
  const [allMeetups, setAllMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { fetchMeetups, searchMeetups } = useMeetupService();

  useEffect(() => {
    const loadMeetups = async () => {
      try {
        setIsLoading(true);
        
        let meetupsData;
        if (selectedCategory) {
          // If a category is selected, use the search endpoint
          meetupsData = await searchMeetups({ category: selectedCategory });
        } else {
          // Otherwise fetch all meetups
          meetupsData = await fetchMeetups();
        }
        
        setAllMeetups(meetupsData as Meetup[]);
      } catch (error) {
        console.error("Error in fetching meetups:", error);
        toast({
          title: "Error fetching meetups",
          description: "Could not load meetups from the server",
          variant: "destructive"
        });
        setAllMeetups([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMeetups();
  }, [selectedCategory, toast, fetchMeetups, searchMeetups]);

  return { allMeetups, isLoading, setAllMeetups };
};
