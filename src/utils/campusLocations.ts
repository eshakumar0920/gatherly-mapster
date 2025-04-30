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
    aliases: ["union", "sub", "student union building", "su", "the union"]
  },
  {
    id: "library",
    name: "McDermott Library",
    lat: 32.9871928740694,
    lng: -96.74762441537123,
    description: "Main campus library with study spaces and resources",
    aliases: ["mcdermott", "library", "eugene mcdermott library", "mcdermott library", "study"]
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
    description: "Engineering and Computer Science North building",
    aliases: ["ecsn", "engineering north", "computer science north"]
  },
  {
    id: "ssom",
    name: "School of Management",
    lat: 32.9869,
    lng: -96.7456,
    description: "Naveen Jindal School of Management with classrooms and offices",
    aliases: ["jsom", "jindal", "management", "business school"]
  },
  {
    id: "residence",
    name: "Residence Halls",
    lat: 32.9922,
    lng: -96.7489,
    description: "On-campus student housing",
    aliases: ["dorms", "housing", "residence hall", "university housing"]
  },
  {
    id: "activity",
    name: "Activity Center",
    lat: 32.984835483244666,
    lng: -96.74954270331894,
    description: "Recreation center with gym and athletic facilities",
    aliases: ["gym", "rec center", "recreation center", "activity"]
  },
  {
    id: "arts",
    name: "Arts & Humanities",
    lat: 32.9855,
    lng: -96.7501,
    description: "Arts and Humanities buildings and performance spaces",
    aliases: ["ah", "arts", "humanities", "arts building"]
  },
  {
    id: "sciences",
    name: "Natural Sciences",
    lat: 32.9866,
    lng: -96.7476,
    description: "Science buildings with classrooms and laboratories",
    aliases: ["science", "biology", "chemistry", "physics"]
  },
  {
    id: "founders",
    name: "Founders Building",
    lat: 32.9875,
    lng: -96.7491,
    description: "One of the original campus buildings",
    aliases: ["fn", "founders north", "founders south", "founders"]
  },
  {
    id: "callier",
    name: "Callier Center",
    lat: 32.9892,
    lng: -96.7463,
    description: "Center for communication disorders research and treatment",
    aliases: ["callier", "speech", "hearing"]
  },
  {
    id: "visitors",
    name: "Visitor Center",
    lat: 32.9854,
    lng: -96.7513,
    description: "Campus visitor center and admissions office",
    aliases: ["visitors", "admissions", "visitor information"]
  },
  {
    id: "jonsson",
    name: "Jonsson Performance Hall",
    lat: 32.988451582173454,
    lng: -96.74861335191952,
    description: "Performance venue for concerts and orchestral events",
    aliases: ["jonsson", "performance hall", "concert hall"]
  },
  {
    id: "plinth",
    name: "The Plinth",
    lat: 32.98736607080019,
    lng: -96.74828234522143,
    description: "Central outdoor gathering space for campus events",
    aliases: ["plinth", "the plinth", "plaza", "central plaza", "art walk", "art walk in the plinth"]
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
    aliases: ["rec", "rec center", "gym", "recreation"]
  }
];

// Helper function to normalize text for better matching
const normalizeText = (text: string): string => {
  if (!text) return '';
  return text.trim().toLowerCase()
    .replace(/building/gi, "")
    .replace(/utd/gi, "")
    .replace(/center/gi, "")
    .replace(/hall/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Helper function to search locations by name with improved matching
export function searchLocations(query: string): CampusLocation[] {
  const normalizedQuery = normalizeText(query);
  
  if (!normalizedQuery) return campusLocations;
  
  return campusLocations.filter(location => {
    // Check main name
    if (normalizeText(location.name).includes(normalizedQuery) || 
        normalizedQuery.includes(normalizeText(location.name))) {
      return true;
    }
    
    // Check aliases if available
    if (location.aliases && location.aliases.some(alias => 
      normalizeText(alias).includes(normalizedQuery) || 
      normalizedQuery.includes(normalizeText(alias))
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

// Enhanced function to find location by name with fuzzy matching
export function findLocationByName(locationName: string): CampusLocation | undefined {
  if (!locationName) return undefined;
  
  const normalizedName = normalizeText(locationName);
  
  // Debug log to help diagnose matching issues
  console.log(`Finding location for: "${locationName}" (normalized: "${normalizedName}")`);
  
  // Try exact match first (case insensitive)
  const exactMatch = campusLocations.find(
    loc => normalizeText(loc.name) === normalizedName
  );
  
  if (exactMatch) {
    console.log(`Found exact location match for "${locationName}": ${exactMatch.name} (${exactMatch.lat}, ${exactMatch.lng})`);
    return exactMatch;
  }
  
  // Check for "The Plinth" specifically since it's a common meeting point
  if (normalizedName.includes("plinth")) {
    const plinth = campusLocations.find(loc => loc.id === "plinth");
    if (plinth) {
      console.log(`Plinth special case match for "${locationName}": ${plinth.name} (${plinth.lat}, ${plinth.lng})`);
      return plinth;
    }
  }
  
  // Special case for library references
  if (normalizedName.includes("library") || 
      normalizedName.includes("mcdermott") || 
      normalizedName.includes("study")) {
    const library = campusLocations.find(loc => loc.id === "library");
    if (library) {
      console.log(`Library special case match for "${locationName}": ${library.name} (${library.lat}, ${library.lng})`);
      return library;
    }
  }
  
  // Try alias match
  const aliasMatch = campusLocations.find(
    loc => loc.aliases && loc.aliases.some(alias => 
      normalizeText(alias) === normalizedName ||
      normalizedName.includes(normalizeText(alias)) ||
      normalizeText(alias).includes(normalizedName)
    )
  );
  
  if (aliasMatch) {
    console.log(`Found alias match for "${locationName}": ${aliasMatch.name} (${aliasMatch.lat}, ${aliasMatch.lng})`);
    return aliasMatch;
  }
  
  // Special case handling for common location types
  
  // Check for Jazz Ensemble (special case)
  if (normalizedName.includes("jazz") || normalizedName.includes("ensemble") || normalizedName.includes("concert")) {
    const jonsson = campusLocations.find(loc => loc.id === "jonsson");
    if (jonsson) {
      console.log(`Jonsson special case match for "${locationName}": ${jonsson.name} (${jonsson.lat}, ${jonsson.lng})`);
      return jonsson;
    }
  }
  
  // Check for "founders" references
  if (normalizedName.includes("founder")) {
    const founders = campusLocations.find(loc => loc.id === "founders");
    if (founders) {
      console.log(`Founders special case match for "${locationName}": ${founders.name} (${founders.lat}, ${founders.lng})`);
      return founders;
    }
  }
  
  // Try partial match as last resort
  for (const location of campusLocations) {
    // Check if location name contains the query or vice versa
    if (normalizeText(location.name).includes(normalizedName) || 
        normalizedName.includes(normalizeText(location.name))) {
      console.log(`Partial match found for "${locationName}": ${location.name} (${location.lat}, ${location.lng})`);
      return location;
    }
  }
  
  // If no match found, default to library as a fallback
  const defaultLocation = campusLocations.find(loc => loc.id === "library");
  if (defaultLocation) {
    console.log(`No match found for "${locationName}", using library as default: (${defaultLocation.lat}, ${defaultLocation.lng})`);
    return defaultLocation;
  }
  
  return undefined;
}
