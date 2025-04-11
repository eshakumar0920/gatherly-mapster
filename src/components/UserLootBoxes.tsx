
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LootBox, useLevelingService } from '@/services/flaskService';
import { useToast } from '@/hooks/use-toast';
import { Package, Gift, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface UserLootBoxesProps {
  userId?: number;
  className?: string;
  onOpenBox?: () => void;
}

const UserLootBoxes: React.FC<UserLootBoxesProps> = ({ userId, className, onOpenBox }) => {
  const [lootBoxes, setLootBoxes] = useState<LootBox[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openingBoxId, setOpeningBoxId] = useState<number | null>(null);
  const { getUserLootboxes, openLootbox } = useLevelingService();
  const { toast } = useToast();

  useEffect(() => {
    const fetchLootBoxes = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const boxes = await getUserLootboxes(userId);
        setLootBoxes(boxes);
      } catch (error) {
        console.error('Failed to fetch lootboxes', error);
        toast({
          title: "Could not load lootboxes",
          description: "Failed to fetch your reward boxes",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLootBoxes();
  }, [userId, getUserLootboxes, toast]);

  const handleOpenLootBox = async (boxId: number) => {
    if (!userId) return;
    
    setOpeningBoxId(boxId);
    try {
      const success = await openLootbox(userId, boxId);
      if (success) {
        // Update the local state to mark the box as opened
        setLootBoxes(prev => prev.map(box => 
          box.id === boxId ? { ...box, is_opened: true, opened_at: new Date().toISOString() } : box
        ));
        
        // Call the callback to notify parent component if needed
        if (onOpenBox) onOpenBox();
      }
    } catch (error) {
      console.error('Failed to open lootbox', error);
      toast({
        title: "Error",
        description: "Could not open the loot box",
        variant: "destructive"
      });
    } finally {
      setOpeningBoxId(null);
    }
  };

  // Get the tier color for the box
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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <span>Your Loot Boxes</span>
        </CardTitle>
        <CardDescription>
          Open boxes to receive rewards
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading loot boxes...</div>
        ) : lootBoxes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p>No loot boxes yet!</p>
            <p className="text-xs mt-1">Join events and level up to earn rewards</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {lootBoxes.map(box => (
                <div 
                  key={box.id} 
                  className={cn(
                    "border rounded-lg p-4 transition-all",
                    box.is_opened ? "opacity-60" : "hover:shadow-md"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-md", 
                      getTierColor(box.tier)
                    )}>
                      {box.is_opened ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Package className="h-6 w-6" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm">{box.type_name}</h3>
                          <p className="text-xs text-muted-foreground">{box.description}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(box.awarded_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs flex items-center gap-2">
                        <span className="text-muted-foreground">{box.awarded_for}</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-xs font-medium",
                          getTierColor(box.tier)
                        )}>
                          {box.tier}
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        {box.is_opened ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3" />
                            <span>
                              Opened {box.opened_at ? format(new Date(box.opened_at), 'MMM d, yyyy') : ''}
                            </span>
                          </div>
                        ) : (
                          <Button 
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOpenLootBox(box.id)}
                            disabled={openingBoxId === box.id}
                          >
                            {openingBoxId === box.id ? (
                              "Opening..."
                            ) : (
                              <>
                                <Lock className="h-3 w-3 mr-1" />
                                Open Box
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default UserLootBoxes;
