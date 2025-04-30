import React from "react";
import { useLevelUp } from "@/contexts/LevelUpContext";
import { Award, Star, Tag, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/ProfileAvatars";

interface ProfileHeaderProps {
  name: string;
  email: string;
  level: number;
  points: number;
  attendedMeetups: any[];
  tags: string[];
  selectedAvatar: number | null;
  openAvatarSelector: () => void;
  openTagDialog: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  level,
  points,
  attendedMeetups,
  tags,
  selectedAvatar,
  openAvatarSelector,
  openTagDialog
}) => {
  const progress = (points % 10) * 10;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative cursor-pointer" onClick={openAvatarSelector}>
        <ProfileAvatar 
          level={level} 
          selectedAvatar={selectedAvatar} 
          size="lg"
          className="mb-4"
        />
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-1"
          onClick={(e) => {
            e.stopPropagation();
            openAvatarSelector();
          }}
        >
          <User className="h-4 w-4" />
        </Button>
      </div>
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="text-muted-foreground">{email}</p>
      
      <div className="flex flex-wrap gap-1 mt-2 justify-center">
        {tags.map(tag => (
          <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full h-6 text-xs"
          onClick={openTagDialog}
        >
          <Tag className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>

      <div className="bg-primary/5 p-4 rounded-lg mt-4 w-full">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-primary mr-2" />
            <span className="font-semibold">Level {level}</span>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-primary mr-1" />
            <span>{points} points</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progress to Level {level + 1}</span>
            <span>{points % 10}/10 points</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <span>Attended {attendedMeetups.length} meetups</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
