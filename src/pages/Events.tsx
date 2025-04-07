
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "@/components/EventCard";
import Navigation from "@/components/Navigation";
import { getEvents, categories } from "@/services/eventService";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  category: string;
}

// Define the type for the data returned from Supabase
interface MeetupRow {
  meetup_id: number;
  title: string;
  description: string | null;
  event_time: string;
  location: string;
  image: string | null;
  category: string | null;
  created_at: string | null;
  creator_id: number;
  lat: number | null;
  lng: number | null;
}

const Events = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        // Query the meetups table in Supabase
        const { data, error } = await supabase.from('meetups').select('*');
        
        if (error) {
          console.error("Error fetching events:", error);
          toast({
            title: "Error fetching events",
            description: "Could not load event data from the database",
            variant: "destructive"
          });
          
          // Fall back to mock data if there's an error
          setEvents(getEvents());
          return;
        }
        
        if (data && data.length > 0) {
          // Map Supabase data to event structure
          const mappedEvents: Event[] = (data as MeetupRow[]).map(item => ({
            id: item.meetup_id.toString(),
            title: item.title,
            description: item.description || "No description available",
            // Use a placeholder image if none is provided
            image: item.image || "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
            date: new Date(item.event_time).toLocaleDateString(),
            time: new Date(item.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: item.location,
            // Default to a generic category if none specified
            category: item.category || "Event" 
          }));
          
          setEvents(mappedEvents);
        } else {
          // Fall back to mock data if no data is returned
          setEvents(getEvents());
        }
      } catch (error) {
        console.error("Error in event fetching:", error);
        // Fall back to mock data on any error
        setEvents(getEvents());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Filter events by category and search query
  const filteredEvents = events.filter(event => {
    // Filter by type
    if (filter !== "all" && event.category.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="pb-20">
      {/* App Name */}
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      {/* Header */}
      <header className="p-4">
        <h1 className="text-2xl font-bold">UTD Events</h1>
        <p className="text-muted-foreground">Browse student-led events across campus</p>
      </header>

      {/* Search bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search events..." 
            className="pl-10 rounded-full bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-4">
        <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Events List */}
      <div className="px-4">
        {isLoading ? (
          <div className="text-center py-12">
            <p>Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events found matching your criteria.</p>
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setFilter("all");
                    setSearchQuery("");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Events;
