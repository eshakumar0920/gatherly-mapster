
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issues
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

interface MapLocation {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description?: string;
  category?: string;
  isEvent?: boolean; // Flag to distinguish between events and meetups
}

interface GoogleMapViewProps {
  locations: MapLocation[];
}

// UTD campus coordinates
const UTD_CENTER = {
  lat: 32.9886,
  lng: -96.7479
};

// Define precise building locations with exact coordinates
const BUILDING_LOCATIONS = {
  'ECSW': { lat: 32.9866, lng: -96.7511 },
  'ECSN': { lat: 32.9884, lng: -96.7517 },
  'ECSS': { lat: 32.9879, lng: -96.7511 },
  'Plinth': { lat: 32.9876, lng: -96.7485 },
  'Student Union': { lat: 32.9899, lng: -96.7501 },
  'Blackstone LaunchPad': { lat: 32.9864, lng: -96.7478 },
  'SP/N Gallery': { lat: 32.9855, lng: -96.7501 },
  'Recreation Center': { lat: 32.9874, lng: -96.7525 },
  'McDermott Library': { lat: 32.9886, lng: -96.7491 },
  'School of Management': { lat: 32.9869, lng: -96.7456 },
  'Residence Halls': { lat: 32.9922, lng: -96.7489 },
  'Activity Center': { lat: 32.9874, lng: -96.7524 },
  'Arts & Humanities': { lat: 32.9855, lng: -96.7501 },
  'Natural Sciences': { lat: 32.9866, lng: -96.7476 },
  'Founders Building': { lat: 32.9875, lng: -96.7491 },
  'Callier Center': { lat: 32.9892, lng: -96.7463 },
  'Visitor Center': { lat: 32.9854, lng: -96.7513 }
};

const GoogleMapView = ({ locations }: GoogleMapViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [allLocations, setAllLocations] = useState<MapLocation[]>([]); 
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{[key: string]: L.Marker}>({});
  
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // Fix Leaflet's default icon problem
    const DefaultIcon = L.icon({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });
    
    L.Marker.prototype.options.icon = DefaultIcon;
    
    // Initialize the map
    const map = L.map(mapContainerRef.current).setView([UTD_CENTER.lat, UTD_CENTER.lng], 14);
    
    // Add OpenStreetMap tile layer (free and no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add UTD campus boundary (approximate polygon)
    const utdBoundary = L.polygon([
      [32.9935, -96.7535] as L.LatLngTuple,
      [32.9935, -96.7435] as L.LatLngTuple,
      [32.9835, -96.7435] as L.LatLngTuple,
      [32.9835, -96.7535] as L.LatLngTuple
    ], {
      color: '#E87500', // UTD orange
      fillColor: '#E87500',
      fillOpacity: 0.1,
      weight: 2
    }).addTo(map);
    
    // Store the map reference
    mapRef.current = map;
    setIsLoading(false);
    
    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Process locations when they change
  useEffect(() => {
    // Process locations to ensure consistent coordinates
    const processedLocations = locations.map(location => {
      // Try to match building name to our precise coordinates
      for (const [buildingName, coords] of Object.entries(BUILDING_LOCATIONS)) {
        if (location.title.includes(buildingName) || 
            (location.description && location.description.includes(buildingName)) ||
            (location.category && location.category.includes(buildingName))) {
          return {
            ...location,
            lat: coords.lat,
            lng: coords.lng
          };
        }
      }
      
      // Check location field if available
      if (location.description) {
        for (const [buildingName, coords] of Object.entries(BUILDING_LOCATIONS)) {
          if (location.description.includes(buildingName)) {
            return {
              ...location,
              lat: coords.lat,
              lng: coords.lng
            };
          }
        }
      }
      
      // Return original coordinates if no match
      return location;
    });
    
    setAllLocations(processedLocations);
  }, [locations]);
  
  // Update markers when locations change
  useEffect(() => {
    if (mapRef.current && !isLoading) {
      // Clear existing markers
      Object.values(markersRef.current).forEach(marker => {
        mapRef.current?.removeLayer(marker);
      });
      markersRef.current = {};
      
      // Add new markers
      allLocations.forEach(location => {
        // Create different colored markers based on the location type
        const markerColor = location.isEvent ? "blue" : 
                           (location.category === "Sports" ? "green" : 
                            location.category === "Academic" ? "red" : 
                            location.category === "Gaming" ? "purple" : "orange");
        
        // Create custom icon with different colors
        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="background-color: white; border-radius: 50%; padding: 2px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${markerColor}" stroke="#ffffff" stroke-width="1.5">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3" fill="white"></circle>
                  </svg>
                </div>
                <div style="background-color: white; border-radius: 4px; padding: 2px 4px; font-size: 10px; margin-top: -5px; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center;">
                  ${location.title.slice(0, 15)}${location.title.length > 15 ? '...' : ''}
                </div>`,
          iconSize: [30, 45],
          iconAnchor: [15, 45],
          popupAnchor: [0, -45]
        });

        const marker = L.marker([location.lat, location.lng], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <strong>${location.title}</strong>
            ${location.description ? `<br/>${location.description}` : ''}
            ${location.category ? `<br/><i>Category: ${location.category}</i>` : ''}
            ${location.isEvent ? '<br/><i>Event</i>' : '<br/><i>Meetup</i>'}
          `);
          
        markersRef.current[location.id] = marker;
      });
    }
  }, [allLocations, isLoading]);
  
  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-gray-200">
      {isLoading ? (
        <Skeleton className="w-full h-full" />
      ) : null}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
};

export default GoogleMapView;
