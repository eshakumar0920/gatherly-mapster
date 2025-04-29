
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
  'ECSW Building': { lat: 32.98605047033769, lng: -96.75152260357687 },
  'ECSW Courtyard': { lat: 32.98605047033769, lng: -96.75152260357687 },
  'Engineering and Computer Science West': { lat: 32.9866, lng: -96.7511 },
  'ECSN': { lat: 32.9884, lng: -96.7517 },
  'ECSN Building': { lat: 32.9884, lng: -96.7517 },
  'Engineering and Computer Science North': { lat: 32.9884, lng: -96.7517 },
  'ECSS': { lat: 32.9879, lng: -96.7511 },
  'ECSS Building': { lat: 32.9879, lng: -96.7511 },
  'Engineering and Computer Science South': { lat: 32.9879, lng: -96.7511 },
  'Plinth': { lat: 32.9876, lng: -96.7485 },
  'Student Union': { lat: 32.9899, lng: -96.7501 },
  'Blackstone LaunchPad': { lat: 32.9864, lng: -96.7478 },
  'SP/N Gallery': { lat: 32.9855, lng: -96.7501 },
  'Recreation Center': { lat: 32.9874, lng: -96.7525 },
  'Recreation Center West': { lat: 32.9874, lng: -96.7525 },
  'McDermott Library': { lat: 32.9886, lng: -96.7491 },
  'School of Management': { lat: 32.9869, lng: -96.7456 },
  'JSOM': { lat: 32.9869, lng: -96.7456 },
  'Naveen Jindal School of Management': { lat: 32.9869, lng: -96.7456 },
  'Residence Halls': { lat: 32.9922, lng: -96.7489 },
  'Activity Center': { lat: 32.9874, lng: -96.7524 },
  'Arts & Humanities': { lat: 32.9855, lng: -96.7501 },
  'Natural Sciences': { lat: 32.9866, lng: -96.7476 },
  'Founders Building': { lat: 32.9875, lng: -96.7491 },
  'Callier Center': { lat: 32.9892, lng: -96.7463 },
  'Visitor Center': { lat: 32.9854, lng: -96.7513 }
};

// Manual mapping for specific events
const EVENT_LOCATION_OVERRIDES = {
  "UTD Hackathon 2025": { lat: 32.98605047033769, lng: -96.75152260357687 }, // Updated ECSW Building exact location
  "Comet Concert Series": { lat: 32.9876, lng: -96.7485 }, // Plinth exact location
  "International Food Festival": { lat: 32.9899, lng: -96.7501 }, // Student Union exact location
  "Student Entrepreneur Showcase": { lat: 32.9864, lng: -96.7478 }, // Blackstone LaunchPad
  "Student Art Showcase": { lat: 32.9855, lng: -96.7501 }, // SP/N Gallery
  "Wellness Wednesday": { lat: 32.9874, lng: -96.7525 } // Recreation Center West
};

