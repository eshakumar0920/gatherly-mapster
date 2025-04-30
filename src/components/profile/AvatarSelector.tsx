
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Simplified avatar options with direct SVG URLs
const predefinedAvatars = {
  women: [
    // 5 women with different skin tones
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&gender=female&mouth=smile&skinColor=light",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&gender=female&mouth=smile&skinColor=brown",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&gender=female&mouth=smile&skinColor=dark",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia&gender=female&mouth=smile&skinColor=black",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella&gender=female&mouth=smile&skinColor=tanned"
  ],
  men: [
    // 5 men with different skin tones
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&gender=male&mouth=smile&skinColor=light",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&gender=male&mouth=smile&skinColor=brown",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah&gender=male&mouth=smile&skinColor=dark",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam&gender=male&mouth=smile&skinColor=black",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=William&gender=male&mouth=smile&skinColor=tanned"
  ]
};

interface AvatarSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAvatar: (avatarUrl: string) => void;
  currentAvatar: string | null;
}

const AvatarSelector = ({ open, onOpenChange, onSelectAvatar, currentAvatar }: AvatarSelectorProps) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);
  const [selectedTab, setSelectedTab] = useState<string>("women");

  const handleSaveSelection = () => {
    if (selectedAvatar) {
      onSelectAvatar(selectedAvatar);
      onOpenChange(false);
    }
  };

  // Make sure the avatar is selected when dialog opens if currentAvatar matches
  // one of the predefined avatars
  useEffect(() => {
    if (currentAvatar) {
      setSelectedAvatar(currentAvatar);
      
      // Find which tab the current avatar belongs to
      for (const [category, avatars] of Object.entries(predefinedAvatars)) {
        if (avatars.includes(currentAvatar)) {
          setSelectedTab(category);
          break;
        }
      }
    }
  }, [currentAvatar, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose an Avatar</DialogTitle>
        </DialogHeader>
        
        <Tabs 
          defaultValue="women" 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="women">Women</TabsTrigger>
            <TabsTrigger value="men">Men</TabsTrigger>
          </TabsList>
          
          {Object.entries(predefinedAvatars).map(([category, avatars]) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="flex flex-wrap gap-4 justify-center py-4">
                {avatars.map((avatar, index) => (
                  <div 
                    key={index} 
                    className="relative cursor-pointer" 
                    onClick={() => setSelectedAvatar(avatar)}
                  >
                    <Avatar className={`h-16 w-16 border-2 transition-all ${selectedAvatar === avatar ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}>
                      <AvatarImage src={avatar} alt={`Avatar option ${index + 1}`} />
                      <AvatarFallback>
                        {category.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedAvatar === avatar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-full">
                        <Check className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        <p className="text-xs text-center text-muted-foreground mt-2">
          Select an avatar that represents you best.
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
