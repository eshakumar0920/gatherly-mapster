
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

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
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Fix Leaflet's default icon problem
    const DefaultIcon = L.icon({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    L.Marker.prototype.options.icon = DefaultIcon;
    
    // Initialize the map
    if (mapContainerRef.current && !mapInitialized) {
      const map = L.map(mapContainerRef.current).setView([UTD_CENTER.lat, UTD_CENTER.lng], 15);
      
      // Add OpenStreetMap tile layer (free and no API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add UTD campus boundary (approximate polygon)
      const utdBoundaryCoords = [
        [32.9935, -96.7535],
        [32.9935, -96.7435],
        [32.9835, -96.7435],
        [32.9835, -96.7535]
      ];
      
      L.polygon(utdBoundaryCoords, {
        color: "#E87500", // UTD orange
        weight: 2,
        opacity: 0.8,
        fillColor: "#E87500",
        fillOpacity: 0.1
      }).addTo(map);
      
      // Add markers for each location
      locations.forEach(location => {
        const marker = L.marker([location.lat, location.lng])
          .addTo(map)
          .bindPopup(`<strong>${location.title}</strong>${location.description ? `<br/>${location.description}` : ''}`);
          
        marker.on('click', () => {
          setSelectedLocation(location);
        });
      });
      
      // Store the map reference
      mapRef.current = map;
      setMapInitialized(true);
      
      // Handle window resize
      const handleResize = () => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      };
      
      window.addEventListener('resize', handleResize);
      // Call resize initially to ensure map renders correctly
      setTimeout(handleResize, 100);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, [locations, mapInitialized]);
  
  // Update markers when locations change
  useEffect(() => {
    if (mapRef.current && mapInitialized) {
      // Clear existing markers
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current?.removeLayer(layer);
        }
      });
      
      // Add new markers
      locations.forEach(location => {
        const marker = L.marker([location.lat, location.lng])
          .addTo(mapRef.current!)
          .bindPopup(`<strong>${location.title}</strong>${location.description ? `<br/>${location.description}` : ''}`);
          
        marker.on('click', () => {
          setSelectedLocation(location);
        });
      });
    }
  }, [locations, mapInitialized]);
  
  return (
    <div className="w-full h-full relative rounded-lg border-2 border-solid border-gray-200">
      {!mapInitialized ? (
        <Skeleton className="w-full h-full rounded-lg" />
      ) : null}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-lg"
        style={{ visibility: mapInitialized ? 'visible' : 'hidden' }}
      />
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-md shadow-md z-[1000] border border-gray-200">
          <h3 className="font-bold text-lg">{selectedLocation.title}</h3>
          {selectedLocation.description && <p className="text-sm mt-1">{selectedLocation.description}</p>}
          <button 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSelectedLocation(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleMapView;
