
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { supabase } from "@/integrations/supabase/client";

interface MapLocation {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description?: string;
  category?: string;
  isEvent?: boolean;
}

interface GoogleMapViewProps {
  locations: MapLocation[];
}

const UTD_CENTER = {
  lat: 32.9886,
  lng: -96.7479
};

const GoogleMapView = ({ locations }: GoogleMapViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [allLocations, setAllLocations] = useState<MapLocation[]>(locations);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMeetupLocations = async () => {
      try {
        // Since we don't have direct access to events table, we'll use mock data
        // or the locations passed in props
        const mockMeetups = [
          {
            id: '101',
            title: 'Chess Club',
            description: 'Weekly chess meetup',
            semester: 'Spring 2023',
          },
          {
            id: '102',
            title: 'Study Group',
            description: 'Final exam preparation',
            semester: 'Spring 2023',
          },
        ];

        if (mockMeetups && mockMeetups.length > 0) {
          const meetupLocations: MapLocation[] = mockMeetups.map((meetup) => ({
            id: meetup.id?.toString() || '',
            title: meetup.title || 'Untitled',
            lat: UTD_CENTER.lat + (Math.random() - 0.5) * 0.01,
            lng: UTD_CENTER.lng + (Math.random() - 0.5) * 0.01,
            description: meetup.description || undefined,
            category: meetup.semester || undefined,
            isEvent: false
          }));

          const eventLocations = locations.map(location => ({
            ...location,
            isEvent: true
          }));

          setAllLocations([...eventLocations, ...meetupLocations]);
        }
      } catch (err) {
        console.error('Failed to fetch meetup locations:', err);
      }
    };

    fetchMeetupLocations();
  }, [locations]);

  
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    const DefaultIcon = L.icon({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });
    
    L.Marker.prototype.options.icon = DefaultIcon;
    
    const map = L.map(mapContainerRef.current).setView([UTD_CENTER.lat, UTD_CENTER.lng], 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    const utdBoundary = L.polygon([
      [32.9935, -96.7535] as L.LatLngTuple,
      [32.9935, -96.7435] as L.LatLngTuple,
      [32.9835, -96.7435] as L.LatLngTuple,
      [32.9835, -96.7535] as L.LatLngTuple
    ], {
      color: '#E87500',
      fillColor: '#E87500',
      fillOpacity: 0.1,
      weight: 2
    }).addTo(map);
    
    mapRef.current = map;
    setIsLoading(false);
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    if (mapRef.current && !isLoading) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current?.removeLayer(layer);
        }
      });
      
      allLocations.forEach(location => {
        const markerColor = location.isEvent ? "blue" : 
                           (location.category === "Sports" ? "green" : 
                            location.category === "Academic" ? "red" : 
                            location.category === "Gaming" ? "purple" : "orange");
        
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

        L.marker([location.lat, location.lng], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <strong>${location.title}</strong>
            ${location.description ? `<br/>${location.description}` : ''}
            ${location.category ? `<br/><i>Category: ${location.category}</i>` : ''}
            ${location.isEvent ? '<br/><i>Event</i>' : '<br/><i>Meetup</i>'}
          `);
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
