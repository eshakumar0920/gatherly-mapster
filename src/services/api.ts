import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

// Configure your Flask API base URL here 
// Use environment variable or fallback to localhost with correct port
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'; 

// Define types for API responses and parameters
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface EventSearchParams {
  query?: string;
  location?: string;
  date_from?: string;
  date_to?: string;
}

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

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('impulse_access_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Handle authentication routes differently - they should go directly to /auth endpoint
  const fullUrl = endpoint.startsWith('/auth/') 
    ? `${API_BASE_URL}${endpoint}` 
    : `${API_BASE_URL}/api${endpoint}`;

  try {
    console.log(`Fetching from: ${fullUrl}`); // Add logging to debug URL construction
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors', // Explicitly set CORS mode
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      throw new Error('Failed to parse server response');
    }

    if (!response.ok) {
      throw new Error(responseData.message || responseData.error || 'An error occurred');
    }

    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const authApi = {
  register: (email: string, password: string, metadata?: { name?: string }) => 
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...metadata }),
    }),
  
  login: (email: string, password: string) => 
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  verifyToken: () => fetchApi('/auth/verify'),
};

async function fetchFromApi<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Record<string, any>,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  try {
    // Skip adding /api/ for authentication routes
    const fullEndpoint = endpoint.startsWith('/auth/') 
      ? endpoint 
      : endpoint; // Removed prepending /api since it's already included in API_BASE_URL + endpoint

    const fullUrl = `${API_BASE_URL}${fullEndpoint}`;
    console.log(`Making request to: ${fullUrl}`); // Debug log
    
    const controller = new AbortController();
    // Increase timeout from 30 seconds to prevent premature timeouts
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      credentials: 'include',
      mode: 'cors', // Explicitly set CORS mode
      ...(body && { body: JSON.stringify(body) }),
      signal: controller.signal
    };

    // Log the full request for debugging
    console.log(`Request options:`, { method, headers: requestOptions.headers });

    const response = await fetch(fullUrl, requestOptions);
    clearTimeout(timeoutId);
    
    // Log response details for debugging
    console.log(`Response status: ${response.status}, headers:`, response.headers);

    const isJson = response.headers.get('content-type')?.includes('application/json');
    let data;
    
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (e) {
      console.error("Error parsing response:", e);
      return {
        error: "Failed to parse server response",
        status: response.status
      };
    }
    
    if (!response.ok) {
      console.warn(`API request to ${fullEndpoint} failed with status ${response.status}`);
      return {
        error: data.message || `Request failed with status ${response.status}`,
        status: response.status
      };
    }

    return {
      data,
      status: response.status
    };
  } catch (error) {
    console.error('API request failed:', error);
    const errorMessage = error instanceof Error ? 
      (error.name === 'AbortError' ? 'Request timeout - server did not respond in time' : error.message) : 
      'An unexpected error occurred';
    
    console.warn(`API error details: ${errorMessage}`);
    
    // Return a more helpful error message for connection issues
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      return {
        error: "Server connection issue. Please check if the API server is running.",
        status: 0
      };
    }
    
    return {
      error: errorMessage,
      status: 0
    };
  }
}

function buildQueryString(params: Record<string, any>): string {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  
  return query ? `?${query}` : '';
}

// Deprecated: meetupsApi now points to eventsApi (for transition, in case any references remain)
export const meetupsApi = {
  getAllMeetups: async () => {
    // Use /events endpoint instead of /meetups
    try {
      return await eventsApi.getAllEvents();
    } catch (error) {
      console.error('Error getting meetups (now coming from events):', error);
      return { error: 'Failed to fetch meetups', status: 0 };
    }
  },
  getMeetupById: async (id: string) => {
    try {
      return await eventsApi.getEventById(id);
    } catch (error) {
      console.error('Error getting meetup details (now coming from events):', error);
      return { error: 'Failed to fetch meetup details', status: 0 };
    }
  },
  createMeetup: (meetupData: any) => eventsApi.createEvent(meetupData),
  joinMeetupLobby: (meetupId: string, userData: any) =>
    eventsApi.joinEvent(meetupId, userData?.user_id ?? ""),
  checkInToMeetup: (meetupId: string, userData: any) => 
    ({ data: null, error: null, status: 200 }) // Not implemented: placeholder for checkin in events (if there's a checkin endpoint, map it here)
};

export const eventsApi = {
  getAllEvents: () => fetchFromApi<any[]>('/api/events'),
  
  getEventById: (id: string) => fetchFromApi<any>(`/api/events/${id}`),
  
  searchEvents: (params: EventSearchParams) => 
    fetchFromApi<any[]>(`/api/search${buildQueryString(params)}`),
  
  joinEvent: (eventId: string, userId: string) => 
    fetchFromApi<any>(`/api/events/${eventId}/join`, 'POST', { user_id: userId }),
  
  leaveEvent: (eventId: string, userId: string) => 
    fetchFromApi<any>(`/api/events/${eventId}/leave`, 'POST', { user_id: userId }),
  
  getEventParticipants: (eventId: string) => 
    fetchFromApi<any[]>(`/api/events/${eventId}/participants`),
  
  createEvent: (eventData: any) => 
    fetchFromApi<any>('/api/events', 'POST', eventData),
    
  getEventsByCategory: (category: string) =>
    fetchFromApi<any[]>(`/api/events?category=${category}`),
  
  getEventsByLocation: (location: string) =>
    fetchFromApi<any[]>(`/api/events?location=${location}`),
  
  getEventsByDate: (date: string) =>
    fetchFromApi<any[]>(`/api/events?date=${date}`),
  
  getAllEventsWithFallback: async () => {
    try {
      console.log("Attempting to fetch events with improved error handling");
      const response = await fetchFromApi<any[]>('/api/events');
      
      if (response.error || !response.data) {
        console.warn("Error fetching events, falling back to Supabase:", response.error);
        // Return a special error object that indicates we should try Supabase
        return { 
          error: "API_FALLBACK_TO_SUPABASE", 
          status: response.status,
          originalError: response.error
        };
      }
      
      return response;
    } catch (error) {
      console.error("Unexpected error in getAllEventsWithFallback:", error);
      return {
        error: "Unexpected error fetching events",
        status: 0
      };
    }
  }
};

export const levelingApi = {
  getUserProgress: (userId: number) => 
    fetchFromApi<UserProgress>(`/users/${userId}/progress`),
  
  getLevels: () => 
    fetchFromApi<LevelInfo[]>('/levels'),
  
  getUserLootboxes: (userId: number) => 
    fetchFromApi<LootBox[]>(`/users/${userId}/lootboxes`),
  
  openLootbox: (userId: number, lootboxId: number) => 
    fetchFromApi<any>(`/users/${userId}/lootboxes/${lootboxId}/open`, 'POST'),
  
  startNewSemester: (semesterData: { 
    name: string; 
    start_date: string; 
    end_date: string; 
  }) => fetchFromApi<any>('/admin/semester', 'POST', semesterData)
};

export const rewardsApi = {
  getUserRewards: (userId: number) =>
    fetchFromApi<any[]>(`/users/${userId}/rewards`),
  
  getRewardTypes: (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.set(key, String(value));
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchFromApi<any[]>(`/reward-types${queryString}`);
  },
  
  equipReward: (userId: number, rewardId: number) =>
    fetchFromApi<any>(`/users/${userId}/rewards/${rewardId}/equip`, 'POST'),
  
  getCategories: () =>
    fetchFromApi<any[]>(`/categories`),
};

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
