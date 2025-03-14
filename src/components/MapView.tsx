
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

interface MapLocation {
  id: string;
  title: string;
  lat: number;
  lng: number;
}

const MapView = ({ locations = [] }: { locations?: MapLocation[] }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // This is a placeholder for the actual map implementation
  // In a real app, we would integrate with a mapping library like Mapbox or Google Maps
  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      {!mapLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">Loading map...</div>
        </div>
      ) : (
        <div className="w-full h-full bg-[#e8f0f6] relative">
          {/* This is a simple map placeholder */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=1920&q=80')] bg-cover opacity-50"></div>
          
          {/* Map pins */}
          {locations.map((location) => (
            <div 
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${30 + Math.random() * 40}%`, 
                top: `${30 + Math.random() * 40}%` 
              }}
            >
              <div className="flex flex-col items-center">
                <MapPin className="h-6 w-6 text-event-primary animate-bounce" />
                <div className="mt-1 bg-white px-2 py-1 rounded-md shadow-md text-xs">
                  {location.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapView;
