
import { useToast } from "@/hooks/use-toast";

// Configure your Flask API base URL here 
// In production, you would likely use an environment variable
const API_BASE_URL = 'http://localhost:5000/api';

// Define types for API responses and parameters
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  creator_id: number;
  participants_count?: number;
}

export interface Participant {
  user_id: number;
  joined_at: string;
}

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true; // Set to true to use mock data instead of trying to connect to Flask API

// Generic function to handle API requests
async function fetchFromApi<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Record<string, any>,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  // If we're using mock data, don't actually make the request
  if (USE_MOCK_DATA) {
    console.log(`Using mock data for: ${method} ${endpoint}`);
    // This will be handled in the specific API implementations
    return {
      data: undefined,
      status: 200
    };
  }
  
  try {
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      credentials: 'include', // Includes cookies for cross-domain requests if needed
      ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();
    
    if (!response.ok) {
      return {
        error: data.message || 'An error occurred',
        status: response.status
      };
    }

    return {
      data,
      status: response.status
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500
    };
  }
}

// API endpoints for events
export const eventsApi = {
  // Get all events
  getAllEvents: async (params?: { location?: string; date?: string; q?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.location) queryParams.append('location', params.location);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.q) queryParams.append('q', params.q);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    if (USE_MOCK_DATA) {
      // Import from eventService for mock data
      const { events } = await import('@/services/eventService');
      
      // Filter mock data if search query is provided
      let filteredEvents = events;
      if (params?.q) {
        const searchTerm = params.q.toLowerCase();
        filteredEvents = events.filter(event => 
          event.title.toLowerCase().includes(searchTerm) || 
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm)
        );
      }
      
      // Convert the event format to match the Flask API format
      const apiFormattedEvents = filteredEvents.map(event => ({
        id: parseInt(event.id),
        title: event.title,
        description: event.description,
        location: event.location,
        event_date: new Date(event.date + ' ' + event.time).toISOString(),
        creator_id: 1, // Mock creator ID
        participants_count: Math.floor(Math.random() * 20) + 1 // Random number of participants
      }));
      
      return { data: apiFormattedEvents, status: 200 };
    }
    
    return fetchFromApi<Event[]>(`/events${queryString}`);
  },
  
  // Get a single event by ID
  getEventById: async (id: number) => {
    if (USE_MOCK_DATA) {
      const { getEventById } = await import('@/services/eventService');
      const event = getEventById(id.toString());
      
      if (!event) return { error: 'Event not found', status: 404 };
      
      // Convert the event format to match the Flask API format
      const apiFormattedEvent = {
        id: parseInt(event.id),
        title: event.title,
        description: event.description,
        location: event.location,
        event_date: new Date(event.date + ' ' + event.time).toISOString(),
        creator_id: 1, // Mock creator ID
        participants_count: Math.floor(Math.random() * 20) + 1 // Random number of participants
      };
      
      return { data: apiFormattedEvent, status: 200 };
    }
    
    return fetchFromApi<Event>(`/events/${id}`);
  },
  
  // Create a new event
  createEvent: (eventData: Omit<Event, 'id'>) => 
    fetchFromApi<{ id: number; message: string }>('/events', 'POST', eventData),
  
  // Join an event
  joinEvent: (eventId: number, userId: number) => 
    fetchFromApi<{ message: string }>(`/events/${eventId}/join`, 'POST', { user_id: userId }),
  
  // Leave an event
  leaveEvent: (eventId: number, userId: number) => 
    fetchFromApi<{ message: string }>(`/events/${eventId}/leave`, 'POST', { user_id: userId }),
  
  // Get event participants
  getEventParticipants: (eventId: number) => 
    fetchFromApi<Participant[]>(`/events/${eventId}/participants`)
};

// API endpoints for meetups
export const meetupsApi = {
  // Get all meetups
  getAllMeetups: () => fetchFromApi<any[]>('/meetups'),
  
  // Get a single meetup by ID
  getMeetupById: (id: string) => fetchFromApi<any>(`/meetups/${id}`),
  
  // Create a new meetup
  createMeetup: (meetupData: any) => fetchFromApi<any>('/meetups', 'POST', meetupData),
  
  // Join a meetup lobby
  joinMeetupLobby: (meetupId: string, userData: any) => 
    fetchFromApi<any>(`/meetups/${meetupId}/join`, 'POST', userData),
  
  // Check in to a meetup
  checkInToMeetup: (meetupId: string, userData: any) => 
    fetchFromApi<any>(`/meetups/${meetupId}/checkin`, 'POST', userData)
};

// API endpoints for user-related operations
export const userApi = {
  // Get user points
  getUserPoints: (userId: string) => fetchFromApi<number>(`/users/${userId}/points`),
  
  // Get user level
  getUserLevel: (userId: string) => fetchFromApi<number>(`/users/${userId}/level`),
  
  // Other user-related API calls
};

// Custom hook for handling API errors
export function useApiErrorHandling() {
  const { toast } = useToast();
  
  const handleApiError = (error: string | undefined) => {
    if (error) {
      toast({
        title: "API Error",
        description: error,
        variant: "destructive"
      });
    }
  };
  
  return { handleApiError };
}
