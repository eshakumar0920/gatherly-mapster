import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { eventsApi } from "@/services/api"; // <-- NEW import

export const useMeetups = (selectedCategory: string | null) => {
  const [allMeetups, setAllMeetups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMeetups = async () => {
      try {
        setIsLoading(true);

        // Use events API instead of old meetups logic
        const response = await eventsApi.getAllEvents();
        let events = Array.isArray(response.data) ? response.data : [];

        if (response.error) {
          toast({
            title: "Error fetching events",
            description: "Could not load events from the API",
            variant: "destructive"
          });
        }

        // Filter by category if provided
        const filteredEvents = selectedCategory 
          ? events.filter((e: any) => e.category?.toLowerCase() === selectedCategory.toLowerCase())
          : events;

        setAllMeetups(filteredEvents);
      } catch (error) {
        console.error("Error in fetching events:", error);
        setAllMeetups([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetups();
  }, [selectedCategory, toast]);

  return { allMeetups, isLoading, setAllMeetups };
};
