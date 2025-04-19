
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import GoogleMapView from "@/components/GoogleMapView";
import Navigation from "@/components/Navigation";
import { getEvents } from "@/services/eventService";
import { useToast } from "@/hooks/use-toast";
import { EventSearchParams, eventsApi } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";

interface MapLocation {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description?: string;
}

const Maps = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Generate map locations from events with better error handling
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setIsLoading(true);
        console.log("Loading map locations...");
        
        // Try to get events from API first
        try {
          console.log("Attempting to fetch from API...");
          const params: EventSearchParams = {
            query: searchQuery || undefined
          };
          
          const response = await eventsApi.searchEvents(params);
          
          if (!response.error && response.data && response.data.length > 0) {
            // Successfully got events from API
            console.log("Successfully got API data:", response.data);
            const apiLocations = response.data.map(event => ({
              id: String(event.id),
              title: event.title,
              // Generate locations around UTD
              lat: 32.9886 + (Math.random() - 0.5) * 0.01,
              lng: -96.7479 + (Math.random() - 0.5) * 0.01,
              description: event.description,
              isEvent: true
            }));
            
            setMapLocations(apiLocations);
            console.log("Using provided location data:", apiLocations);
            return;
          }
        } catch (apiError) {
          console.error("Error fetching from API, falling back to Supabase:", apiError);
        }
        
        // Try Supabase if API fails
        try {
          console.log("Attempting to fetch from Supabase...");
          let query = supabase.from('events').select('*');
          
          // Apply search filter if available
          if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
          }
          
          const { data: supabaseEvents, error } = await query;
          
          if (!error && supabaseEvents && supabaseEvents.length > 0) {
            console.log("Successfully got Supabase data:", supabaseEvents);
            const supabaseLocations = supabaseEvents.map(event => ({
              id: String(event.id),
              title: event.title,
              // Generate locations around UTD
              lat: 32.9886 + (Math.random() - 0.5) * 0.01,
              lng: -96.7479 + (Math.random() - 0.5) * 0.01,
              description: event.description || null,
              isEvent: true
            }));
            
            setMapLocations(supabaseLocations);
            console.log("Using provided location data:", supabaseLocations);
            return;
          } else {
            console.log("Supabase error or no results:", error);
          }
        } catch (supabaseError) {
          console.error("Error fetching from Supabase, falling back to mock data:", supabaseError);
        }
        
        // Fall back to mock data if both API and Supabase fail
        console.log("Using mock data as fallback");
        const mockEvents = getEvents();
        const mockLocations = mockEvents.map(event => ({
          id: event.id,
          title: event.title,
          // Generate locations around UTD
          lat: 32.9886 + (Math.random() - 0.5) * 0.01,
          lng: -96.7479 + (Math.random() - 0.5) * 0.01,
          description: event.description,
          isEvent: true
        }));
        
        setMapLocations(mockLocations);
        console.log("Using provided location data:", mockLocations);
      } catch (error) {
        console.error("Error loading map locations:", error);
        toast({
          title: "Error loading map",
          description: "Could not load map locations. Using mock data instead.",
          variant: "destructive"
        });
        
        // Use mock data as last resort
        const events = getEvents();
        const locations = events.map(event => ({
          id: event.id,
          title: event.title,
          lat: 32.9886 + (Math.random() - 0.5) * 0.01,
          lng: -96.7479 + (Math.random() - 0.5) * 0.01,
          description: event.description,
          isEvent: true
        }));
        
        setMapLocations(locations);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLocations();
  }, [searchQuery, toast]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // The effect will run because searchQuery changed
  };

  // Filter locations based on search query - client-side filtering as backup
  const filteredLocations = mapLocations.filter(location => 
    !searchQuery || 
    location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (location.description && location.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      <header className="p-4">
        <h1 className="text-2xl font-bold">Campus Map</h1>
        <p className="text-muted-foreground">Find events and locations</p>
      </header>

      <div className="px-4 pb-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search locations..." 
              className="pl-10 rounded-full bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      <div className="px-4 flex-1 pb-20">
        {isLoading ? (
          <div className="w-full h-full min-h-[400px]">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ) : (
          <div className="w-full h-full min-h-[400px]">
            <GoogleMapView locations={filteredLocations} />
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Maps;
