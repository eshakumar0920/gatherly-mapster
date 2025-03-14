
import { useState } from "react";
import { Search, List, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MapView from "@/components/MapView";
import Navigation from "@/components/Navigation";
import { getEvents } from "@/services/eventService";

const Maps = () => {
  const events = getEvents();
  
  // Convert events to map locations
  const mapLocations = events.map(event => ({
    id: event.id,
    title: event.title,
    lat: 0, // In a real app, we would have actual coordinates
    lng: 0
  }));

  return (
    <div className="pb-20 h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 pt-6">
        <h1 className="text-2xl font-bold">Event Map</h1>
        <p className="text-muted-foreground">Find events around you</p>
      </header>

      {/* Search bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search locations..." 
            className="pl-10 rounded-full bg-muted/50"
          />
        </div>
      </div>

      {/* Map controls */}
      <div className="px-4 pb-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Layers className="h-4 w-4 mr-2" />
          Layers
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <List className="h-4 w-4 mr-2" />
          List View
        </Button>
      </div>

      {/* Map */}
      <div className="px-4 flex-1">
        <MapView locations={mapLocations} />
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Maps;
