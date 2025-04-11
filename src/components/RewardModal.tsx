
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward?: {
    name: string;
    description: string;
    image_url: string;
    tier: string;
    category: string;
    theme?: string;
    is_rare: boolean;
  };
}

const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose, reward }) => {
  if (!reward) return null;

  // Get the tier color for the reward
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'common': return 'bg-slate-200 text-slate-800';
      case 'uncommon': return 'bg-green-200 text-green-800';
      case 'rare': return 'bg-blue-200 text-blue-800';
      case 'epic': return 'bg-purple-200 text-purple-800';
      case 'legendary': return 'bg-orange-200 text-orange-800';
      case 'mythic': return 'bg-pink-200 text-pink-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Reward!</DialogTitle>
          <DialogDescription>
            You've received a new reward from the loot box.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 my-6">
          <div className="w-32 h-32 bg-muted rounded-md overflow-hidden relative">
            {reward.image_url ? (
              <Avatar className="w-full h-full rounded-md">
                <AvatarImage src={reward.image_url} alt={reward.name} className="object-cover" />
                <AvatarFallback className="text-lg w-full h-full">
                  <ImageIcon className="h-12 w-12 opacity-50" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 opacity-50" />
              </div>
            )}
            
            {reward.is_rare && (
              <Badge className="absolute top-2 right-2 bg-yellow-500">
                Rare
              </Badge>
            )}
          </div>

          <h3 className="text-lg font-medium">{reward.name}</h3>
          <p className="text-center text-muted-foreground">{reward.description}</p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className={cn(getTierColor(reward.tier))}>
              {reward.tier}
            </Badge>
            
            <Badge variant="outline">
              {reward.category}
            </Badge>
            
            {reward.theme && (
              <Badge variant="outline">
                {reward.theme}
              </Badge>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Awesome!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RewardModal;
