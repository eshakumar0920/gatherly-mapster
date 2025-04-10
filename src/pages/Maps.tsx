import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Search, Layers, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GoogleMapView from "@/components/GoogleMapView";
import Navigation from "@/components/Navigation";
import { getEvents } from "@/services/eventService";
import { useToast } from "@/hooks/use-toast";

interface MapLocation {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description?: string;
}

interface MeetupRow {
  meetup_id: number;
  title: string;
  description: string | null;
  location: string;
  lat: number | null;
  lng: number | null;
  event_time: string;
  created_at: string | null;
  creator_id: number;
  image: string | null;
  category: string | null;
}

const Maps = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [showPOI, setShowPOI] = useState(true);
  const { toast } = useToast();
  
  const generateRandomCoordinateNear = (center: number) => {
    return center + (Math.random() - 0.5) * 0.01;
  };
  
  const generateMockLocations = (events: any[]) => {
    const UTD_CENTER_LAT = 32.9886;
    const UTD_CENTER_LNG = -96.7479;
    
    return events.map(event => ({
      id: event.id,
      title: event.title,
      lat: UTD_CENTER_LAT + (Math.random() - 0.5) * 0.01,
      lng: UTD_CENTER_LNG + (Math.random() - 0.5) * 0.01,
      description: event.description
    }));
  };
  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching location data...");
        const { data, error } = await supabase.from('meetups').select('*');
        
        if (error) {
          console.error("Error fetching locations:", error);
          toast({
            title: "Error fetching locations",
            description: "Could not load location data from the database",
            variant: "destructive"
          });
          
          const events = getEvents();
          const mockLocations = generateMockLocations(events);
          setMapLocations(mockLocations);
          return;
        }
        
        if (data && data.length > 0) {
          console.log("Found location data:", data.length);
          const locations: MapLocation[] = (data as MeetupRow[]).map(meetup => ({
            id: meetup.meetup_id.toString(),
            title: meetup.title,
            lat: meetup.lat || generateRandomCoordinateNear(32.9886),
            lng: meetup.lng || generateRandomCoordinateNear(-96.7479),
            description: meetup.description || undefined
          }));
          
          setMapLocations(locations);
        } else {
          console.log("No location data found, using mock data");
          const events = getEvents();
          const mockLocations = generateMockLocations(events);
          setMapLocations(mockLocations);
        }
      } catch (error) {
        console.error("Error in location fetching:", error);
        const events = getEvents();
        const mockLocations = generateMockLocations(events);
        setMapLocations(mockLocations);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLocations();
  }, [toast]);

  const filteredLocations = searchQuery 
    ? mapLocations.filter(location => 
        location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (location.description && location.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : mapLocations;

  const toggleBuildings = () => {
    setShowBuildings(!showBuildings);
  };
  
  const togglePOI = () => {
    setShowPOI(!showPOI);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      <header className="p-4">
        <h1 className="text-2xl font-bold">UTD Campus Map</h1>
        <p className="text-muted-foreground">Find events and locations at UT Dallas</p>
      </header>

      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search UTD locations..." 
            className="pl-10 rounded-full bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-2">
        <Button 
          variant="yellow" 
          size="sm" 
          className="flex-1 gap-1.5"
          onClick={toggleBuildings}
        >
          <Layers className="h-4 w-4" />
          <span>Campus Buildings</span>
        </Button>
        <Button 
          variant="yellow" 
          size="sm" 
          className="flex-1 gap-1.5"
          onClick={togglePOI}
        >
          <MapPin className="h-4 w-4" />
          <span>Events</span>
        </Button>
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
