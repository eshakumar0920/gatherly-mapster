
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useUserStore } from '@/services/meetupService';

interface LevelUpContextProps {
  showLevelUp: boolean;
  setShowLevelUp: (show: boolean) => void;
  newLevel: number | null;
  setNewLevel: (level: number | null) => void;
  showAvatars: boolean;
  setShowAvatars: (show: boolean) => void;
  selectedAvatar: number | null;
  setSelectedAvatar: (index: number | null) => void;
}

const LevelUpContext = createContext<LevelUpContextProps | undefined>(undefined);

export function LevelUpProvider({ children }: { children: ReactNode }) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [showAvatars, setShowAvatars] = useState(false);
  const { selectedSticker: selectedAvatar, setSelectedSticker: updateSelectedAvatar } = useUserStore();

  const setSelectedAvatar = (index: number | null) => {
    updateSelectedAvatar(index);
  };

  return (
    <LevelUpContext.Provider
      value={{
        showLevelUp,
        setShowLevelUp,
        newLevel,
        setNewLevel,
        showAvatars,
        setShowAvatars,
        selectedAvatar,
        setSelectedAvatar,
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
