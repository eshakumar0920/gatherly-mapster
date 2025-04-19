
import { useState, useEffect } from "react";
import { Search, Filter, Calendar, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import EventCard from "@/components/EventCard";
import Navigation from "@/components/Navigation";
import { getEvents, categories } from "@/services/eventService";
import { useToast } from "@/hooks/use-toast";
import { eventsApi, EventSearchParams } from "@/services/api";

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [events, setEvents] = useState(getEvents());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to search events
  const searchEvents = async () => {
    setIsLoading(true);
    
    try {
      const params: EventSearchParams = {
        query: searchQuery,
        location: locationFilter || undefined,
        date_from: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        date_to: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      };
      
      const response = await eventsApi.searchEvents(params);
      
      if (response.error) {
        toast({
          title: "Search Error",
          description: response.error,
          variant: "destructive"
        });
        // Fall back to mock data on error
        console.log("Failed to get API events, using mock data");
        
        // Apply filters to mock data as a fallback
        let filteredMockEvents = getEvents();
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredMockEvents = filteredMockEvents.filter(event => 
            event.title.toLowerCase().includes(query) || 
            event.description.toLowerCase().includes(query)
          );
        }
        
        if (locationFilter) {
          const location = locationFilter.toLowerCase();
          filteredMockEvents = filteredMockEvents.filter(event =>
            event.location.toLowerCase().includes(location)
          );
        }
        
        if (startDate) {
          filteredMockEvents = filteredMockEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= startDate;
          });
        }
        
        if (endDate) {
          filteredMockEvents = filteredMockEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate <= endDate;
          });
        }
        
        if (selectedCategory !== "all") {
          filteredMockEvents = filteredMockEvents.filter(event => 
            event.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
        
        setEvents(filteredMockEvents);
      } else {
        // Successfully got events from API
        setEvents(response.data || []);
      }
    } catch (error) {
      console.error("Error searching events:", error);
      toast({
        title: "Search Error",
        description: "Failed to search events",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events by category after they're loaded
  const filteredEvents = selectedCategory !== "all"
    ? events.filter(event => event.category.toLowerCase() === selectedCategory.toLowerCase())
    : events;

  // Search when filters change
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchEvents();
    }, 500); // Debounce searches
    
    return () => clearTimeout(delaySearch);
  }, [selectedCategory]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setLocationFilter("");
    setStartDate(null);
    setEndDate(null);
    setSelectedCategory("all");
  };

  // Handle search button click
  const handleSearch = () => {
    searchEvents();
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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      {/* Filter options */}
      <div className="px-4 pb-4 flex flex-wrap gap-2">
        {/* Location filter */}
        <div className="relative">
          <Input
            placeholder="Location" 
            className="pl-8 w-full max-w-[180px]"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>

        {/* Date range picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {startDate ? (
                endDate ? (
                  <span>
                    {format(startDate, "MMM d")} - {format(endDate, "MMM d")}
                  </span>
                ) : (
                  <span>From {format(startDate, "MMM d")}</span>
                )
              ) : (
                <span>Date Range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <div className="p-3">
              <h4 className="font-medium mb-2">Select Range</h4>
              <div className="grid gap-2">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Start date</div>
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">End date</div>
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={date => !startDate || date < startDate}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                    }}
                  >
                    Clear
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSearch}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Search button */}
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>

        {/* Clear filters button - only show when filters are applied */}
        {(searchQuery || locationFilter || startDate || endDate || selectedCategory !== "all") && (
          <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

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
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Events;
