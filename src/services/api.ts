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

// Define search parameters interface for events
export interface EventSearchParams {
  query?: string;
  location?: string;
  date_from?: string;
  date_to?: string;
}

// Define interfaces for the leveling system
export interface UserProgress {
  user_id: number;
  username: string;
  current_level: number;
  current_xp: number;
  total_xp_earned: number;
  current_tier: string;
  active_weeks_streak: number;
  activity_bonus: string;
  next_level: number | null;
  xp_for_next_level: number;
  xp_needed_for_level: number;
  progress_percent: number;
  max_level_reached: boolean;
  current_semester: string;
  recent_activities: {
    timestamp: string;
    activity_type: string;
    xp_earned: number;
    description: string;
  }[];
}

export interface LevelInfo {
  level_number: number;
  level_xp: number;
  total_xp: number;
  tier: string;
}

export interface LootBox {
  id: number;
  type_name: string;
  description: string;
  tier: string;
  icon_url: string;
  is_opened: boolean;
  awarded_at: string;
  opened_at: string | null;
  awarded_for: string;
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

// Helper function to build query string from parameters
function buildQueryString(params: Record<string, any>): string {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  
  return query ? `?${query}` : '';
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
  
  // Search events with filters
  searchEvents: (params: EventSearchParams) => 
    fetchFromApi<any[]>(`/search${buildQueryString(params)}`),
  
  // Join an event
  joinEvent: (eventId: string, userId: string) => 
    fetchFromApi<any>(`/events/${eventId}/join`, 'POST', { user_id: userId }),
  
  // Leave an event
  leaveEvent: (eventId: string, userId: string) => 
    fetchFromApi<any>(`/events/${eventId}/leave`, 'POST', { user_id: userId }),
  
  // Get event participants
  getEventParticipants: (eventId: string) => 
    fetchFromApi<any[]>(`/events/${eventId}/participants`),
  
  // Create a new event
  createEvent: (eventData: any) => 
    fetchFromApi<any>('/events', 'POST', eventData)
};

// API endpoints for leveling system
export const levelingApi = {
  // Get user progress
  getUserProgress: (userId: number) => 
    fetchFromApi<UserProgress>(`/users/${userId}/progress`),
  
  // Get all level definitions
  getLevels: () => 
    fetchFromApi<LevelInfo[]>('/levels'),
  
  // Get user lootboxes
  getUserLootboxes: (userId: number) => 
    fetchFromApi<LootBox[]>(`/users/${userId}/lootboxes`),
  
  // Open a lootbox
  openLootbox: (userId: number, lootboxId: number) => 
    fetchFromApi<any>(`/users/${userId}/lootboxes/${lootboxId}/open`, 'POST'),
  
  // Start new semester (admin only)
  startNewSemester: (semesterData: { 
    name: string; 
    start_date: string; 
    end_date: string; 
  }) => fetchFromApi<any>('/admin/semester', 'POST', semesterData)
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
