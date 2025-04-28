
import { useState, useEffect } from "react";
import { Meetup } from "@/types/meetup";
import { useToast } from "@/hooks/use-toast";
import { useMeetupService } from "@/services/flaskService";

export const useMeetups = (selectedCategory: string | null) => {
  const [allMeetups, setAllMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { fetchMeetups, searchMeetups } = useMeetupService();

  useEffect(() => {
    const loadMeetups = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let meetupsData;
        if (selectedCategory) {
          console.log(`Searching meetups with category: ${selectedCategory}`);
          // If a category is selected, use the search endpoint
          meetupsData = await searchMeetups({ category: selectedCategory });
        } else {
          console.log('Fetching all meetups');
          // Otherwise fetch all meetups
          meetupsData = await fetchMeetups();
        }
        
        console.log('Received meetups data:', meetupsData);
        
        if (!meetupsData) {
          console.warn('No meetups data received');
          setAllMeetups([]);
          setError('No meetups data was returned from the server');
          return;
        }
        
        if (!Array.isArray(meetupsData)) {
          console.warn('Received invalid meetups data type:', typeof meetupsData);
          setAllMeetups([]);
          setError('Received invalid data format from server');
          return;
        }
        
        // Successfully received array of meetups
        setAllMeetups(meetupsData as Meetup[]);
      } catch (error) {
        console.error("Error in fetching meetups:", error);
        setError(error instanceof Error ? error.message : 'Could not load meetups from the server');
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

  return { allMeetups, isLoading, error, setAllMeetups };
};
