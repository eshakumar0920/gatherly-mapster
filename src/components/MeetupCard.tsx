
import { Clock, MapPin, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meetup, useUserStore } from "@/services/meetupService";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface MeetupCardProps {
  meetup: Meetup;
}

const MeetupCard = ({ meetup }: MeetupCardProps) => {
  const { attendMeetup, attendedMeetups } = useUserStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isJoined = attendedMeetups?.includes(meetup.id);
  const currentAttendees = meetup.attendees?.length || 0;
  const isLobbyFull = currentAttendees >= meetup.lobbySize;
  
  const handleJoinMeetup = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLobbyFull) {
      toast({
        title: "Lobby is full",
        description: `This meetup has reached its maximum capacity of ${meetup.lobbySize} attendees.`,
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/meetups/${meetup.id}?join=true`);
  };

  const handleViewDetails = () => {
    navigate(`/meetups/${meetup.id}`);
  };
  
  return (
    <div className="border rounded-lg p-4 bg-card animate-fade-in" onClick={handleViewDetails}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-base line-clamp-1">{meetup.title}</h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
            {meetup.description}
          </p>
        </div>
        <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-full text-yellow-600 text-xs">
          +{meetup.points} pts
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          <span>{meetup.dateTime}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{meetup.location}</span>
        </div>
        
        <div className="flex justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarImage src={meetup.creatorAvatar || ""} />
                <AvatarFallback>{meetup.createdBy.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{meetup.createdBy}</span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>{currentAttendees}/{meetup.lobbySize}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          className="w-full flex items-center justify-center" 
          onClick={handleJoinMeetup} 
          variant={isJoined ? "outline" : "yellow"}
          disabled={isJoined || isLobbyFull}
        >
          {isJoined ? (
            "Joined"
          ) : isLobbyFull ? (
            "Lobby Full"
          ) : (
            "Join Meetup"
          )}
        </Button>
      </div>
    </div>
  );
};

export default MeetupCard;
