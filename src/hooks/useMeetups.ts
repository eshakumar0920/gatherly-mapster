
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { eventsApi } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useMeetups = (selectedCategory: string | null) => {
  const [allMeetups, setAllMeetups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    const fetchMeetups = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching meetups with auth state:", { isLoggedIn });
        
        // First try the enhanced API method that has better error handling
        const response = await eventsApi.getAllEventsWithFallback();
        
        // Check if we need to fall back to Supabase
        if (response.error === "API_FALLBACK_TO_SUPABASE") {
          console.log("API request failed, falling back to Supabase");
          
          try {
            // Try to fetch from Supabase directly
            const { data: supabaseData, error: supabaseError } = await supabase
              .from('events')
              .select('*');
            
            if (supabaseError) {
              throw supabaseError;
            }
            
            console.log("Successfully fetched data from Supabase:", supabaseData);
            
            // Transform Supabase data to match the expected format
            const events = supabaseData.map(event => ({
              id: event.id,
              title: event.title,
              description: event.description || "No description available",
              dateTime: new Date(event.event_date).toLocaleString(),
              location: event.location,
              points: event.xp_reward || 3,
              createdBy: "Student",
              lobbySize: 5,
              category: event.category || "Other",
              attendees: []
            }));
            
            console.log("Events before filtering:", events);
            
            // Filter by category if provided
            const filteredEvents = selectedCategory 
              ? events.filter((e: any) => {
                  const eventCategory = (e.category || '').toLowerCase();
                  const filterCategory = selectedCategory.toLowerCase();
                  console.log(`Comparing: '${eventCategory}' with '${filterCategory}'`);
                  return eventCategory === filterCategory;
                })
              : events;
            
            setAllMeetups(filteredEvents);
            return; // Exit early since we've handled the data
          } catch (supabaseError) {
            console.error("Supabase fallback also failed:", supabaseError);
            // Continue to sample data fallback
          }
        } else if (response.data) {
          // Normal API success case
          let events = Array.isArray(response.data) ? response.data : [];
          console.log("Events before filtering:", events);
          
          // Filter by category if provided
          const filteredEvents = selectedCategory 
            ? events.filter((e: any) => {
                const eventCategory = (e.category || '').toLowerCase();
                const filterCategory = selectedCategory.toLowerCase();
                console.log(`Comparing: '${eventCategory}' with '${filterCategory}'`);
                return eventCategory === filterCategory;
              })
            : events;
          
          console.log("Filtered events:", filteredEvents);
          setAllMeetups(filteredEvents);
          return; // Exit early since we've handled the data
        }
        
        // If we reach here, both API and Supabase failed, use sample data
        console.log("Both API and Supabase failed, using sample data");
        toast({
          title: "Error fetching events",
          description: "Could not connect to either API or database. Using sample data instead.",
          variant: "destructive"
        });
        setAllMeetups(getSampleMeetupData());
        
      } catch (error) {
        console.error("Error in fetching events:", error);
        setAllMeetups(getSampleMeetupData());
        toast({
          title: "Error fetching events",
          description: "An unexpected error occurred. Using sample data instead.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetups();
  }, [selectedCategory, toast, isLoggedIn]); // Add isLoggedIn to dependencies

  // Function to provide sample data when API fails
  const getSampleMeetupData = () => {
    return [
      {
        id: "sample-1",
        title: "Study Group: Computer Science",
        description: "Weekly study group for computer science students",
        dateTime: new Date().toLocaleString(),
        location: "Library Room 204",
        points: 5,
        createdBy: "Student",
        lobbySize: 10,
        category: "Academic"
      },
      {
        id: "sample-2",
        title: "Gaming in the Library",
        description: "Join us for board games and video games in the library",
        dateTime: new Date(Date.now() + 86400000).toLocaleString(),
        location: "Library Commons",
        points: 3,
        createdBy: "Student",
        lobbySize: 15,
        category: "Technology"
      },
      {
        id: "sample-3",
        title: "Fitness Club Meetup",
        description: "Weekly fitness club meetup for all students",
        dateTime: new Date(Date.now() + 172800000).toLocaleString(),
        location: "Student Recreation Center",
        points: 4,
        createdBy: "Student",
        lobbySize: 8,
        category: "Sports"
      }
    ];
  };

  return { allMeetups, isLoading, setAllMeetups };
};
