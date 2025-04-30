
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useUserStore } from '@/services/meetupService';

interface LevelUpContextProps {
  showLevelUp: boolean;
  setShowLevelUp: (show: boolean) => void;
  newLevel: number | null;
  setNewLevel: (level: number | null) => void;
  showStickers: boolean;
  setShowStickers: (show: boolean) => void;
  selectedSticker: number | null;
  setSelectedSticker: (index: number | null) => void;
}

const LevelUpContext = createContext<LevelUpContextProps | undefined>(undefined);

export function LevelUpProvider({ children }: { children: ReactNode }) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const { selectedSticker, setSelectedSticker: updateSelectedSticker } = useUserStore();

  const setSelectedSticker = (index: number | null) => {
    updateSelectedSticker(index);
  };

  return (
    <LevelUpContext.Provider
      value={{
        showLevelUp,
        setShowLevelUp,
        newLevel,
        setNewLevel,
        showStickers,
        setShowStickers,
        selectedSticker,
        setSelectedSticker,
      }}
    >
      {children}
    </LevelUpContext.Provider>
  );
}

export function useLevelUp() {
  const context = useContext(LevelUpContext);
  if (context === undefined) {
    throw new Error('useLevelUp must be used within a LevelUpProvider');
  }
  return context;
}
