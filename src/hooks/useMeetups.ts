
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { eventsApi } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

export const useMeetups = (selectedCategory: string | null) => {
  const [allMeetups, setAllMeetups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    const fetchMeetups = async () => {
      try {
        setIsLoading(true);

        // Check if user is logged in before fetching
        if (!isLoggedIn) {
          console.log("User not logged in, will not fetch events");
          setAllMeetups([]);
          setIsLoading(false);
          return;
        }

        console.log(`Fetching events with category filter: ${selectedCategory}`);
        
        // Use events API instead of old meetups logic
        const response = await eventsApi.getAllEvents();
        console.log("Events API response:", response);
        
        let events = Array.isArray(response.data) ? response.data : [];
        
        if (response.error) {
          toast({
            title: "Error fetching events",
            description: "Could not load events from the API",
            variant: "destructive"
          });
        }

        // Apply category filtering - make this case insensitive and normalize categories
        if (selectedCategory) {
          console.log(`Filtering events by category: ${selectedCategory}`);
          // Convert both the category and the filter to lowercase for case-insensitive comparison
          const filteredEvents = events.filter((e: any) => {
            const eventCategory = e.category ? e.category.toLowerCase() : '';
            const filterCategory = selectedCategory.toLowerCase();
            const matches = eventCategory === filterCategory;
            console.log(`Event "${e.title}" with category "${eventCategory}" matches "${filterCategory}": ${matches}`);
            return matches;
          });
          setAllMeetups(filteredEvents);
        } else {
          setAllMeetups(events);
        }
        
        console.log("Final filtered events:", selectedCategory ? events.filter((e: any) => e.category?.toLowerCase() === selectedCategory.toLowerCase()) : events);
      } catch (error) {
        console.error("Error in fetching events:", error);
        setAllMeetups([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetups();
  }, [selectedCategory, toast, isLoggedIn]);

  return { allMeetups, isLoading, setAllMeetups };
};
