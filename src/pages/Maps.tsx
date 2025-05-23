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
import { campusLocations, findLocationByName } from "@/utils/campusLocations";

interface MapLocation {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description?: string;
  category?: string;
  isEvent?: boolean;
}

// Helper function to normalize text for better matching
const normalizeText = (text: string): string => {
  if (!text) return '';
  return text.trim().toLowerCase()
    .replace(/building/gi, "")
    .replace(/center/gi, "")
    .replace(/hall/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Helper function to get location coordinates based on venue with improved matching
const getLocationCoordinates = (locationName: string | null) => {
  if (!locationName) {
    // Return default UTD location if no location name provided
    const defaultLocation = campusLocations.find(loc => loc.id === 'library') || campusLocations[0];
    return { lat: defaultLocation.lat, lng: defaultLocation.lng };
  }
  
  console.log(`Maps: Looking for coordinates for "${locationName}"`);
  
  // Check for "The Plinth" directly with different variations
  if (locationName.toLowerCase().includes("plinth")) {
    const plinth = campusLocations.find(loc => loc.id === "plinth");
    if (plinth) {
      console.log(`Maps: Found direct plinth match for "${locationName}": ${plinth.name} (${plinth.lat}, ${plinth.lng})`);
      return { lat: plinth.lat, lng: plinth.lng };
    }
  }
  
  // Use the findLocationByName helper function directly
  const matchedLocation = findLocationByName(locationName);
  if (matchedLocation) {
    console.log(`Maps: Found matched location for "${locationName}": ${matchedLocation.name} (${matchedLocation.lat}, ${matchedLocation.lng})`);
    return { lat: matchedLocation.lat, lng: matchedLocation.lng };
  }
  
  // If no match found, use library as default
  const defaultLocation = campusLocations.find(loc => loc.id === "library") || campusLocations[0];
  console.log(`Maps: No location match found for "${locationName}", using library as default: (${defaultLocation.lat}, ${defaultLocation.lng})`);
  return { lat: defaultLocation.lat, lng: defaultLocation.lng };
};

const Maps = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Generate map locations from events AND meetups
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setIsLoading(true);
        console.log("Loading map locations with search query:", searchQuery || "none");
        
        // Array to collect all locations
        let allLocations: MapLocation[] = [];
        let apiEventsLoaded = false;
        
        // First try to get events from API
        try {
          console.log("Attempting to fetch events from API...");
          const params: EventSearchParams = {
            query: searchQuery || undefined
          };
          
          const response = await eventsApi.searchEvents(params);
          
          if (!response.error && response.data && Array.isArray(response.data) && response.data.length > 0) {
            // Successfully got events from API
            const apiLocations = response.data.map(event => {
              let coords;
              
              // Check if event has coordinates first
              if (event.latitude && event.longitude && 
                  event.latitude !== 0 && event.longitude !== 0) {
                coords = { lat: event.latitude, lng: event.longitude };
                console.log(`Event ${event.title} has coordinates: (${coords.lat}, ${coords.lng})`);
              } else {
                coords = getLocationCoordinates(event.location);
                console.log(`Event ${event.title} using matched coordinates: (${coords.lat}, ${coords.lng})`);
              }
              
              return {
                id: `event-${event.id}`,
                title: event.title,
                lat: coords.lat,
                lng: coords.lng,
                description: `${event.description || ''} - Location: ${event.location}`,
                category: event.category,
                isEvent: true
              };
            });
            
            console.log(`API returned ${apiLocations.length} events:`, apiLocations);
            allLocations = [...allLocations, ...apiLocations];
            apiEventsLoaded = true;
          } else {
            console.log("API did not return valid events data:", response);
          }
        } catch (apiError) {
          console.error("Error fetching events from API, falling back to Supabase:", apiError);
        }
        
        // Now try to get meetups from Supabase
        try {
          console.log("Fetching meetups from Supabase...");
          let query = supabase.from('events').select('*');
          
          if (searchQuery) {
            query = query.ilike('title', `%${searchQuery}%`);
          }
          
          const { data: supabaseEvents, error } = await query;
          
          if (!error && supabaseEvents && supabaseEvents.length > 0) {
            console.log(`Supabase returned ${supabaseEvents.length} meetups:`, supabaseEvents);
            
            const meetupLocations = supabaseEvents.map(event => {
              let coords;
              const eventData = event as any; // Type assertion to access latitude/longitude
              
              // IMPROVED: Check if event has valid coordinates first
              if (eventData.latitude && eventData.longitude && 
                  eventData.latitude !== 0 && eventData.longitude !== 0) {
                coords = { lat: eventData.latitude, lng: eventData.longitude };
                console.log(`Maps: Meetup ${event.title} using stored coordinates: (${coords.lat}, ${coords.lng})`);
              } else {
                // Find coordinates based on location name
                coords = getLocationCoordinates(event.location);
                console.log(`Maps: Meetup ${event.title} using matched coordinates for location "${event.location}": (${coords.lat}, ${coords.lng})`);
              }
              
              return {
                id: `meetup-${event.id}`,
                title: event.title,
                lat: coords.lat,
                lng: coords.lng,
                description: `${event.description || ''} - Location: ${event.location}`,
                category: event.category || "Other",
                isEvent: false
              };
            });
            
            allLocations = [...allLocations, ...meetupLocations];
          } else {
            console.log("No meetups from Supabase or error:", error);
          }
        } catch (supabaseError) {
          console.error("Error fetching from Supabase, falling back to mock data:", supabaseError);
        }
        
        // If no events loaded from API and no locations at all, try mock data
        if ((!apiEventsLoaded || allLocations.length === 0)) {
          console.log("No events found from API or Supabase, loading mock events data...");
          // Load mock events as a fallback
          const mockEvents = getEvents();
          const mockLocations = mockEvents.map(event => {
            // Get coordinates based on location
            const coords = getLocationCoordinates(event.location);
            
            return {
              id: `mock-${event.id}`,
              title: event.title,
              lat: coords.lat,
              lng: coords.lng,
              description: `${event.description} - Location: ${event.location}`,
              category: event.category,
              isEvent: true
            };
          });
          
          console.log(`Added ${mockLocations.length} mock events`);
          allLocations = [...allLocations, ...mockLocations];
        }
        
        // Debug: Log all locations to help identify issues
        console.log("Processing map locations:", allLocations.length);
        allLocations.forEach(location => {
          console.log("Processing location:", {
            id: location.id,
            title: location.title,
            coordinates: `${location.lat},${location.lng}`,
            description: location.description
          });
        });
        
        setMapLocations(allLocations);
        setIsLoading(false);
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
            id: `mock-${event.id}`,
            title: event.title,
            lat: coords.lat,
            lng: coords.lng,
            description: `${event.description} - Location: ${event.location}`,
            category: event.category,
            isEvent: true
          };
        });
        
        setMapLocations(locations);
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
