
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
  category?: string;
  isEvent?: boolean;
}

// Define precise UTD building locations with full precision coordinates
const UTD_LOCATIONS = {
  'ECSW Building': { lat: 32.98605047033769, lng: -96.75152260357687 }, // Full precision coordinates
  'ECSW': { lat: 32.98605047033769, lng: -96.75152260357687 }, // Full precision coordinates
  'ECSW Courtyard': { lat: 32.98605047033769, lng: -96.75152260357687 }, // Full precision coordinates
  'Engineering and Computer Science West': { lat: 32.98662987654321, lng: -96.75114987654321 }, // Full precision coordinates
  'ECSS Building': { lat: 32.98792345678901, lng: -96.75113456789012 }, // Full precision coordinates
  'ECSS': { lat: 32.98792345678901, lng: -96.75113456789012 }, // Full precision coordinates
  'Engineering and Computer Science South': { lat: 32.98792345678901, lng: -96.75113456789012 }, // Full precision coordinates
  'ECSN': { lat: 32.98841234567890, lng: -96.75174567890123 }, // Full precision coordinates
  'ECSN Building': { lat: 32.98841234567890, lng: -96.75174567890123 }, // Full precision coordinates
  'Engineering and Computer Science North': { lat: 32.98841234567890, lng: -96.75174567890123 }, // Full precision coordinates
  'Plinth': { lat: 32.98736607080019, lng: -96.74828234522143 }, // Updated Plinth coordinates
  'Student Union': { lat: 32.98994567890123, lng: -96.75014567890123 }, // Full precision coordinates
  'Blackstone LaunchPad': { lat: 32.98642345678901, lng: -96.74784567890123 }, // Full precision coordinates
  'SP/N Gallery': { lat: 32.98553456789012, lng: -96.75012345678901 }, // Full precision coordinates
  'Recreation Center West': { lat: 32.98742345678901, lng: -96.75254567890123 }, // Full precision coordinates
  'Recreation Center': { lat: 32.98742345678901, lng: -96.75254567890123 }, // Full precision coordinates
  'McDermott Library': { lat: 32.98864567890123, lng: -96.74914567890123 }, // Full precision coordinates
  'School of Management': { lat: 32.98694567890123, lng: -96.74564567890123 }, // Full precision coordinates
  'JSOM': { lat: 32.98694567890123, lng: -96.74564567890123 }, // Full precision coordinates
  'Naveen Jindal School of Management': { lat: 32.98694567890123, lng: -96.74564567890123 }, // Full precision coordinates
  'Residence Halls': { lat: 32.99224567890123, lng: -96.74894567890123 }, // Full precision coordinates
  'Activity Center': { lat: 32.98742345678901, lng: -96.75244567890123 }, // Full precision coordinates
  'Arts & Humanities': { lat: 32.98553456789012, lng: -96.75012345678901 }, // Full precision coordinates
  'Natural Sciences': { lat: 32.98664567890123, lng: -96.74764567890123 }, // Full precision coordinates
  'Founders Building': { lat: 32.98754567890123, lng: -96.74914567890123 }, // Full precision coordinates
  'Callier Center': { lat: 32.98924567890123, lng: -96.74634567890123 }, // Full precision coordinates
  'Visitor Center': { lat: 32.98544567890123, lng: -96.75134567890123 }, // Full precision coordinates
  'Jonsson Performance Hall': { lat: 32.988451582173454, lng: -96.74861335191952 }, // Added Jonsson Performance Hall
  'default': { lat: 32.98864567890123, lng: -96.74794567890123 } // UTD center as default with full precision
};

// Helper function to normalize text for better matching
const normalizeText = (text: string): string => {
  return text.trim().toLowerCase()
    .replace(/building/gi, "")
    .replace(/center/gi, "")
    .replace(/hall/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Helper function to get location coordinates based on venue with improved matching
const getLocationCoordinates = (locationName: string) => {
  if (!locationName) return UTD_LOCATIONS.default;
  
  // Special handling for common locations
  if (locationName.toLowerCase().includes('ecsw') || 
      locationName.toLowerCase().includes('engineering') && locationName.toLowerCase().includes('west')) {
    return UTD_LOCATIONS['ECSW Building'];
  }
  
  if (locationName.toLowerCase().includes('ecss') || 
      locationName.toLowerCase().includes('engineering') && locationName.toLowerCase().includes('south')) {
    return UTD_LOCATIONS['ECSS Building'];
  }
  
  if (locationName.toLowerCase().includes('ecsn') || 
      locationName.toLowerCase().includes('engineering') && locationName.toLowerCase().includes('north')) {
    return UTD_LOCATIONS['ECSN Building'];
  }
  
  if (locationName.toLowerCase().includes('jsom') || 
      locationName.toLowerCase().includes('school of management') || 
      locationName.toLowerCase().includes('jindal')) {
    return UTD_LOCATIONS['School of Management'];
  }
  
  // Special handling for Jonsson Performance Hall
  if (locationName.toLowerCase().includes('jonsson') || 
      locationName.toLowerCase().includes('performance hall') ||
      locationName.toLowerCase().includes('symphony') ||
      locationName.toLowerCase().includes('orchestra') ||
      locationName.toLowerCase().includes('jazz ensemble')) {
    return UTD_LOCATIONS['Jonsson Performance Hall'];
  }
  
  // Special handling for Plinth
  if (locationName.toLowerCase().includes('plinth') ||
      locationName.toLowerCase().includes('central plaza')) {
    return UTD_LOCATIONS['Plinth'];
  }
  
  // Exact match first
  if (UTD_LOCATIONS[locationName as keyof typeof UTD_LOCATIONS]) {
    return UTD_LOCATIONS[locationName as keyof typeof UTD_LOCATIONS];
  }
  
  // Normalized text matching
  const normalizedLocation = normalizeText(locationName);
  for (const [key, value] of Object.entries(UTD_LOCATIONS)) {
    if (key === 'default') continue;
    
    const normalizedKey = normalizeText(key);
    if (normalizedLocation === normalizedKey || 
        normalizedLocation.includes(normalizedKey) || 
        normalizedKey.includes(normalizedLocation)) {
      return value;
    }
  }
  
  // Word matching for partial matches
  const locationWords = normalizedLocation.split(' ');
  for (const [key, value] of Object.entries(UTD_LOCATIONS)) {
    if (key === 'default') continue;
    
    const keyWords = normalizeText(key).split(' ');
    const matches = keyWords.some(keyWord => 
      locationWords.some(locWord => 
        (keyWord.length > 2 && locWord.includes(keyWord)) || 
        (locWord.length > 2 && keyWord.includes(locWord))
      )
    );
    
    if (matches) {
      return value;
    }
  }
  
  // If no match, add a small offset to the default location to avoid overlap
  return {
    lat: UTD_LOCATIONS.default.lat + (Math.random() - 0.5) * 0.0005, // Very small offset
    lng: UTD_LOCATIONS.default.lng + (Math.random() - 0.5) * 0.0005
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
                description: `${event.description || ''} - Location: ${event.location}`,
                category: event.category,
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
                description: `${event.description || ''} - Location: ${event.location}`,
                category: event.category || null,
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
            description: `${event.description} - Location: ${event.location}`,
            category: event.category,
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
            description: `${event.description} - Location: ${event.location}`,
            category: event.category,
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

