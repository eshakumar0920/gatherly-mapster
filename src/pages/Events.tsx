
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEvents, categories } from "@/services/eventService";
import { useToast } from "@/hooks/use-toast";
import { eventsApi } from "@/services/api";
import EventCard from "@/components/EventCard";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>(getEvents());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to search events
  const searchEvents = async () => {
    setIsLoading(true);
    
    try {
      const response = await eventsApi.searchEvents({ query: searchQuery });
      
      if (response.error) {
        // Fall back to mock data on error
        console.log("Failed to get API events, using mock data");
        
        // Filter mock data based on search query
        let filteredMockEvents = getEvents();
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredMockEvents = filteredMockEvents.filter(event => 
            event.title.toLowerCase().includes(query) || 
            event.description.toLowerCase().includes(query)
          );
        }
        
        if (selectedCategory !== "all") {
          filteredMockEvents = filteredMockEvents.filter(event => 
            event.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
        
        setEvents(filteredMockEvents);
      } else {
        // Successfully got events from API
        const eventArray = Array.isArray(response.data) ? response.data : [];
        console.log("Events from API:", eventArray);
        setEvents(eventArray);
      }
    } catch (error) {
      console.error("Error searching events:", error);
      // Fallback to mock events on error
      setEvents(getEvents());
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events by category
  const filteredEvents = selectedCategory !== "all" && Array.isArray(events)
    ? events.filter(event => event.category && event.category.toLowerCase() === selectedCategory.toLowerCase())
    : events;

  // Search when filters change
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchEvents();
    }, 500); // Debounce searches
    
    return () => clearTimeout(delaySearch);
  }, [selectedCategory, searchQuery]);

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  // Handle click on event card
  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

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

      {/* Clear filters button - only show when filters are applied */}
      {(searchQuery || selectedCategory !== "all") && (
        <div className="px-4 pb-4">
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        </div>
      )}

      {/* Categories Tabs */}
      <div className="px-4 pb-4">
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id.toLowerCase()}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Events List */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse">Loading events...</div>
          </div>
        ) : Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events found matching your criteria.</p>
            <button 
              onClick={clearFilters}
              className="mt-4 text-sm text-foreground hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Events;
