
import { useState, useEffect, useRef } from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CampusLocation, searchLocations, findLocationByName } from "@/utils/campusLocations";

interface LocationSelectorProps {
  value: string;
  onChange: (location: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
}

const LocationSelector = ({ value, onChange, onCoordinatesChange }: LocationSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<CampusLocation[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter locations based on search query
  useEffect(() => {
    setFilteredLocations(searchLocations(searchQuery));
  }, [searchQuery]);
  
  // When value prop changes, try to match it to a known location
  useEffect(() => {
    if (value && value !== searchQuery) {
      setSearchQuery(value);
      
      // If coordinates callback is provided and value is a known location, call it with coordinates
      if (onCoordinatesChange) {
        const matchedLocation = findLocationByName(value);
        if (matchedLocation) {
          console.log(`Found location match for "${value}": ${matchedLocation.name} (${matchedLocation.lat}, ${matchedLocation.lng})`);
          onCoordinatesChange(matchedLocation.lat, matchedLocation.lng);
        } else {
          // Default to library if no match found
          const defaultLocation = findLocationByName("Library");
          if (defaultLocation) {
            console.log(`No match found for "${value}", defaulting to Library: (${defaultLocation.lat}, ${defaultLocation.lng})`);
            onCoordinatesChange(defaultLocation.lat, defaultLocation.lng);
          }
        }
      }
    }
  }, [value, onCoordinatesChange]);
  
  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Handle selection of a location
  const handleSelectLocation = (location: CampusLocation) => {
    onChange(location.name);
    setSearchQuery(location.name);
    setShowDropdown(false);
    
    // If coordinates callback is provided, call it with the location's coordinates
    if (onCoordinatesChange) {
      console.log(`Selected location with coordinates: ${location.name} (${location.lat}, ${location.lng})`);
      onCoordinatesChange(location.lat, location.lng);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search campus locations..."
          className="pr-10"
        />
        <div 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={() => setShowDropdown(prev => !prev)}
        >
          {showDropdown ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {showDropdown && filteredLocations.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleSelectLocation(location)}
            >
              <MapPin className="h-4 w-4 min-w-4 min-h-4 mr-2 flex-shrink-0" />
              <div>
                <div>{location.name}</div>
                {location.description && (
                  <div className="text-xs text-muted-foreground">{location.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showDropdown && searchQuery && filteredLocations.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover rounded-md shadow-lg p-3">
          <p className="text-sm text-muted-foreground">
            No matching campus locations found. Please select from the available options.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
