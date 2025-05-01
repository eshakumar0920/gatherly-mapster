
import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Update the MapLocation interface to include both name and title fields for compatibility
export interface MapLocation {
  id: string;
  name?: string;
  title?: string; // Make title optional to match the usage in MeetupLobby
  lat: number;
  lng: number;
  description?: string;
}

interface MapViewProps {
  locations: MapLocation[];
  defaultLocation?: MapLocation;
}

// Fix Leaflet icon issue for webpack
// This is needed because Leaflet's default icon paths are broken in bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView: React.FC<MapViewProps> = ({ locations, defaultLocation }) => {
  const mapRef = useRef<MapContainer>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    if (mapRef.current && !mapInitialized) {
      setMapInitialized(true);
    }
  }, [mapRef, mapInitialized]);

  // Custom hook to recenter the map based on the provided locations
  function RecenterMap({ locations }: { locations: MapLocation[] }) {
    const map = useMap();
    useEffect(() => {
      if (locations && locations.length > 0) {
        // If there's only one location, just set the view to that location
        if (locations.length === 1) {
          map.setView([locations[0].lat, locations[0].lng], 15);
        } else {
          // Create a LatLngBounds object to contain all the locations
          const bounds = new L.LatLngBounds(locations.map(loc => [loc.lat, loc.lng] as [number, number]));
          
          // Fit the map view to the bounds
          map.fitBounds(bounds, {
            padding: [50, 50]  // Add some padding so the markers aren't right on the edge
          });
        }
      } else if (defaultLocation) {
        // If there are no locations, but a default location is provided, set the view to that location
        map.setView([defaultLocation.lat, defaultLocation.lng], 13);
      }
    }, [locations, map, defaultLocation]);

    return null;
  }

  return (
    <MapContainer
      ref={mapRef}
      className="h-full w-full"
      style={{ height: '100%', width: '100%' }}
      center={defaultLocation ? [defaultLocation.lat, defaultLocation.lng] : [32.9886, -96.7491]} // UTD center
      zoom={13}
      scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations && locations.length > 0 && locations.map(location => (
        <Marker
          key={location.id}
          position={[location.lat, location.lng]}>
          <Popup>
            {location.name || location.title}
          </Popup>
        </Marker>
      ))}
      <RecenterMap locations={locations} />
    </MapContainer>
  );
};

export default MapView;
