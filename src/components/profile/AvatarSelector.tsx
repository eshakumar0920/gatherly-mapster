
import { useState } from "react";
import { Check } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Predefined avatar options (5 men, 5 women)
const predefinedAvatars = [
  // Women avatars
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&gender=female",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&gender=female",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&gender=female",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia&gender=female",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella&gender=female",
  // Men avatars
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&gender=male",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&gender=male",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah&gender=male",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam&gender=male",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=William&gender=male",
];

interface AvatarSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAvatar: (avatarUrl: string) => void;
  currentAvatar: string | null;
}

const AvatarSelector = ({ open, onOpenChange, onSelectAvatar, currentAvatar }: AvatarSelectorProps) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);

  const handleSaveSelection = () => {
    if (selectedAvatar) {
      onSelectAvatar(selectedAvatar);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose an Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-wrap gap-4 justify-center py-4">
          {predefinedAvatars.map((avatar, index) => (
            <div key={index} className="relative cursor-pointer" onClick={() => setSelectedAvatar(avatar)}>
              <Avatar className="h-16 w-16 border-2 hover:border-primary transition-all">
                <AvatarImage src={avatar} />
                <AvatarFallback>Avatar</AvatarFallback>
              </Avatar>
              {selectedAvatar === avatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-full">
                  <Check className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-2">
          Select an avatar from the options above.
        </p>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSelection}
            disabled={!selectedAvatar}
          >
            Save Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarSelector;
