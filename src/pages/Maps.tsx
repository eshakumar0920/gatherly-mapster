
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

// Define consistent locations for UTD buildings
const UTD_LOCATIONS = {
  'ECSW Building': { lat: 32.9866, lng: -96.7511 },
  'Plinth': { lat: 32.9876, lng: -96.7485 },
  'Student Union': { lat: 32.9899, lng: -96.7501 },
  'Blackstone LaunchPad': { lat: 32.9864, lng: -96.7478 },
  'SP/N Gallery': { lat: 32.9855, lng: -96.7501 },
  'Recreation Center West': { lat: 32.9874, lng: -96.7525 },
  'default': { lat: 32.9886, lng: -96.7479 } // UTD center as default
};

// Helper function to get location coordinates based on venue
const getLocationCoordinates = (locationName: string) => {
  // Try to match the location name with our predefined coordinates
  for (const [key, value] of Object.entries(UTD_LOCATIONS)) {
    if (locationName.includes(key)) {
      return value;
    }
  }
  
  // If no match, add a small offset to the default location to avoid overlap
  return {
    lat: UTD_LOCATIONS.default.lat + (Math.random() - 0.5) * 0.001, // Very small offset
    lng: UTD_LOCATIONS.default.lng + (Math.random() - 0.5) * 0.001
  };
};

const Maps = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Generate map locations from events
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setIsLoading(true);
        
        // Try to get events from API first
        try {
          const params: EventSearchParams = {
            query: searchQuery || undefined
          };
          
          const response = await eventsApi.searchEvents(params);
          
          if (!response.error && response.data && response.data.length > 0) {
            // Successfully got events from API
            const apiLocations = response.data.map(event => {
              const coords = getLocationCoordinates(event.location);
              
              return {
                id: String(event.id),
                title: event.title,
                lat: coords.lat,
                lng: coords.lng,
                description: event.description,
                isEvent: true
              };
            });
            
            setMapLocations(apiLocations);
            return;
          }
        } catch (apiError) {
          console.error("Error fetching from API, falling back to Supabase:", apiError);
          console.log("Failed to get API events, using mock data");
        }
        
        // Try Supabase if API fails
        try {
          const { data: supabaseEvents, error } = await supabase
            .from('events')
            .select('*')
            .ilike(searchQuery ? 'title' : 'id', searchQuery ? `%${searchQuery}%` : '%');
          
          if (!error && supabaseEvents && supabaseEvents.length > 0) {
            const supabaseLocations = supabaseEvents.map(event => {
              const coords = getLocationCoordinates(event.location);
              
              return {
                id: String(event.id),
                title: event.title,
                lat: coords.lat,
                lng: coords.lng,
                description: event.description || null,
                isEvent: true
              };
            });
            
            setMapLocations(supabaseLocations);
            return;
          }
        } catch (supabaseError) {
          console.error("Error fetching from Supabase, falling back to mock data:", supabaseError);
        }
        
        // Fall back to mock data if both API and Supabase fail
        const mockEvents = getEvents();
        const mockLocations = mockEvents.map(event => {
          const coords = getLocationCoordinates(event.location);
          
          return {
            id: event.id,
            title: event.title,
            lat: coords.lat,
            lng: coords.lng,
            description: event.description,
            isEvent: true
          };
        });
        
        setMapLocations(mockLocations);
      } catch (error) {
        console.error("Error loading map locations:", error);
        toast({
          title: "Error loading map",
          description: "Could not load map locations. Using mock data instead.",
          variant: "destructive"
        });
        
        // Use mock data as last resort
        const events = getEvents();
        const locations = events.map(event => {
          const coords = getLocationCoordinates(event.location);
          
          return {
            id: event.id,
            title: event.title,
            lat: coords.lat,
            lng: coords.lng,
            description: event.description,
            isEvent: true
          };
        });
        
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
