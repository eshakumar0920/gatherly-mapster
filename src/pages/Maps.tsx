
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import GoogleMapView from "@/components/GoogleMapView";
import Navigation from "@/components/Navigation";
import { getEvents } from "@/services/eventService";

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
  
  // Generate map locations from events
  useEffect(() => {
    const loadLocations = () => {
      try {
        setIsLoading(true);
        
        // Get events data and convert to map locations
        const events = getEvents();
        const locations = events.map(event => ({
          id: event.id,
          title: event.title,
          // Generate locations around UTD
          lat: 32.9886 + (Math.random() - 0.5) * 0.01,
          lng: -96.7479 + (Math.random() - 0.5) * 0.01,
          description: event.description
        }));
        
        setMapLocations(locations);
      } catch (error) {
        console.error("Error loading map locations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLocations();
  }, []);

  // Filter locations based on search query
  const filteredLocations = searchQuery 
    ? mapLocations.filter(location => 
        location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (location.description && location.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : mapLocations;

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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search locations..." 
            className="pl-10 rounded-full bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
