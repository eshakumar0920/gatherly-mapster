
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { eventsApi } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

export const useMeetups = (selectedCategory: string | null) => {
  const [allMeetups, setAllMeetups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isLoggedIn, user } = useAuth(); // Add authentication state

  useEffect(() => {
    const fetchMeetups = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching meetups with auth state:", { isLoggedIn });

        // Don't check login status here, just fetch the events
        // The API will handle unauthorized access
        
        // Use events API
        const response = await eventsApi.getAllEvents();
        let events = Array.isArray(response.data) ? response.data : [];

        if (response.error) {
          console.error("Error fetching events:", response.error);
          toast({
            title: "Error fetching events",
            description: "Could not load events from the API. " + 
                         (response.error?.includes("fetch") ? "Server connection issue." : response.error),
            variant: "destructive"
          });
          
          // Provide some sample data when API fails
          events = getSampleMeetupData();
        }

        console.log("Events before filtering:", events);
        console.log("Selected category:", selectedCategory);

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
