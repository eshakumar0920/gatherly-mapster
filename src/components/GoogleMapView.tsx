
import { useState, useCallback, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";

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

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
  border: "2px solid #cbd5e1"
};

// UTD campus coordinates
const UTD_CENTER = {
  lat: 32.9886,
  lng: -96.7479
};

const GoogleMapView = ({ locations }: GoogleMapViewProps) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  
  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBNLrJhOMSuJbMN4UPoqXw3CFH-1XBjCFA", // Using a public API key with restrictions
    libraries: ["places"]
  });
  
  const onMapClick = useCallback(() => {
    setSelectedLocation(null);
  }, []);
  
  // Map reference to allow for programmatic control
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  const onLoad = useCallback((map: google.maps.Map) => {
    // Add UTD campus boundary (approximate polygon)
    const utdBoundaryCoords = [
      { lat: 32.9935, lng: -96.7535 },
      { lat: 32.9935, lng: -96.7435 },
      { lat: 32.9835, lng: -96.7435 },
      { lat: 32.9835, lng: -96.7535 }
    ];
    
    const utdBoundary = new google.maps.Polygon({
      paths: utdBoundaryCoords,
      strokeColor: "#E87500", // UTD orange
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#E87500",
      fillOpacity: 0.1,
    });
    
    utdBoundary.setMap(map);
    setMap(map);
  }, []);
  
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);
  
  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      if (map) {
        const center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
      }
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);
  
  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center text-red-500">
          Error loading Google Maps. Please check your internet connection or try again later.
        </div>
      </div>
    );
  }
  
  if (!isLoaded) {
    return (
      <div className="w-full h-full">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    );
  }
  
  return (
    <div className="w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={UTD_CENTER}
        zoom={16}
        onClick={onMapClick}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi.business",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => setSelectedLocation(location)}
            animation={google.maps.Animation.DROP}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new google.maps.Size(40, 40)
            }}
          />
        ))}
        
        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div className="p-2 max-w-[200px]">
              <h3 className="font-bold">{selectedLocation.title}</h3>
              {selectedLocation.description && <p className="text-sm mt-1">{selectedLocation.description}</p>}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapView;
