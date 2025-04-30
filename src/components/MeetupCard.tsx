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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";

interface MeetupCardProps {
  meetup: Meetup;
}

interface Attendee {
  id: string;
  name: string;
  avatar?: string;
  status: "going" | "interested";
}

const MeetupCard = ({ meetup }: MeetupCardProps) => {
  const { joinMeetupLobby, joinedLobbies } = useUserStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isJoinedLobby = joinedLobbies?.includes(meetup.id);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  
  // Initialize meetup-specific attendees based on meetup ID
  useEffect(() => {
    // Get some variation based on meetup ID
    const idSum = meetup.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
    
    // Create a unique set of attendees based on the meetup ID
    const baseAttendees: Attendee[] = [];
    
    // Add Jane Cooper for most meetups
    if (idSum % 2 === 0) {
      baseAttendees.push({ 
        id: "1", 
        name: "Jane Cooper", 
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop", 
        status: "going" 
      });
    }
    
    // Add Wade Warren for some meetups
    if (idSum % 3 === 0) {
      baseAttendees.push({ 
        id: "2", 
        name: "Wade Warren", 
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&auto=format&fit=crop", 
        status: "going" 
      });
    }
    
    // Only add Esther Howard for some meetups
    if (idSum > 2) {
      baseAttendees.push({ 
        id: "3", 
        name: "Esther Howard", 
        avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&auto=format&fit=crop", 
        status: "interested" 
      });
    }
    
    // Check if current user is in the lobby
    if (isJoinedLobby && user) {
      // Add current user to attendees list
      const userAlreadyInList = baseAttendees.some(a => a.id === user.id);
      
      if (!userAlreadyInList) {
        baseAttendees.push({
          id: user.id,
          name: user.email?.split('@')[0] || "Current User",
          status: "going"
        });
      }
    }
    
    setAttendees(baseAttendees);
  }, [meetup.id, isJoinedLobby, user]);
  
  const formattedDateTime = (() => {
    if (meetup.dateTime == null) {
      return "Date unavailable";
    }

    // For already formatted strings like "Today @3pm", just return as is
    if (typeof meetup.dateTime === 'string' && 
        (meetup.dateTime.includes('@') || 
         meetup.dateTime.toLowerCase().includes('today') || 
         meetup.dateTime.toLowerCase().includes('tomorrow'))) {
      return meetup.dateTime;
    }

    // Try to parse as a date for other cases
    try {
      let dateObj: Date | null = null;

      if (typeof meetup.dateTime === 'string') {
        // First try ISO format
        const parsedDate = parseISO(meetup.dateTime);
        if (isValid(parsedDate)) {
          dateObj = parsedDate;
        } else {
          // Try with a more lenient approach
          const fallbackDate = new Date(meetup.dateTime);
          if (isValid(fallbackDate)) {
            dateObj = fallbackDate;
          }
        }
      } else if (meetup.dateTime instanceof Date) {
        dateObj = meetup.dateTime;
      }

      if (dateObj && isValid(dateObj)) {
        return format(dateObj, "MMM d, yyyy h:mm a");
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
    
    if (attendees.length >= meetup.lobbySize) {
      toast({
        title: "Lobby is full",
        description: `This meetup has reached its maximum capacity of ${meetup.lobbySize} attendees.`,
        variant: "destructive",
      });
      return;
    }
    
    joinMeetupLobby(meetup.id);
    
    // Update attendees list to include the current user
    if (user) {
      setAttendees(prev => {
        // Check if user is already in the list
        if (!prev.some(a => a.id === user.id)) {
          return [
            ...prev, 
            {
              id: user.id,
              name: user.email?.split('@')[0] || "Current User",
              status: "going"
            }
          ];
        }
        return prev;
      });
    }
    
    toast({
      title: "Joined lobby",
      description: "You've joined the meetup lobby. Don't forget to scan the QR code at the meetup to check in and earn points!",
    });
    
    navigate(`/meetups/${meetup.id}`);
  };

  const handleViewDetails = () => {
    navigate(`/meetups/${meetup.id}`);
  };
  
  // Check if the lobby is full based on actual attendees array
  const isLobbyFull = attendees.length >= meetup.lobbySize;
  
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
          
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <Users className="h-4 w-4 mr-1" />
                <span>{attendees.length}/{meetup.lobbySize}</span>
                
                {/* Show mini avatars for attendees */}
                {attendees.length > 0 && (
                  <div className="flex -space-x-2 ml-2">
                    {attendees.slice(0, 2).map((attendee, index) => (
                      <Avatar key={`${attendee.id}-${index}`} className="h-5 w-5 border border-background">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {attendees.length > 2 && (
                      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs">
                        +{attendees.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="end">
              <h4 className="font-medium text-sm mb-2">Attendees</h4>
              <div className="space-y-2">
                {attendees.length > 0 ? (
                  attendees.map((attendee, index) => (
                    <div key={`${attendee.id}-${index}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{attendee.name}</span>
                      </div>
                      <Badge 
                        variant={attendee.status === "going" ? "default" : "outline"} 
                        className="text-xs capitalize"
                      >
                        {attendee.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No attendees yet. Be the first!</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
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
