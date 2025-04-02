
import { useState, useEffect } from "react";
import { MapPin, Navigation2 } from "lucide-react";

interface MapLocation {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description?: string;
}

// UTD campus key locations
const utdLocations: MapLocation[] = [
  {
    id: "src",
    title: "Student Union",
    lat: 32.7563,
    lng: -96.7695,
    description: "Campus hub with dining options and study spaces"
  },
  {
    id: "library",
    title: "McDermott Library",
    lat: 32.7573,
    lng: -96.7683,
    description: "Main campus library with study spaces"
  },
  {
    id: "ecss",
    title: "ECSS Building",
    lat: 32.7565,
    lng: -96.7675,
    description: "Engineering and Computer Science buildings"
  },
  {
    id: "ssom",
    title: "School of Management",
    lat: 32.7585,
    lng: -96.7665,
    description: "Business school with classrooms and offices"
  },
  {
    id: "residence",
    title: "Residence Halls",
    lat: 32.7590,
    lng: -96.7705,
    description: "On-campus student housing"
  },
  {
    id: "activity",
    title: "Activity Center",
    lat: 32.7555,
    lng: -96.7710,
    description: "Recreation center with gym and athletic facilities"
  }
];

const MapView = ({ locations = [] }: { locations?: MapLocation[] }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [showUTDLocations, setShowUTDLocations] = useState(true);
  
  // Combine UTD locations with event locations
  const allLocations = showUTDLocations 
    ? [...utdLocations, ...locations]
    : locations;

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location === selectedLocation ? null : location);
  };

  const toggleUTDLocations = () => {
    setShowUTDLocations(!showUTDLocations);
  };
  
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      {!mapLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">Loading UTD campus map...</div>
        </div>
      ) : (
        <div className="w-full h-full relative">
          {/* UTD Campus Map Background */}
          <div className="absolute inset-0 bg-[url('https://www.utdallas.edu/maps/img/campus-map.jpg')] bg-cover bg-center"></div>
          
          {/* Map controls */}
          <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-10">
            <button 
              onClick={toggleUTDLocations} 
              className="text-xs flex items-center gap-1 text-blue-600"
            >
              <Navigation2 className="h-3 w-3" />
              {showUTDLocations ? "Hide Campus Locations" : "Show Campus Locations"}
            </button>
          </div>
          
          {/* Map pins */}
          {allLocations.map((location) => (
            <div 
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ 
                left: `${20 + Math.random() * 60}%`, 
                top: `${20 + Math.random() * 60}%` 
              }}
              onClick={() => handleLocationClick(location)}
            >
              <div className="flex flex-col items-center">
                <MapPin 
                  className={`h-6 w-6 ${location === selectedLocation ? 'text-green-500' : 'text-event-primary'} 
                  ${utdLocations.find(l => l.id === location.id) ? '' : 'animate-bounce'}`} 
                />
                <div 
                  className={`mt-1 bg-white px-2 py-1 rounded-md shadow-md text-xs transition-all duration-200
                  ${location === selectedLocation ? 'opacity-100 scale-100' : 'opacity-80 scale-95'}`}
                >
                  {location.title}
                </div>
                
                {/* Location details */}
                {location === selectedLocation && location.description && (
                  <div className="mt-2 bg-white p-2 rounded-md shadow-md text-xs max-w-[200px] z-10">
                    {location.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapView;
