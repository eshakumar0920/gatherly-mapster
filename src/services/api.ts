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

// Generic function to handle API requests
async function fetchFromApi<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Record<string, any>,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
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
      status: 0 // Use 0 to indicate network/offline error
    };
  }
}

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

// API endpoints for events
export const eventsApi = {
  // Get all events
  getAllEvents: () => fetchFromApi<any[]>('/events'),
  
  // Get a single event by ID
  getEventById: (id: string) => fetchFromApi<any>(`/events/${id}`),
  
  // Other event-related API calls
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
