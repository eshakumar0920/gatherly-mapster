import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

// Configure your Flask API base URL here 
const API_BASE_URL = 'http://localhost:5000'; 

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
  
  const fullUrl = endpoint.startsWith('/auth/') 
    ? `${API_BASE_URL}${endpoint}` 
    : `${API_BASE_URL}/api${endpoint}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      credentials: 'include',
      ...(body && { body: JSON.stringify(body) }),
      signal: controller.signal
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    clearTimeout(timeoutId);
    
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
      error: error instanceof Error ? 
        (error.name === 'AbortError' ? 'Request timeout' : error.message) : 
        'An unexpected error occurred',
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

export const meetupsApi = {
  getAllMeetups: () => fetchFromApi<any[]>('/meetups'),
  
  getMeetupById: (id: string) => fetchFromApi<any>(`/meetups/${id}`),
  
  createMeetup: (meetupData: any) => fetchFromApi<any>('/meetups', 'POST', meetupData),
  
  joinMeetupLobby: (meetupId: string, userData: any) => 
    fetchFromApi<any>(`/meetups/${meetupId}/join`, 'POST', userData),
  
  checkInToMeetup: (meetupId: string, userData: any) => 
    fetchFromApi<any>(`/meetups/${meetupId}/checkin`, 'POST', userData)
};

export const eventsApi = {
  getAllEvents: () => fetchFromApi<any[]>('/events'),
  
  getEventById: (id: string) => fetchFromApi<any>(`/events/${id}`),
  
  searchEvents: (params: EventSearchParams) => 
    fetchFromApi<any[]>(`/search${buildQueryString(params)}`),
  
  joinEvent: (eventId: string, userId: string) => 
    fetchFromApi<any>(`/events/${eventId}/join`, 'POST', { user_id: userId }),
  
  leaveEvent: (eventId: string, userId: string) => 
    fetchFromApi<any>(`/events/${eventId}/leave`, 'POST', { user_id: userId }),
  
  getEventParticipants: (eventId: string) => 
    fetchFromApi<any[]>(`/events/${eventId}/participants`),
  
  createEvent: (eventData: any) => 
    fetchFromApi<any>('/events', 'POST', eventData),
    
  getEventsByCategory: (category: string) =>
    fetchFromApi<any[]>(`/events?category=${category}`),
  
  getEventsByLocation: (location: string) =>
    fetchFromApi<any[]>(`/events?location=${location}`),
  
  getEventsByDate: (date: string) =>
    fetchFromApi<any[]>(`/events?date=${date}`)
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

export const userApi = {
  getUserPoints: (userId: string) => fetchFromApi<number>(`/users/${userId}/points`),
  
  getUserLevel: (userId: string) => fetchFromApi<number>(`/users/${userId}/level`),
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
