
// Campus location definitions that can be reused across the app
export interface CampusLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
}

// UTD campus key locations with coordinates
export const campusLocations: CampusLocation[] = [
  {
    id: "studentunion",
    name: "Student Union",
    lat: 32.98671581142176,
    lng: -96.74944890766317,
    description: "Student Union with dining options, study spaces and recreation areas"
  },
  {
    id: "library",
    name: "McDermott Library",
    lat: 32.9886,
    lng: -96.7491,
    description: "Main campus library with study spaces and resources"
  },
  {
    id: "ecss",
    name: "ECSS Building",
    lat: 32.986311087083465,
    lng: -96.75045526156833,
    description: "Engineering and Computer Science South building with classrooms and labs"
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
    description: "Engineering and Computer Science West building with research labs"
  },
  {
    id: "rec_west",
    name: "Recreation Center West",
    lat: 32.984835483244666,
    lng: -96.74954270331894,
    description: "West campus recreation facilities"
  }
];

// Helper function to search locations by name
export function searchLocations(query: string): CampusLocation[] {
  const normalizedQuery = query.trim().toLowerCase();
  
  if (!normalizedQuery) return campusLocations;
  
  return campusLocations.filter(location => 
    location.name.toLowerCase().includes(normalizedQuery)
  );
}

// Get a location by its ID
export function getLocationById(id: string): CampusLocation | undefined {
  return campusLocations.find(location => location.id === id);
}
