
import { Event } from "@/components/EventCard";

// Mock data for events with updated years and improved location formatting
export const events: Event[] = [
  {
    id: "1",
    title: "UTD Hackathon 2025",
    description: "Join fellow UTD students for our biggest student-led hackathon of the year! All skill levels welcome.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    date: "Aug 15, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "ECSW Courtyard, UTD",
    category: "Technology"
  },
  {
    id: "2",
    title: "Comet Concert Series",
    description: "Student musicians from UTD's School of Arts showcase their talents in this student-organized concert series.",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
    date: "Jul 22-24, 2025",
    time: "7:00 PM - 10:00 PM",
    location: "Plinth, UTD Campus",
    category: "Music"
  },
  {
    id: "3",
    title: "International Food Festival",
    description: "Organized by UTD's cultural student organizations - sample cuisines from around the world prepared by fellow students!",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    date: "Sep 10, 2025",
    time: "3:00 PM - 9:00 PM",
    location: "Student Union, UTD",
    category: "Food"
  },
  {
    id: "4",
    title: "Student Entrepreneur Showcase",
    description: "UTD students present their startups and business ideas to peers and potential investors from the Dallas area.",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    date: "Oct 5, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Blackstone LaunchPad, UTD",
    category: "Business"
  },
  {
    id: "5",
    title: "Student Art Showcase",
    description: "A gallery exhibition featuring works from UTD's talented student artists - organized by the Arts Student Union.",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80",
    date: "Aug 3, 2025",
    time: "7:00 PM - 10:00 PM",
    location: "SP/N Gallery, UTD",
    category: "Art"
  },
  {
    id: "6",
    title: "Wellness Wednesday",
    description: "A student-led meditation and yoga session to help UTD students de-stress during finals week.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    date: "Sep 15, 2025",
    time: "5:00 PM - 7:00 PM",
    location: "Recreation Center West, UTD",
    category: "Wellness"
  }
];

// Get all events
export const getEvents = () => {
  return events;
};

// Get event by ID
export const getEventById = (id: string) => {
  return events.find(event => event.id === id);
};

// Get events by category
export const getEventsByCategory = (category: string) => {
  return events.filter(event => event.category === category);
};

// Get featured events (just a sample implementation)
export const getFeaturedEvents = () => {
  return events.slice(0, 3);
};

// Mock data for event categories
export const categories = [
  { id: "technology", name: "Technology" },
  { id: "music", name: "Music" },
  { id: "food", name: "Food" },
  { id: "business", name: "Business" },
  { id: "art", name: "Art" },
  { id: "wellness", name: "Wellness" },
];