const GoogleMapView = ({ locations }: GoogleMapViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [allLocations, setAllLocations] = useState<MapLocation[]>([]); 
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{[key: string]: L.Marker}>({});
  
  // Helper function to clean up location text for better matching
  const normalizeLocationText = (text: string): string => {
    return text.trim().toLowerCase()
      .replace(/building/gi, "")
      .replace(/center/gi, "")
      .replace(/hall/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  };
  
  // Improved function to find matching building coordinates
  const findBuildingCoordinates = (locationText: string, eventTitle?: string): { lat: number, lng: number } | null => {
    if (!locationText && !eventTitle) return null;
    
    // First check if we have a direct override for this event title
    if (eventTitle && EVENT_LOCATION_OVERRIDES[eventTitle as keyof typeof EVENT_LOCATION_OVERRIDES]) {
      return EVENT_LOCATION_OVERRIDES[eventTitle as keyof typeof EVENT_LOCATION_OVERRIDES];
    }
    
    // Direct match for location
    if (BUILDING_LOCATIONS[locationText as keyof typeof BUILDING_LOCATIONS]) {
      return BUILDING_LOCATIONS[locationText as keyof typeof BUILDING_LOCATIONS];
    }
    
    // Try normalized name match
    const normalizedLocation = normalizeLocationText(locationText);
    
    for (const [buildingName, coords] of Object.entries(BUILDING_LOCATIONS)) {
      const normalizedBuildingName = normalizeLocationText(buildingName);
      
      if (normalizedLocation === normalizedBuildingName) {
        return coords;
      }
      
      if (normalizedLocation.includes(normalizedBuildingName) || 
          normalizedBuildingName.includes(normalizedLocation)) {
        return coords;
      }
    }
    
    // Check for abbreviations
    const locationWords = normalizedLocation.split(' ');
    for (const [buildingName, coords] of Object.entries(BUILDING_LOCATIONS)) {
      const buildingWords = normalizeLocationText(buildingName).split(' ');
      
      // Check if any word is an abbreviation of the building
      const hasMatch = locationWords.some(word => 
        buildingWords.some(buildingWord => 
          (word.length > 2 && buildingWord.startsWith(word)) || 
          (buildingWord.length > 2 && word.startsWith(buildingWord))
        )
      );
      
      if (hasMatch) {
        return coords;
      }
    }
    
    // Special hardcoded cases
    if (normalizedLocation.includes("ecsw") || normalizedLocation.includes("engineering") && normalizedLocation.includes("west")) {
      return BUILDING_LOCATIONS["ECSW Courtyard"];
    }
    
    if (normalizedLocation.includes("ecss") || normalizedLocation.includes("engineering") && normalizedLocation.includes("south")) {
      return BUILDING_LOCATIONS["ECSS Building"];
    }
    
    if (normalizedLocation.includes("ecsn") || normalizedLocation.includes("engineering") && normalizedLocation.includes("north")) {
      return BUILDING_LOCATIONS["ECSN Building"];
    }
    
    return null;
  };
  
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
      // First check direct event title overrides
      if (EVENT_LOCATION_OVERRIDES[location.title as keyof typeof EVENT_LOCATION_OVERRIDES]) {
        const overrideCoords = EVENT_LOCATION_OVERRIDES[location.title as keyof typeof EVENT_LOCATION_OVERRIDES];
        return {
          ...location,
          lat: overrideCoords.lat,
          lng: overrideCoords.lng
        };
      }
      
      // Try to find building coordinates from title or description
      let buildingCoords = null;
      
      // Check title first
      buildingCoords = findBuildingCoordinates(location.title, location.title);
      if (buildingCoords) {
        return {
          ...location,
          lat: buildingCoords.lat,
          lng: buildingCoords.lng
        };
      }
      
      // Check description if available
      if (location.description) {
        buildingCoords = findBuildingCoordinates(location.description, location.title);
        if (buildingCoords) {
          return {
            ...location,
            lat: buildingCoords.lat,
            lng: buildingCoords.lng
          };
        }
      }
      
      // Check location field if it's embedded in description
      if (location.description && location.description.includes("Location:")) {
        const locationMatch = location.description.match(/Location:\s*([^,\.]+)/i);
        if (locationMatch && locationMatch[1]) {
          buildingCoords = findBuildingCoordinates(locationMatch[1], location.title);
          if (buildingCoords) {
            return {
              ...location,
              lat: buildingCoords.lat,
              lng: buildingCoords.lng
            };
          }
        }
      }
      
      // If no match found and has a category, try to infer from category
      if (location.category) {
        buildingCoords = findBuildingCoordinates(location.category, location.title);
        if (buildingCoords) {
          return {
            ...location,
            lat: buildingCoords.lat,
            lng: buildingCoords.lng
          };
        }
      }
      
      // Return original coordinates if no match found
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
                            location.category === "Gaming" ? "purple" : 
                            location.category === "Technology" ? "teal" : "orange");
        
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
        
        // Extract building name from location for displaying in popup
        let buildingName = "";
        if (location.description && location.description.includes("Location:")) {
          const locationMatch = location.description.match(/Location:\s*([^,\.]+)/i);
          if (locationMatch && locationMatch[1]) {
            buildingName = locationMatch[1].trim();
          }
        }

        const marker = L.marker([location.lat, location.lng], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <strong>${location.title}</strong>
            ${location.description ? `<br/>${location.description}` : ''}
            ${buildingName ? `<br/><b>Building:</b> ${buildingName}` : ''}
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
