
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUserStore } from '@/services/meetupService';
import LootBoxPopup from '@/components/LootBoxPopup';

interface LevelUpContextType {
  showStickers: boolean;
  setShowStickers: (show: boolean) => void;
  selectedSticker: number | null;
  setSelectedSticker: (sticker: number | null) => void;
}

const LevelUpContext = createContext<LevelUpContextType | undefined>(undefined);

export const LevelUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { level } = useUserStore();
  const [previousLevel, setPreviousLevel] = useState(0);
  const [isLootBoxOpen, setIsLootBoxOpen] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<number | null>(null);
  
  // Initialize previousLevel after first render
  useEffect(() => {
    if (previousLevel === 0) {
      setPreviousLevel(level);
    }
  }, []);
  
  // Check for level up across any page
  useEffect(() => {
    console.log("Level context check:", level, "Previous:", previousLevel);
    
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
        selectedSticker, 
        setSelectedSticker 
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
