
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
    lat: 32.98671581142176,
    lng: -96.74944890766317,
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
    lat: 32.986311087083465,
    lng: -96.75045526156833,
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
    lat: 32.984835483244666,
    lng: -96.74954270331894,
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
  },
  {
    id: "jonsson",
    title: "Jonsson Performance Hall",
    lat: 32.988451582173454,
    lng: -96.74861335191952,
    description: "Performance venue for concerts and orchestral events"
  },
  {
    id: "jonsson_jazz", // Added a new ID for the Jazz Ensemble location
    title: "Jonsson Performance Hall (Jazz)",
    lat: 32.988451582173454 + 0.0001,
    lng: -96.74861335191952 - 0.0001,
    description: "Performance venue for jazz ensemble concerts"
  },
  {
    id: "plinth",
    title: "The Plinth",
    lat: 32.98736607080019,
    lng: -96.74828234522143,
    description: "Central outdoor gathering space for campus events"
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

  // Fix Leaflet icon issue
  useEffect(() => {
    // This fixes the missing icon issue in Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  // Initialize the map when component mounts
  useEffect(() => {
    console.log("Map initialization effect running");
    console.log("Map container exists:", !!mapContainerRef.current);
    
    // Cleanup function to remove the map when component unmounts
    const cleanupMap = () => {
      if (mapRef.current) {
        console.log("Cleaning up map");
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
      }
    };

    // Function to initialize the map with a delay
    const initMapWithDelay = () => {
      console.log("Attempting to initialize map with delay");
      setTimeout(() => {
        initMap();
      }, 300);
    };

    // Function to initialize the map
    const initMap = () => {
      // Make sure the map container exists and the map hasn't been initialized yet
      if (!mapRef.current && mapContainerRef.current) {
        try {
          console.log("Initializing map... Container exists:", !!mapContainerRef.current);
          console.log("Container dimensions:", mapContainerRef.current.offsetWidth, "x", mapContainerRef.current.offsetHeight);
          
          if (mapContainerRef.current.offsetWidth === 0 || mapContainerRef.current.offsetHeight === 0) {
            console.log("Container has zero dimension, retrying later");
            initMapWithDelay();
            return;
          }
          
          // Create map instance
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
              mapRef.current.invalidateSize(true);
              console.log("Map resized after initial timeout");
            }
          }, 300);
          
          // Additional resize after a delay
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize(true);
              console.log("Map resized after second timeout");
            }
          }, 1000);
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      }
    };
    
    // Attempt to initialize the map
    if (mapContainerRef.current && !mapRef.current) {
      console.log("Initial map initialization attempt");
      initMap();
    }
    
    // Set up resize handler
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize(true);
        console.log("Map resized due to window resize");
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Try again after a short delay if initial attempt fails
    const retryTimer = setTimeout(() => {
      if (!mapLoaded && mapContainerRef.current) {
        console.log("Retrying map initialization...");
        cleanupMap(); // Clean up any partial initialization
        initMap();
      }
    }, 1000);
    
    return () => {
      clearTimeout(retryTimer);
      window.removeEventListener('resize', handleResize);
      cleanupMap();
    };
  }, []); 

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
        mapRef.current.invalidateSize(true);
      }
    }
  }, [mapLoaded, allLocations, selectedLocation]);

  const toggleUTDLocations = () => {
    setShowUTDLocations(!showUTDLocations);
  };
  
  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex-1 rounded-lg overflow-hidden border border-gray-200">
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <div className="animate-pulse">Loading UTD campus map...</div>
              <div className="text-xs text-gray-500 mt-2">
                If the map doesn't load, please refresh the page
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <div 
              ref={mapContainerRef} 
              className="absolute inset-0 z-0"
              style={{ minHeight: "400px", border: "2px solid #cbd5e1" }}
            ></div>
            
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
