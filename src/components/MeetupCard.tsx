import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { Clock, MapPin, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meetup, useUserStore } from "@/services/meetupService";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface MeetupCardProps {
  meetup: Meetup;
}

const MeetupCard = ({ meetup }: MeetupCardProps) => {
  const { joinMeetupLobby, joinedLobbies } = useUserStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isJoinedLobby = joinedLobbies?.includes(meetup.id);
  const currentAttendees = meetup.attendees?.length || 0;
  const isLobbyFull = currentAttendees >= meetup.lobbySize;
  
  // Handle date formatting with validation and null check
  const formattedDateTime = (() => {
    // Explicitly check if dateTime is null or undefined
    if (!meetup.dateTime) {
      return "Date unavailable";
    }

    try {
      // First, check if dateTime is already a valid Date object
      if (typeof meetup.dateTime === 'object' && meetup.dateTime !== null && 'getTime' in meetup.dateTime) {
        const dateObj = meetup.dateTime as Date;
        return isValid(dateObj) 
          ? format(dateObj, "MM/dd/yyyy h:mm a") 
          : "Invalid date";
      }
      
      // If it's a string, try to parse it
      if (typeof meetup.dateTime === 'string') {
        // Try parsing as ISO format first
        const date = parseISO(meetup.dateTime);
        if (isValid(date)) {
          return format(date, "MM/dd/yyyy h:mm a");
        }
        
        // If not ISO format, try direct Date constructor
        const fallbackDate = new Date(meetup.dateTime);
        if (isValid(fallbackDate)) {
          return format(fallbackDate, "MM/dd/yyyy h:mm a");
        }
      }
      
      // If we can't parse it, return a placeholder
      return "Date unavailable";
    } catch (error) {
      console.error("Error formatting date:", error, "Date value:", meetup.dateTime);
      return "Date unavailable";
    }
  })();

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
    
    joinMeetupLobby(meetup.id);
    
    toast({
      title: "Joined lobby",
      description: "You've joined the meetup lobby. Don't forget to scan the QR code at the meetup to check in and earn points!",
    });
    
    navigate(`/meetups/${meetup.id}`);
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
          <span>{formattedDateTime}</span>
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
          variant={isJoinedLobby ? "outline" : "yellow"}
          disabled={isJoinedLobby || isLobbyFull}
        >
          {isJoinedLobby ? (
            "In Lobby"
          ) : isLobbyFull ? (
            "Lobby Full"
          ) : (
            "Join Lobby"
          )}
        </Button>
      </div>
    </div>
  );
};

export default MeetupCard;
