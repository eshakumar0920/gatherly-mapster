
import { Event } from "@/components/EventCard";

// Updated mock data for events with real UTD events from May 1st, 2024 onwards
export const events: Event[] = [
  {
    id: "1",
    title: "UTD Jazz Ensemble Spring Concert",
    description: "The UTD Jazz Ensemble presents their Spring concert featuring classic and contemporary jazz standards.",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1200&q=80",
    date: "May 1, 2024",
    time: "7:30 PM - 9:30 PM",
    location: "University Theatre, UTD",
    category: "Music",
    creatorId: "1"
  },
  {
    id: "2",
    title: "UTDesign Capstone Spring 2024 Projects",
    description: "Come see innovative capstone projects from Engineering & Computer Science students. Industry sponsors and faculty will be evaluating student designs.",
    image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=1200&q=80",
    date: "May 3, 2024",
    time: "1:00 PM - 5:00 PM",
    location: "ECSW Building, UTD",
    category: "Academic",
    creatorId: "2"
  },
  {
    id: "3",
    title: "Guitar Ensemble Concert",
    description: "Join the UTD Guitar Ensemble for an evening of classical and contemporary music for guitar.",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80",
    date: "May 4, 2024",
    time: "7:30 PM - 9:30 PM",
    location: "Jonsson Performance Hall, UTD",
    category: "Music",
    creatorId: "3"
  },
  {
    id: "4",
    title: "Spring 2024 Graduation Ceremonies",
    description: "Join us in celebrating the graduating class of Spring 2024! School of Arts, Humanities, and Technology & School of Arts and Humanities.",
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
    date: "May 8, 2024",
    time: "9:00 AM - 11:00 AM",
    location: "Activity Center, UTD",
    category: "Academic",
    creatorId: "4"
  },
  {
    id: "5",
    title: "2024 CS Games Competition",
    description: "Competitive programming event for CS students to showcase their algorithmic skills and win prizes.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    date: "May 10, 2024",
    time: "10:00 AM - 5:00 PM",
    location: "ECSS Building, UTD",
    category: "Competition",
    creatorId: "5"
  },
  {
    id: "6",
    title: "UTD Symphony Orchestra Spring Concert",
    description: "The UTD Symphony Orchestra presents their final concert of the academic year featuring works by Beethoven and Tchaikovsky.",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    date: "May 12, 2024",
    time: "7:30 PM - 9:30 PM",
    location: "Jonsson Performance Hall, UTD",
    category: "Music",
    creatorId: "6"
  },
  {
    id: "7",
    title: "Sustainability Symposium",
    description: "Join us for a day of workshops, presentations, and discussions about campus sustainability initiatives and goals.",
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80",
    date: "May 15, 2024",
    time: "9:00 AM - 4:00 PM",
    location: "Student Union, UTD",
    category: "Workshop",
    creatorId: "7"
  },
  {
    id: "8",
    title: "Mental Health Awareness Week: Stress Relief Fair",
    description: "Take a break from finals stress with therapy dogs, crafts, massages, and wellness resources.",
    image: "https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&w=1200&q=80",
    date: "May 6, 2024",
    time: "11:00 AM - 2:00 PM",
    location: "Plinth, UTD",
    category: "Wellness",
    creatorId: "8"
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

// Update the categories array
export const categories = [
  { id: "academic", name: "Academic" },
  { id: "social", name: "Social" },
  { id: "sports", name: "Sports" },
  { id: "tech", name: "Tech" },
  { id: "arts", name: "Arts" },
  { id: "music", name: "Music" },
  { id: "cultural", name: "Cultural" },
  { id: "community", name: "Community" },
  { id: "gaming", name: "Gaming" },
  { id: "career", name: "Career" },
  { id: "workshop", name: "Workshop" },
  { id: "competition", name: "Competition" },
  { id: "fundraising", name: "Fundraising" },
  { id: "volunteering", name: "Volunteering" },
  { id: "entertainment", name: "Entertainment" },
  { id: "wellness", name: "Wellness" }
];
