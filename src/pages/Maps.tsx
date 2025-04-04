
import { useState } from "react";
import { Search, List, Layers, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MapView from "@/components/MapView";
import Navigation from "@/components/Navigation";
import { getEvents } from "@/services/eventService";

const Maps = () => {
  const events = getEvents();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Convert events to map locations with random coordinates around UTD
  const UTD_CENTER_LAT = 32.9886;
  const UTD_CENTER_LNG = -96.7479;
  
  const mapLocations = events.map(event => ({
    id: event.id,
    title: event.title,
    // Generate random coordinates near UTD for demonstration
    lat: UTD_CENTER_LAT + (Math.random() - 0.5) * 0.01,
    lng: UTD_CENTER_LNG + (Math.random() - 0.5) * 0.01,
    description: event.description
  }));

  // Filter locations based on search query
  const filteredLocations = searchQuery 
    ? mapLocations.filter(location => 
        location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (location.description && location.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : mapLocations;

  return (
    <div className="pb-20 h-screen flex flex-col">
      {/* App Name */}
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      {/* Header */}
      <header className="p-4">
        <h1 className="text-2xl font-bold">UTD Campus Map</h1>
        <p className="text-muted-foreground">Find events and locations at UT Dallas</p>
      </header>

      {/* Search bar */}
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

      {/* Map controls */}
      <div className="px-4 pb-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Layers className="h-4 w-4 mr-2" />
          Campus Buildings
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <MapPin className="h-4 w-4 mr-2" />
          Points of Interest
        </Button>
      </div>

      {/* Map */}
      <div className="px-4 flex-1">
        <MapView locations={filteredLocations} />
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Maps;
