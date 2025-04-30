// Campus location definitions that can be reused across the app
export interface CampusLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  aliases?: string[]; // Add aliases for better matching
}

// UTD campus key locations with coordinates
export const campusLocations: CampusLocation[] = [
  {
    id: "studentunion",
    name: "Student Union",
    lat: 32.98671581142176,
    lng: -96.74944890766317,
    description: "Student Union with dining options, study spaces and recreation areas",
    aliases: ["union", "sub", "student union building"]
  },
  {
    id: "library",
    name: "McDermott Library",
    lat: 32.9871928740694,
    lng: -96.74762441537123, // Updated with precise coordinates
    description: "Main campus library with study spaces and resources",
    aliases: ["mcdermott", "library", "eugene mcdermott library"]
  },
  {
    id: "ecss",
    name: "ECSS Building",
    lat: 32.986311087083465,
    lng: -96.75045526156833,
    description: "Engineering and Computer Science South building with classrooms and labs",
    aliases: ["ecss", "engineering south", "computer science south"]
  },
  {
    id: "ecsn",
    name: "ECSN Building",
    lat: 32.9884,
    lng: -96.7517,
    description: "Engineering and Computer Science North building"
  },
  {
    id: "ssom",
    name: "School of Management",
    lat: 32.9869,
    lng: -96.7456,
    description: "Naveen Jindal School of Management with classrooms and offices"
  },
  {
    id: "residence",
    name: "Residence Halls",
    lat: 32.9922,
    lng: -96.7489,
    description: "On-campus student housing"
  },
  {
    id: "activity",
    name: "Activity Center",
    lat: 32.984835483244666,
    lng: -96.74954270331894,
    description: "Recreation center with gym and athletic facilities"
  },
  {
    id: "arts",
    name: "Arts & Humanities",
    lat: 32.9855,
    lng: -96.7501,
    description: "Arts and Humanities buildings and performance spaces"
  },
  {
    id: "sciences",
    name: "Natural Sciences",
    lat: 32.9866,
    lng: -96.7476,
    description: "Science buildings with classrooms and laboratories"
  },
  {
    id: "founders",
    name: "Founders Building",
    lat: 32.9875,
    lng: -96.7491,
    description: "One of the original campus buildings"
  },
  {
    id: "callier",
    name: "Callier Center",
    lat: 32.9892,
    lng: -96.7463,
    description: "Center for communication disorders research and treatment"
  },
  {
    id: "visitors",
    name: "Visitor Center",
    lat: 32.9854,
    lng: -96.7513,
    description: "Campus visitor center and admissions office"
  },
  {
    id: "jonsson",
    name: "Jonsson Performance Hall",
    lat: 32.988451582173454,
    lng: -96.74861335191952,
    description: "Performance venue for concerts and orchestral events"
  },
  {
    id: "plinth",
    name: "The Plinth",
    lat: 32.98736607080019,
    lng: -96.74828234522143,
    description: "Central outdoor gathering space for campus events"
  },
  {
    id: "ecsw",
    name: "ECSW Building",
    lat: 32.98605047033769,
    lng: -96.75152260357687,
    description: "Engineering and Computer Science West building with research labs",
    aliases: ["ecsw", "engineering west", "computer science west"]
  },
  {
    id: "rec_west",
    name: "Recreation Center West",
    lat: 32.984835483244666,
    lng: -96.74954270331894,
    description: "West campus recreation facilities",
    aliases: ["rec", "rec center", "gym"]
  }
];

// Helper function to search locations by name with improved matching
export function searchLocations(query: string): CampusLocation[] {
  const normalizedQuery = query.trim().toLowerCase();
  
  if (!normalizedQuery) return campusLocations;
  
  return campusLocations.filter(location => {
    // Check main name
    if (location.name.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Check aliases if available
    if (location.aliases && location.aliases.some(alias => 
      alias.toLowerCase().includes(normalizedQuery) || 
      normalizedQuery.includes(alias.toLowerCase())
    )) {
      return true;
    }
    
    return false;
  });
}

// Get a location by its ID
export function getLocationById(id: string): CampusLocation | undefined {
  return campusLocations.find(location => location.id === id);
}

// New helper function to find location by name with fuzzy matching
export function findLocationByName(locationName: string): CampusLocation | undefined {
  if (!locationName) return undefined;
  
  const normalizedName = locationName.trim().toLowerCase();
  
  // Try exact match first
  const exactMatch = campusLocations.find(
    loc => loc.name.toLowerCase() === normalizedName
  );
  
  if (exactMatch) return exactMatch;
  
  // Try alias match
  const aliasMatch = campusLocations.find(
    loc => loc.aliases && loc.aliases.some(alias => 
      alias.toLowerCase() === normalizedName ||
      normalizedName.includes(alias.toLowerCase()) ||
      alias.toLowerCase().includes(normalizedName)
    )
  );
  
  if (aliasMatch) return aliasMatch;
  
  // Try partial match
  for (const location of campusLocations) {
    // Check if location name contains the query or vice versa
    if (location.name.toLowerCase().includes(normalizedName) || 
        normalizedName.includes(location.name.toLowerCase())) {
      return location;
    }
    
    // Check if "library" is in the name (special case for McDermott Library)
    if ((normalizedName.includes("library") || normalizedName.includes("mcdermott")) && 
        location.id === "library") {
      return location;
    }
  }
  
  return undefined;
}
