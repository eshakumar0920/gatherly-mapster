
import { useState, useEffect } from "react";
import { format, isValid, parseISO } from "date-fns";
import { Clock, MapPin, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/services/meetupService";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Meetup } from "@/types/meetup";

interface MeetupCardProps {
  meetup: Meetup;
}

const MeetupCard = ({ meetup }: MeetupCardProps) => {
  const { joinMeetupLobby, joinedLobbies } = useUserStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isJoinedLobby = joinedLobbies?.includes(meetup.id);
  const [currentAttendees, setCurrentAttendees] = useState(meetup.attendees?.length || 0);
  const isLobbyFull = currentAttendees >= meetup.lobbySize;
  
  // Update the attendees count when the user joins
  useEffect(() => {
    // If user has joined this meetup's lobby, increment the attendee count by 1 if not already counted
    if (isJoinedLobby) {
      setCurrentAttendees(prev => {
        // Check if the initial value already includes this user's join
        const initialAttendeeCount = meetup.attendees?.length || 0;
        // If the previous count is just the initial count, add 1 for this user
        return Math.max(prev, initialAttendeeCount + 1);
      });
    } else {
      // Reset to the initial attendees count if not joined
      setCurrentAttendees(meetup.attendees?.length || 0);
    }
  }, [isJoinedLobby, meetup.attendees, meetup.id]);
  
  const formattedDateTime = (() => {
    if (meetup.dateTime == null) {
      return "Date unavailable";
    }

    try {
      let dateObj: Date | null = null;

      if (typeof meetup.dateTime === 'string') {
        const parsedDate = parseISO(meetup.dateTime);
        if (isValid(parsedDate)) {
          dateObj = parsedDate;
        } else {
          // Try with a more lenient approach to parse the date string
          try {
            const fallbackDate = new Date(meetup.dateTime);
            if (isValid(fallbackDate)) {
              dateObj = fallbackDate;
            }
          } catch (innerError) {
            console.error("Inner parsing error:", innerError);
            // If this also fails, we'll return the unparsed string later
          }
        }
      } else if (typeof meetup.dateTime === 'object' && meetup.dateTime !== null && 'getTime' in meetup.dateTime) {
        dateObj = meetup.dateTime as Date;
      }

      if (dateObj && isValid(dateObj)) {
        return format(dateObj, "MM/dd/yyyy h:mm a");
      }

      // If we couldn't parse it, just return the original string
      return typeof meetup.dateTime === 'string' ? meetup.dateTime : "Date unavailable";
    } catch (error) {
      console.error("Error formatting date:", error, "Date value:", meetup.dateTime);
      return typeof meetup.dateTime === 'string' ? meetup.dateTime : "Date unavailable";
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
    
    // Immediately update the attendee count when joining
    setCurrentAttendees(prev => prev + 1);
    
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
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base line-clamp-1">{meetup.title}</h3>
            {meetup.category && (
              <Badge variant="outline" className="text-xs">
                {meetup.category}
              </Badge>
            )}
          </div>
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
