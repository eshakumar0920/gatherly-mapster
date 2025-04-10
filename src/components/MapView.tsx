
import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation2 } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapLocation {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description?: string;
}

// UTD campus coordinates
const UTD_CENTER = [32.9886, -96.7479]; // Latitude and longitude of UTD center

// UTD campus key locations with actual coordinates
const utdLocations: MapLocation[] = [
  {
    id: "src",
    title: "Student Union",
    lat: 32.9899,
    lng: -96.7501,
    description: "Student Union with dining options, study spaces and recreation areas"
  },
  {
    id: "library",
    title: "McDermott Library",
    lat: 32.9886,
    lng: -96.7491,
    description: "Main campus library with study spaces and resources"
  },
  {
    id: "ecss",
    title: "ECSS Building",
    lat: 32.9879,
    lng: -96.7511,
    description: "Engineering and Computer Science South building with classrooms and labs"
  },
  {
    id: "ecsn",
    title: "ECSN Building",
    lat: 32.9884,
    lng: -96.7517,
    description: "Engineering and Computer Science North building"
  },
  {
    id: "ssom",
    title: "School of Management",
    lat: 32.9869,
    lng: -96.7456,
    description: "Naveen Jindal School of Management with classrooms and offices"
  },
  {
    id: "residence",
    title: "Residence Halls",
    lat: 32.9922,
    lng: -96.7489,
    description: "On-campus student housing"
  },
  {
    id: "activity",
    title: "Activity Center",
    lat: 32.9874,
    lng: -96.7524,
    description: "Recreation center with gym and athletic facilities"
  },
  {
    id: "arts",
    title: "Arts & Humanities",
    lat: 32.9855,
    lng: -96.7501,
    description: "Arts and Humanities buildings and performance spaces"
  },
  {
    id: "sciences",
    title: "Natural Sciences",
    lat: 32.9866,
    lng: -96.7476,
    description: "Science buildings with classrooms and laboratories"
  },
  {
    id: "founders",
    title: "Founders Building",
    lat: 32.9875,
    lng: -96.7491,
    description: "One of the original campus buildings"
  },
  {
    id: "callier",
    title: "Callier Center",
    lat: 32.9892,
    lng: -96.7463,
    description: "Center for communication disorders research and treatment"
  },
  {
    id: "visitors",
    title: "Visitor Center",
    lat: 32.9854,
    lng: -96.7513,
    description: "Campus visitor center and admissions office"
  }
];

const MapView = ({ locations = [] }: { locations?: MapLocation[] }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [showUTDLocations, setShowUTDLocations] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  // Combine UTD locations with event locations
  const allLocations = showUTDLocations 
    ? [...utdLocations, ...locations]
    : locations;

  // Initialize the map when component mounts
  useEffect(() => {
    // Make sure the map container exists before initializing
    if (!mapRef.current && mapContainerRef.current) {
      try {
        console.log("Initializing map...");
        // Create map instance with a timeout to ensure container is ready
        setTimeout(() => {
          // Double-check that the component is still mounted
          if (mapContainerRef.current) {
            const map = L.map(mapContainerRef.current, {
              zoomControl: true,
              attributionControl: true
            }).setView(UTD_CENTER as L.LatLngExpression, 16);
            
            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors | UTD Campus Map'
            }).addTo(map);
            
            // Add UTD campus boundary (approximate polygon)
            const utdBoundary = L.polygon([
              [32.9935, -96.7535],
              [32.9935, -96.7435],
              [32.9835, -96.7435],
              [32.9835, -96.7535]
            ], {
              color: '#E87500', // UTD orange
              fillColor: '#E87500',
              fillOpacity: 0.1,
              weight: 2
            }).addTo(map);
            
            // Store map instance in ref
            mapRef.current = map;
            
            // Create a layer group for markers
            markersLayerRef.current = L.layerGroup().addTo(map);
            
            setMapLoaded(true);
            console.log("Map initialized successfully");
            
            // Force a resize event to make sure the map loads correctly
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.invalidateSize();
              }
            }, 500);
          }
        }, 100);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }
    
    return () => {
      // Clean up map when component unmounts
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []); // Empty dependency array for initialization

  // Update markers when locations or selected location changes
  useEffect(() => {
    if (mapLoaded && mapRef.current && markersLayerRef.current) {
      console.log("Updating markers, locations count:", allLocations.length);
      
      // Clear existing markers
      markersLayerRef.current.clearLayers();
      
      // Add markers for all locations
      allLocations.forEach(location => {
        const isSelected = selectedLocation && selectedLocation.id === location.id;
        const isUTDLocation = utdLocations.some(l => l.id === location.id);
        
        // Create marker
        const marker = L.marker([location.lat, location.lng], {
          icon: L.divIcon({
            className: 'custom-map-marker',
            html: `<div class="flex flex-col items-center">
                    <div class="${isSelected ? 'text-green-500' : isUTDLocation ? 'text-orange-500' : 'text-primary'} 
                      ${!isUTDLocation ? 'animate-bounce' : ''}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div class="mt-1 bg-white px-2 py-1 rounded-md shadow-md text-xs ${isSelected ? 'font-bold' : ''}">
                      ${location.title}
                    </div>
                   </div>`,
            iconSize: [40, 60],
            iconAnchor: [20, 60],
          })
        });
        
        // Add popup for description if available
        if (location.description) {
          marker.bindPopup(`<b>${location.title}</b><br>${location.description}`);
          
          if (isSelected) {
            marker.openPopup();
          }
        }
        
        // Add click handler
        marker.on('click', () => {
          setSelectedLocation(location === selectedLocation ? null : location);
        });
        
        // Add marker to layer group
        markersLayerRef.current?.addLayer(marker);
      });
      
      // Force map update to display markers
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }
  }, [mapLoaded, allLocations, selectedLocation]);

  // Add a resize event listener to update the map when window size changes
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleUTDLocations = () => {
    setShowUTDLocations(!showUTDLocations);
  };
  
  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      {!mapLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse">Loading UTD campus map...</div>
        </div>
      ) : (
        <>
          <div ref={mapContainerRef} className="w-full h-full z-0"></div>
          
          {/* Map controls */}
          <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-10">
            <button 
              onClick={toggleUTDLocations} 
              className="text-xs flex items-center gap-1 text-blue-600"
            >
              <Navigation2 className="h-3 w-3" />
              {showUTDLocations ? "Hide Campus Buildings" : "Show Campus Buildings"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MapView;
