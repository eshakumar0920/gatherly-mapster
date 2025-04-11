
import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "@/components/EventCard";
import Navigation from "@/components/Navigation";
import { categories } from "@/services/eventService";
import { useToast } from "@/hooks/use-toast";
import { useEventService } from "@/services/flaskService";
import { Event as EventCardType } from "@/components/EventCard";
import { FlaskEvent } from "@/services/types/flaskTypes";

const Events = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<EventCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchEvents } = useEventService();
  const { toast } = useToast();
  
  // Fetch events from Flask API
  useEffect(() => {
    const getEventsData = async () => {
      setIsLoading(true);
      try {
        // Search query becomes the 'q' parameter for backend
        const params: { q?: string } = {};
        if (searchQuery) params.q = searchQuery;
        
        const flaskEvents = await fetchEvents(params);
        
        // Map backend events to format expected by EventCard component
        const mappedEvents: EventCardType[] = flaskEvents.map((event: FlaskEvent) => ({
          id: String(event.id),
          title: event.title,
          description: event.description,
          image: event.image_url || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80", // Default image
          date: new Date(event.event_date).toLocaleDateString(),
          time: new Date(event.event_date).toLocaleTimeString(),
          location: event.location,
          category: event.category || "Event" // Default category if not provided
        }));
        
        setEvents(mappedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description: "Failed to load events. Using mock data instead.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getEventsData();
  }, [searchQuery, fetchEvents, toast]);
  
  // Filter events by category
  const filteredEvents = events.filter(event => {
    // Filter by type
    if (filter !== "all" && event.category.toLowerCase() !== filter.toLowerCase()) {
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
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p>Loading events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
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

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Events;
