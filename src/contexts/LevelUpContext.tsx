
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUserStore } from '@/services/meetupService';
import LootBoxPopup from '@/components/LootBoxPopup';
import { useLevelingService } from '@/services/flaskService';
import { useRewardsService } from '@/services/flaskService';

interface LevelUpContextType {
  showStickers: boolean;
  setShowStickers: (show: boolean) => void;
  selectedSticker: number | null;
  setSelectedSticker: (sticker: number | null) => void;
  // Fields for the leveling system
  refreshUserProgress: () => void;
  isLoadingProgress: boolean;
  // New fields for the rewards system
  refreshUserRewards: () => void;
  isLoadingRewards: boolean;
}

const LevelUpContext = createContext<LevelUpContextType | undefined>(undefined);

export const LevelUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { level, selectedSticker: userSelectedSticker, setSelectedSticker: updateSelectedSticker } = useUserStore();
  const [previousLevel, setPreviousLevel] = useState(0);
  const [isLootBoxOpen, setIsLootBoxOpen] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [userId, setUserId] = useState<number | null>(null); // Will be set from auth system when available
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  
  const { getUserProgress } = useLevelingService();
  const { getUserRewards } = useRewardsService();
  
  // Function to refresh user progress data
  const refreshUserProgress = async () => {
    if (!userId) return;
    
    setIsLoadingProgress(true);
    try {
      const progress = await getUserProgress(userId);
      if (progress) {
        // This is where we'd update global state with the user's progress
        // For now we just log it
        console.log("User progress refreshed:", progress);
        
        // Check if user leveled up
        if (progress.current_level > previousLevel && previousLevel > 0) {
          console.log("Level up detected from API! Opening loot box.");
          setIsLootBoxOpen(true);
        }
        
        // Update previous level
        setPreviousLevel(progress.current_level);
      }
    } catch (error) {
      console.error("Failed to refresh user progress:", error);
    } finally {
      setIsLoadingProgress(false);
    }
  };
  
  // Function to refresh user rewards data
  const refreshUserRewards = async () => {
    if (!userId) return;
    
    setIsLoadingRewards(true);
    try {
      const rewards = await getUserRewards(userId);
      if (rewards) {
        console.log("User rewards refreshed:", rewards);
      }
    } catch (error) {
      console.error("Failed to refresh user rewards:", error);
    } finally {
      setIsLoadingRewards(false);
    }
  };
  
  // Initialize previousLevel after first render
  useEffect(() => {
    if (previousLevel === 0) {
      setPreviousLevel(level);
    }
  }, []);
  
  // Check for level up across any page
  useEffect(() => {
    console.log("Level context check:", level, "Previous:", previousLevel);
    console.log("Current selected sticker:", userSelectedSticker);
    
    if (previousLevel > 0 && level > previousLevel) {
      console.log("Level up detected globally! Opening loot box.");
      setIsLootBoxOpen(true);
    }
    
    if (previousLevel !== level && previousLevel !== 0) {
      setPreviousLevel(level);
    }
  }, [level, previousLevel]);
  
  return (
    <LevelUpContext.Provider 
      value={{ 
        showStickers, 
        setShowStickers, 
        selectedSticker: userSelectedSticker, 
        setSelectedSticker: updateSelectedSticker,
        refreshUserProgress,
        isLoadingProgress,
        refreshUserRewards,
        isLoadingRewards
      }}
    >
      {children}
      <LootBoxPopup 
        level={level}
        isOpen={isLootBoxOpen}
        onClose={() => {
          setIsLootBoxOpen(false);
          setShowStickers(true);
        }}
      />
    </LevelUpContext.Provider>
  );
};

export const useLevelUp = () => {
  const context = useContext(LevelUpContext);
  if (context === undefined) {
    throw new Error('useLevelUp must be used within a LevelUpProvider');
  }
  return context;
};
