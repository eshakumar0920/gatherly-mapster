
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserReward, useRewardsService } from '@/services/flaskService';
import { useToast } from '@/hooks/use-toast';
import { Award, Check, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserRewardsProps {
  userId?: number;
  className?: string;
  onEquipReward?: () => void;
}

const UserRewards: React.FC<UserRewardsProps> = ({ userId, className, onEquipReward }) => {
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [equippingRewardId, setEquippingRewardId] = useState<number | null>(null);
  const { getUserRewards, equipReward } = useRewardsService();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRewards = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const userRewards = await getUserRewards(userId);
        setRewards(userRewards);
      } catch (error) {
        console.error('Failed to fetch rewards', error);
        toast({
          title: "Could not load rewards",
          description: "Failed to fetch your rewards collection",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewards();
  }, [userId, getUserRewards, toast]);

  const handleEquipReward = async (rewardId: number) => {
    if (!userId) return;
    
    setEquippingRewardId(rewardId);
    try {
      const success = await equipReward(userId, rewardId);
      if (success) {
        // Update the local state to mark this reward as equipped and others as not
        setRewards(prev => prev.map(reward => 
          reward.id === rewardId 
            ? { ...reward, is_equipped: true } 
            : { ...reward, is_equipped: false }
        ));
        
        // Call the callback to notify parent component if needed
        if (onEquipReward) onEquipReward();
      }
    } catch (error) {
      console.error('Failed to equip reward', error);
      toast({
        title: "Error",
        description: "Could not equip the reward",
        variant: "destructive"
      });
    } finally {
      setEquippingRewardId(null);
    }
  };

  // Get unique categories from rewards
  const categories = ["all", ...new Set(rewards.map(reward => reward.category))];
  
  // Filter rewards by active category
  const filteredRewards = activeCategory === "all" 
    ? rewards 
    : rewards.filter(reward => reward.category === activeCategory);

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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <span>Your Rewards</span>
        </CardTitle>
        <CardDescription>
          Rewards you've earned from loot boxes
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading rewards...</div>
        ) : rewards.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p>No rewards yet!</p>
            <p className="text-xs mt-1">Open loot boxes to earn rewards</p>
          </div>
        ) : (
          <>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="flex overflow-x-auto pb-px">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    onClick={() => setActiveCategory(category)}
                    className="min-w-max"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={activeCategory}>
                <ScrollArea className="h-[320px] pr-4">
                  <div className="grid grid-cols-2 gap-3">
                    {filteredRewards.map((reward) => (
                      <div 
                        key={reward.id} 
                        className={cn(
                          "border rounded-lg p-3 transition-all",
                          reward.is_equipped ? "border-primary border-2" : "hover:shadow-md"
                        )}
                      >
                        <div className="flex flex-col h-full">
                          <div className="aspect-square bg-muted rounded-md mb-2 overflow-hidden relative">
                            {reward.image_url ? (
                              <Avatar className="w-full h-full rounded-md">
                                <AvatarImage src={reward.image_url} alt={reward.name} className="object-cover" />
                                <AvatarFallback className="text-lg w-full h-full">
                                  <ImageIcon className="h-8 w-8 opacity-50" />
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 opacity-50" />
                              </div>
                            )}
                            
                            {reward.is_rare && (
                              <Badge className="absolute top-1 right-1 bg-yellow-500">
                                Rare
                              </Badge>
                            )}
                            
                            {reward.is_equipped && (
                              <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-sm">{reward.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">{reward.description}</p>
                            
                            <div className="mt-2 flex items-center justify-between">
                              <span className={cn(
                                "px-1.5 py-0.5 rounded-full text-xs font-medium",
                                getTierColor(reward.tier)
                              )}>
                                {reward.tier}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {reward.theme}
                              </span>
                            </div>
                            
                            <div className="mt-3">
                              <Button 
                                size="sm"
                                variant={reward.is_equipped ? "outline" : "default"}
                                className="w-full"
                                onClick={() => handleEquipReward(reward.id)}
                                disabled={equippingRewardId === reward.id || reward.is_equipped}
                              >
                                {equippingRewardId === reward.id ? (
                                  "Equipping..."
                                ) : reward.is_equipped ? (
                                  <span className="flex items-center gap-1">
                                    <Check className="h-3 w-3" />
                                    Equipped
                                  </span>
                                ) : (
                                  "Equip Reward"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRewards;
