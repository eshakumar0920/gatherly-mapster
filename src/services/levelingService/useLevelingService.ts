
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useApiErrorHandling } from '../api';
import { UserProgress, Level, LootBox } from '../types/flaskTypes';

export function useLevelingService() {
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandling();
  
  // Get user progress
  const getUserProgress = useCallback(async (userId: number): Promise<UserProgress | null> => {
    try {
      // Use mock data instead of making the actual API call
      console.log("Using mock user progress data for user", userId);
      
      // Mock user progress
      const mockProgress: UserProgress = {
        user_id: userId,
        username: "User" + userId,
        current_level: 5,
        current_xp: 1250,
        total_xp_earned: 1250,
        current_tier: "Bronze",
        active_weeks_streak: 3,
        activity_bonus: "1.15x",
        next_level: 6,
        xp_for_next_level: 750,
        xp_needed_for_level: 2000,
        progress_percent: 62,
        max_level_reached: false,
        current_semester: "Fall 2025",
        recent_activities: [
          {
            timestamp: new Date().toISOString(),
            activity_type: "event_join",
            xp_earned: 50,
            description: "Joined an event"
          },
          {
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            activity_type: "meetup_hosted",
            xp_earned: 100,
            description: "Hosted a meetup"
          }
        ]
      };
      
      return mockProgress;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      handleApiError('Network error when fetching user progress');
      return null;
    }
  }, [handleApiError]);
  
  // Get all levels
  const getLevels = useCallback(async (): Promise<Level[]> => {
    try {
      const response = await fetch('http://localhost:5000/api/levels');
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to fetch levels');
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching levels:', error);
      handleApiError('Network error when fetching levels');
      return [];
    }
  }, [handleApiError]);
  
  // Get user lootboxes
  const getUserLootboxes = useCallback(async (userId: number): Promise<LootBox[]> => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/lootboxes`);
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to fetch lootboxes');
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching lootboxes:', error);
      handleApiError('Network error when fetching lootboxes');
      return [];
    }
  }, [handleApiError]);
  
  // Open a lootbox
  const openLootbox = useCallback(async (userId: number, lootboxId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/lootboxes/${lootboxId}/open`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to open lootbox');
        return false;
      }
      
      toast({
        title: "Loot Box Opened!",
        description: "You've successfully opened a loot box!",
      });
      
      return true;
    } catch (error) {
      console.error('Error opening lootbox:', error);
      handleApiError('Network error when opening lootbox');
      return false;
    }
  }, [toast, handleApiError]);
  
  // Start a new semester (admin only)
  const startNewSemester = useCallback(async (
    name: string, 
    startDate: string, 
    endDate: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/semester', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          start_date: startDate,
          end_date: endDate
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to start new semester');
        return false;
      }
      
      toast({
        title: "New Semester Started",
        description: `Successfully started new semester: ${name}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error starting new semester:', error);
      handleApiError('Network error when starting new semester');
      return false;
    }
  }, [toast, handleApiError]);
  
  return {
    getUserProgress,
    getLevels,
    getUserLootboxes,
    openLootbox,
    startNewSemester
  };
}
