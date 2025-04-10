
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
}

interface GoogleMapViewProps {
  locations: MapLocation[];
}

// UTD campus coordinates
const UTD_CENTER = {
  lat: 32.9886,
  lng: -96.7479
};

const GoogleMapView = ({ locations }: GoogleMapViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
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
  
  // Update markers when locations change
  useEffect(() => {
    if (mapRef.current && !isLoading) {
      // Clear existing markers
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current?.removeLayer(layer);
        }
      });
      
      // Add new markers
      locations.forEach(location => {
        L.marker([location.lat, location.lng])
          .addTo(mapRef.current!)
          .bindPopup(`<strong>${location.title}</strong>${location.description ? `<br/>${location.description}` : ''}`);
      });
    }
  }, [locations, isLoading]);
  
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
