
import { useLeveling } from '@/hooks/useLeveling';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Star, Trophy, Award, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pointClassifications } from '@/services/types';

export function LevelProgress() {
  const { 
    progress, 
    isLoadingProgress 
  } = useLeveling();

  if (isLoadingProgress) {
    return <Progress value={0} className="w-full" />;
  }

  if (!progress) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">
            Level {progress.current_level}
            {progress.max_level_reached && (
              <Trophy className="h-4 w-4 ml-1 inline text-yellow-500" />
            )}
          </h4>
          <p className="text-xs text-muted-foreground">
            {progress.xp_for_next_level} XP to next level
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{progress.current_xp} XP</span>
        </div>
      </div>
      <Progress value={progress.progress_percent} className="h-2" />
      {progress.active_weeks_streak > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Award className="h-4 w-4" />
          <span>
            {progress.active_weeks_streak} week streak! ({progress.activity_bonus}% bonus)
          </span>
        </div>
      )}
      
      <div className="border-t pt-2">
        <h5 className="text-sm font-medium mb-2 flex items-center">
          <Users className="h-4 w-4 mr-1" />
          Points by Group Size
        </h5>
        <div className="space-y-2">
          {pointClassifications.map(classification => (
            <div key={classification.type} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full ${classification.color}`}>
                  {classification.label}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>{classification.minSize}-{classification.maxSize} people</span>
                <span className="font-medium">{classification.basePoints} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
