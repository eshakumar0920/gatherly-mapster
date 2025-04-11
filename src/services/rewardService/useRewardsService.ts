
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useApiErrorHandling } from '../api';
import { UserReward, RewardType, CategoryTheme } from '../types/flaskTypes';

export function useRewardsService() {
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandling();
  
  // Get user rewards
  const getUserRewards = useCallback(async (userId: number): Promise<UserReward[]> => {
    try {
      // Use mock data instead of making the actual API call
      console.log("Using mock user rewards data for user", userId);
      
      // Mock user rewards
      const mockRewards: UserReward[] = [
        {
          id: 1,
          reward_id: 101,
          name: "Bronze Badge",
          description: "A shiny bronze badge for your profile",
          image_url: "https://via.placeholder.com/150/cd7f32",
          tier: "common",
          category: "Badge",
          theme: "Achievement",
          is_rare: false,
          is_equipped: true,
          acquired_at: new Date().toISOString(),
          loot_box_id: 1
        },
        {
          id: 2,
          reward_id: 102,
          name: "Comet Mascot",
          description: "UTD's mascot sticker",
          image_url: "https://via.placeholder.com/150/e87500",
          tier: "uncommon",
          category: "Sticker",
          theme: "School Spirit",
          is_rare: false,
          is_equipped: false,
          acquired_at: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
          loot_box_id: 2
        }
      ];
      
      return mockRewards;
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      handleApiError('Network error when fetching user rewards');
      return [];
    }
  }, [handleApiError]);
  
  // Get all reward types
  const getRewardTypes = useCallback(async (params?: { tier?: number; category?: string; theme?: string }): Promise<RewardType[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.tier) queryParams.append('tier', params.tier.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.theme) queryParams.append('theme', params.theme);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await fetch(`http://localhost:5000/api/reward-types${queryString}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to fetch reward types');
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching reward types:', error);
      handleApiError('Network error when fetching reward types');
      return [];
    }
  }, [handleApiError]);
  
  // Equip a reward
  const equipReward = useCallback(async (userId: number, rewardId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/rewards/${rewardId}/equip`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to equip reward');
        return false;
      }
      
      toast({
        title: "Reward Equipped",
        description: "You've successfully equipped the reward!",
      });
      
      return true;
    } catch (error) {
      console.error('Error equipping reward:', error);
      handleApiError('Network error when equipping reward');
      return false;
    }
  }, [toast, handleApiError]);
  
  // Get categories and themes
  const getCategoriesAndThemes = useCallback(async (): Promise<CategoryTheme> => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      
      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData.error || 'Failed to fetch categories and themes');
        return { categories: [], themes: [] };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories and themes:', error);
      handleApiError('Network error when fetching categories and themes');
      return { categories: [], themes: [] };
    }
  }, [handleApiError]);
  
  return {
    getUserRewards,
    getRewardTypes,
    equipReward,
    getCategoriesAndThemes
  };
}
