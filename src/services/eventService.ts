
import { Event } from "@/components/EventCard";

// Mock data for events
export const events: Event[] = [
  {
    id: "1",
    title: "Tech Conference 2023",
    description: "Join us for the biggest tech conference of the year with speakers from around the world.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    date: "Aug 15, 2023",
    time: "9:00 AM - 5:00 PM",
    location: "Convention Center, New York",
    category: "Technology"
  },
  {
    id: "2",
    title: "Summer Music Festival",
    description: "Three days of amazing music performances by top artists across multiple stages.",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
    date: "Jul 22-24, 2023",
    time: "12:00 PM - 11:00 PM",
    location: "Central Park, New York",
    category: "Music"
  },
  {
    id: "3",
    title: "Food & Wine Expo",
    description: "Sample delicious cuisines and fine wines from top chefs and wineries.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    date: "Sep 10, 2023",
    time: "3:00 PM - 9:00 PM",
    location: "Grand Hall, Chicago",
    category: "Food"
  },
  {
    id: "4",
    title: "Marketing Summit",
    description: "Learn the latest marketing strategies from industry experts and thought leaders.",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    date: "Oct 5, 2023",
    time: "10:00 AM - 4:00 PM",
    location: "Business Center, San Francisco",
    category: "Business"
  },
  {
    id: "5",
    title: "Art Exhibition Opening",
    description: "Explore contemporary artworks from emerging and established artists at this special opening night.",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80",
    date: "Aug 3, 2023",
    time: "7:00 PM - 10:00 PM",
    location: "Modern Art Gallery, Los Angeles",
    category: "Art"
  },
  {
    id: "6",
    title: "Yoga Retreat Weekend",
    description: "Relax, rejuvenate and connect with like-minded people at this weekend yoga retreat.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    date: "Sep 15-17, 2023",
    time: "All Day",
    location: "Serenity Resort, Malibu",
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
