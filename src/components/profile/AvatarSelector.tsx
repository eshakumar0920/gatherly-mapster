
import { useState } from "react";
import { Check } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Diverse predefined avatar options
const predefinedAvatars = {
  women: [
    // Women with different skin tones and features
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&gender=female&mouth=smile&skinColor=light&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&gender=female&mouth=smile&skinColor=pale&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&gender=female&mouth=smile&skinColor=dark&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia&gender=female&mouth=smile&skinColor=black&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella&gender=female&mouth=smile&skinColor=brown&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&gender=female&mouth=smile&skinColor=tanned&eyes=happy",
  ],
  men: [
    // Men with different skin tones and features
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&gender=male&mouth=smile&skinColor=light&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&gender=male&mouth=smile&skinColor=pale&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah&gender=male&mouth=smile&skinColor=dark&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam&gender=male&mouth=smile&skinColor=black&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=William&gender=male&mouth=smile&skinColor=brown&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar&gender=male&mouth=smile&skinColor=tanned&eyes=happy",
  ],
  nonbinary: [
    // Non-binary/gender neutral options with different skin tones
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&mouth=smile&skinColor=light&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&mouth=smile&skinColor=pale&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor&mouth=smile&skinColor=dark&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Robin&mouth=smile&skinColor=black&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey&mouth=smile&skinColor=brown&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan&mouth=smile&skinColor=tanned&eyes=happy",
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
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="women">Women</TabsTrigger>
            <TabsTrigger value="men">Men</TabsTrigger>
            <TabsTrigger value="nonbinary">Non-Binary</TabsTrigger>
          </TabsList>
          
          {Object.entries(predefinedAvatars).map(([category, avatars]) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="flex flex-wrap gap-4 justify-center py-4">
                {avatars.map((avatar, index) => (
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
