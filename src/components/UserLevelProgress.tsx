
import React, { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, Award, Trophy, Clock, Flame } from 'lucide-react';
import { useLevelingService, UserProgress, UserActivity } from '@/services/flaskService';
import { useUserStore } from '@/services/meetupService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface UserLevelProgressProps {
  userId?: number;
  className?: string;
}

export const ActivityItem: React.FC<{ activity: UserActivity }> = ({ activity }) => {
  // Map activity types to appropriate icons
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meetup':
      case 'event':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'check_in':
        return <Award className="h-4 w-4 text-purple-500" />;
      case 'streak':
        return <Flame className="h-4 w-4 text-orange-500" />;
      case 'levelup':
        return <Trophy className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const date = new Date(activity.timestamp);

  return (
    <div className="flex items-start space-x-3 py-2">
      <div className="bg-primary/10 p-1.5 rounded-full">
        {getActivityIcon(activity.activity_type)}
      </div>
      <div className="flex-1 space-y-0.5">
        <div className="flex justify-between">
          <span className="font-medium text-sm">{activity.activity_type}</span>
          <span className="text-xs text-muted-foreground">
            {format(date, 'MMM d, h:mm a')}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{activity.description}</p>
      </div>
      <Badge variant="outline" className="bg-primary/5 text-xs">
        +{activity.xp_earned} XP
      </Badge>
    </div>
  );
};

const UserLevelProgress: React.FC<UserLevelProgressProps> = ({ userId, className }) => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { level: storedLevel, points: storedPoints } = useUserStore();
  const { getUserProgress } = useLevelingService();
  const { toast } = useToast();

  // If userId is not provided, use the stored data from useUserStore as fallback
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!userId) {
        console.log('Using mock data from useUserStore');
        return;
      }
      
      setIsLoading(true);
      try {
        const progress = await getUserProgress(userId);
        if (progress) {
          setUserProgress(progress);
        }
      } catch (error) {
        console.error('Failed to fetch user progress', error);
        toast({
          title: "Could not load progress",
          description: "Failed to fetch level progress data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProgress();
  }, [userId, getUserProgress, toast]);

  // Use stored data as fallback
  const level = userProgress?.current_level || storedLevel;
  const xp = userProgress?.current_xp || storedPoints;
  const progress = userProgress?.progress_percent || (storedPoints % 10) * 10; // Same calculation as in Profile.tsx
  const nextLevel = userProgress?.next_level || level + 1;
  const xpForNextLevel = userProgress?.xp_for_next_level || 10 - (storedPoints % 10); // Simple calculation for fallback
  
  // Determine tier color
  const getTierColor = () => {
    const tier = userProgress?.current_tier?.toLowerCase() || '';
    switch (tier) {
      case 'bronze': return 'text-amber-700';
      case 'silver': return 'text-slate-400';
      case 'gold': return 'text-yellow-500';
      case 'platinum': return 'text-blue-400';
      case 'diamond': return 'text-indigo-400';
      default: return 'text-primary';
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Level Progress</span>
          </div>
          {userProgress?.current_tier && (
            <Badge variant="outline" className={cn("ml-auto", getTierColor())}>
              {userProgress.current_tier}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Track your journey through the levels
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading progress...</div>
        ) : (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Level {level}</span>
                {nextLevel && <span>Level {nextLevel}</span>}
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{xp} XP</span>
                <span>{xpForNextLevel} XP needed</span>
              </div>
            </div>
            
            {userProgress?.active_weeks_streak && userProgress.active_weeks_streak > 0 && (
              <div className="flex items-center gap-2 py-2 px-3 bg-primary/5 rounded-md">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">
                  {userProgress.active_weeks_streak} week streak!
                </span>
                <Badge variant="outline" className="ml-auto text-xs bg-orange-500/10 text-orange-600">
                  {userProgress.activity_bonus} bonus
                </Badge>
              </div>
            )}
            
            {userProgress?.recent_activities && userProgress.recent_activities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recent Activity</h4>
                <ScrollArea className="h-[180px] pr-4">
                  <div className="space-y-1 divide-y divide-border">
                    {userProgress.recent_activities.map((activity, i) => (
                      <ActivityItem key={i} activity={activity} />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/50 text-xs text-muted-foreground">
        {userProgress?.current_semester ? (
          <span>Current semester: {userProgress.current_semester}</span>
        ) : (
          <span>Join in-person meetups to earn XP and level up!</span>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserLevelProgress;
