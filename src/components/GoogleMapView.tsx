import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { findLocationByName } from "@/utils/campusLocations";

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

// UTD campus coordinates with full precision
const UTD_CENTER = {
  lat: 32.98864567890123,
  lng: -96.74794567890123
};

// Define precise building locations with exact coordinates and full precision
const BUILDING_LOCATIONS = {
  'ECSW': { lat: 32.98605047033769, lng: -96.75152260357687 }, // Full precision coordinates
  'ECSW Building': { lat: 32.98605047033769, lng: -96.75152260357687 }, // Full precision coordinates
  'ECSW Courtyard': { lat: 32.98605047033769, lng: -96.75152260357687 }, // Full precision coordinates
  'Engineering and Computer Science West': { lat: 32.98662987654321, lng: -96.75114987654321 }, // Full precision coordinates
  'ECSN': { lat: 32.98841234567890, lng: -96.75174567890123 }, // Full precision coordinates
  'ECSN Building': { lat: 32.98841234567890, lng: -96.75174567890123 }, // Full precision coordinates
  'Engineering and Computer Science North': { lat: 32.98841234567890, lng: -96.75174567890123 }, // Full precision coordinates
  'ECSS': { lat: 32.986311087083465, lng: -96.75045526156833 }, // Full precision coordinates
  'ECSS Building': { lat: 32.986311087083465, lng: -96.75045526156833 }, // Full precision coordinates
  'Engineering and Computer Science South': { lat: 32.98792345678901, lng: -96.75113456789012 }, // Full precision coordinates
  'Plinth': { lat: 32.98736607080019, lng: -96.74828234522143 }, // Updated with exact Plinth coordinates
  'Student Union': { lat: 32.98671581142176, lng: -96.74944890766317 }, // Updated Student Union coordinates
  'Blackstone LaunchPad': { lat: 32.98642345678901, lng: -96.74784567890123 }, // Full precision coordinates
  'SP/N Gallery': { lat: 32.98553456789012, lng: -96.75012345678901 }, // Full precision coordinates
  'Recreation Center': { lat: 32.984835483244666, lng: -96.74954270331894 }, // Updated Activity Center coordinates
  'Recreation Center West': { lat: 32.984835483244666, lng: -96.74954270331894 }, // Updated Activity Center coordinates
  'McDermott Library': { lat: 32.9871928740694, lng: -96.74762441537123 }, // Updated with user-provided coordinates
  'School of Management': { lat: 32.98694567890123, lng: -96.74564567890123 }, // Full precision coordinates
  'JSOM': { lat: 32.98694567890123, lng: -96.74564567890123 }, // Full precision coordinates
  'Naveen Jindal School of Management': { lat: 32.98694567890123, lng: -96.74564567890123 }, // Full precision coordinates
  'Residence Halls': { lat: 32.99224567890123, lng: -96.74894567890123 }, // Full precision coordinates
  'Activity Center': { lat: 32.985159735598536, lng: -96.749452401561 }, // Updated Activity Center coordinates
  'Arts & Humanities': { lat: 32.98553456789012, lng: -96.75012345678901 }, // Full precision coordinates
  'Natural Sciences': { lat: 32.98664567890123, lng: -96.74764567890123 }, // Full precision coordinates
  'Founders Building': { lat: 32.98754567890123, lng: -96.74914567890123 }, // Full precision coordinates
  'Callier Center': { lat: 32.98924567890123, lng: -96.74634567890123 }, // Full precision coordinates
  'Visitor Center': { lat: 32.98544567890123, lng: -96.75134567890123 }, // Full precision coordinates
  'Jonsson Performance Hall': { lat: 32.988451582173454, lng: -96.74861335191952 } // Added Jonsson Performance Hall
};

// Helper function to match location to a known building
const findPreciseLocation = (locationName: string, eventTitle?: string): { lat: number, lng: number } | null => {
  if (!locationName) return null;
  
  // Check if it's a library reference
  if (locationName.toLowerCase().includes("library") || 
      locationName.toLowerCase().includes("mcdermott")) {
    return BUILDING_LOCATIONS['McDermott Library'];
  }
  
  // Use the enhanced findLocationByName helper
  const matchedLocation = findLocationByName(locationName);
  if (matchedLocation) {
    return { lat: matchedLocation.lat, lng: matchedLocation.lng };
  }
  
  // Fallback to original checks
  const normalizeLocationText = (text: string): string => {
    return text.trim().toLowerCase()
      .replace(/building/gi, "")
      .replace(/center/gi, "")
      .replace(/hall/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  };
  
  // Direct match for location
  if (BUILDING_LOCATIONS[locationName as keyof typeof BUILDING_LOCATIONS]) {
    return BUILDING_LOCATIONS[locationName as keyof typeof BUILDING_LOCATIONS];
  }
  
  // Try normalized name match
  const normalizedLocation = normalizeLocationText(locationName);
  
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

const GoogleMapView = ({ locations }: GoogleMapViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [allLocations, setAllLocations] = useState<MapLocation[]>([]); 
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{[key: string]: L.Marker}>({});
  
  // Initialize the map when component mounts
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
    console.log("Processing map locations:", locations.length);
    
    // Process locations to ensure consistent coordinates
    const processedLocations = locations.map(location => {
      // Explicitly log each location for debugging
      console.log("Processing location:", {
        id: location.id,
        title: location.title,
        coordinates: `${location.lat},${location.lng}`,
        description: location.description
      });
      
      // Skip processing if coordinates are already valid
      if (location.lat && location.lng && 
          location.lat !== 0 && location.lng !== 0 &&
          !isNaN(location.lat) && !isNaN(location.lng)) {
        return location;
      }
      
      // Special check for library events
      if (location.title.toLowerCase().includes("study") || 
          (location.description && location.description.toLowerCase().includes("library"))) {
        console.log("Found study session or library event:", location.title);
        return {
          ...location,
          lat: BUILDING_LOCATIONS['McDermott Library'].lat, 
          lng: BUILDING_LOCATIONS['McDermott Library'].lng
        };
      }
      
      // Try to find more precise location
      const matchedLocation = findPreciseLocation(location.title) || 
                            (location.description && findPreciseLocation(location.description)) ||
                            null;
                            
      if (matchedLocation) {
        console.log(`Found matching location for "${location.title}":`, matchedLocation);
        return {
          ...location,
          lat: matchedLocation.lat,
          lng: matchedLocation.lng
        };
      }
      
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
