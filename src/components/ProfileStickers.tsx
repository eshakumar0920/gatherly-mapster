
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { useUserStore } from '@/services/meetupService';
import { useToast } from '@/hooks/use-toast';
import { stickers, StickerType } from '@/utils/badgeData';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProfileStickerProps {
  level: number;
  selectedSticker: number | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// This component displays the sticker on the profile picture
export const ProfileSticker: React.FC<ProfileStickerProps> = ({ 
  level, 
  selectedSticker,
  className = "",
  size = 'md'
}) => {
  const stickerIndex = selectedSticker !== null 
    ? selectedSticker 
    : Math.min(level - 1, stickers.length - 1);
    
  if (stickerIndex < 0) return null;
  
  const sticker = stickers[stickerIndex];
  const IconComponent = sticker.icon;
  
  // Map size prop to actual Tailwind classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  const iconSize = sizeClasses[size];
  
  return (
    <div className={`absolute -bottom-1 -left-1 ${className}`}>
      <div className={`bg-white rounded-full p-1 shadow-md ${sticker.color}`}>
        <IconComponent className={iconSize} fill="currentColor" />
      </div>
    </div>
  );
};

// This component shows the sticker selection dialog
const ProfileStickers: React.FC = () => {
  const { showAvatars: showStickers, setShowAvatars: setShowStickers, selectedAvatar: selectedSticker, setSelectedAvatar: setSelectedSticker } = useLevelUp();
  const { level } = useUserStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const availableStickers = stickers.filter(sticker => sticker.level <= level);
  
  const handleSelectSticker = (index: number) => {
    setSelectedSticker(index);
    setShowStickers(false);
    
    toast({
      title: "Sticker selected!",
      description: `You've added the ${stickers[index].name} to your profile.`
    });
  };

  const goToBadgesPage = () => {
    setShowStickers(false);
    navigate('/badges');
  };
  
  return (
    <Dialog open={showStickers} onOpenChange={setShowStickers}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Choose Your Profile Sticker</DialogTitle>
          <DialogDescription>
            Select a sticker to display on your profile picture.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Select a sticker to display on your profile picture. You've unlocked {availableStickers.length} out of {stickers.length} stickers!
          </p>
          
          <ScrollArea className="h-[50vh] pr-4">
            <div className="grid grid-cols-4 gap-4 pb-4">
              {stickers.map((sticker, index) => {
                const isUnlocked = sticker.level <= level;
                const IconComponent = sticker.icon;
                
                return (
                  <div 
                    key={index}
                    onClick={() => isUnlocked && handleSelectSticker(index)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border 
                      ${isUnlocked 
                        ? `${sticker.color} cursor-pointer hover:bg-muted transition-colors` 
                        : 'opacity-40 bg-muted/50 cursor-not-allowed'}
                      ${selectedSticker === index ? 'ring-2 ring-primary' : ''}
                    `}
                  >
                    <IconComponent 
                      className={`h-12 w-12 ${isUnlocked ? sticker.color : 'text-gray-400'}`}
                      fill={isUnlocked ? "currentColor" : "none"}
                    />
                    <p className="text-xs mt-2 text-center font-medium">
                      {sticker.name}
                    </p>
                    {!isUnlocked && (
                      <span className="text-xs mt-1">
                        Level {sticker.level}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowStickers(false)}>
            Close
          </Button>
          <Button variant="secondary" onClick={goToBadgesPage}>
            View All Badges
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileStickers;
