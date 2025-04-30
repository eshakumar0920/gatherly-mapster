
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
import { useMeetups } from "@/hooks/useMeetups";
import { supabase } from "@/integrations/supabase/client";

interface MeetupCardProps {
  meetup: Meetup;
}

// Define the Attendee interface to fix TypeScript errors
interface Attendee {
  id: string;
  name: string;
  avatar?: string;
  status: "going" | "interested";
}

// Array of happier illustrated avatars with cheerful expressions
const illustratedAvatars = [
  "/placeholder.svg", // Default placeholder SVG
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&mouth=smile&eyes=happy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&mouth=smile&eyes=happy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight&mouth=smile&eyes=happy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Fluffy&mouth=smile&eyes=happy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo&mouth=smile&eyes=happy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&mouth=smile&eyes=happy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella&mouth=smile&eyes=happy",
];

// Special avatars for specific people - updated with specified characteristics
const specialAvatars = {
  "patrick": "https://api.dicebear.com/7.x/avataaars/svg?seed=Patrick&mouth=smile&eyes=happy&skinColor=f2d3b1&hairColor=a55728&accessoriesType=round&facialHairType=none&facialHairColor=a55728&clotheType=hoodie&clotheColor=3c4f5c&eyebrowType=default&mouthType=smile&top=shortHair&eyeType=happy",
  "neethu": "https://api.dicebear.com/7.x/avataaars/svg?seed=Neethu&mouth=smile&eyes=happy&skinColor=ae8569&hairColor=2c1b18&accessoriesType=none&facialHairType=none&clotheType=overall&clotheColor=d14836&eyebrowType=default&mouthType=smile&top=longHair&eyeType=happy",
  "esha": "https://api.dicebear.com/7.x/avataaars/svg?seed=Esha&mouth=smile&eyes=happy&skinColor=ae8569&hairColor=2c1b18&accessoriesType=none&facialHairType=none&clotheType=blazer&clotheColor=624a2e&eyebrowType=default&mouthType=smile&top=longHair&eyeType=happy",
  "sophia": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&mouth=smile&eyes=happy&skinColor=f2d3b1&hairColor=4a312c&accessoriesType=none&facialHairType=none&clotheType=blazer&clotheColor=5199e4&eyebrowType=default&mouthType=smile&top=longHair&eyeType=happy"
};

// Helper to get a consistent avatar for a specific user ID or name
const getAvatarForUser = (id: string, name?: string) => {
  // Check for special names (case-insensitive)
  if (name) {
    const lowerName = name.toLowerCase();
    for (const [specialName, avatar] of Object.entries(specialAvatars)) {
      if (lowerName.includes(specialName)) {
        return avatar;
      }
    }
  }

  // Convert the id or name to a number to use as index
  const charSum = (id + (name || "")).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return illustratedAvatars[charSum % illustratedAvatars.length];
};

// Export the avatar generator function to use elsewhere in the app
export { getAvatarForUser };

const MeetupCard = ({ meetup }: MeetupCardProps) => {
  const { joinMeetupLobby, joinedLobbies, userId, avatar } = useUserStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinMeetupLobby: joinMeetupInDb } = useMeetups();
  
  const isJoinedLobby = joinedLobbies?.includes(meetup.id);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<{name: string, avatar?: string}>({
    name: meetup.createdBy || "Anonymous",
    avatar: getAvatarForUser(meetup.id, meetup.createdBy) // Use illustrated avatar
  });
  
  // Fetch creator info if not available
  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (meetup.createdBy) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('username, profile_picture')
            .eq('username', meetup.createdBy)
            .single();
            
          if (!error && data) {
            setCreatorInfo({
              name: data.username || meetup.createdBy,
              // Use illustrated avatar instead of profile picture
              avatar: getAvatarForUser(meetup.createdBy, data.username)
            });
          }
        } catch (err) {
          console.error("Error fetching creator info:", err);
        }
      } else {
        setCreatorInfo({
          name: meetup.createdBy || "Anonymous",
          avatar: getAvatarForUser(meetup.id)
        });
      }
    };
    
    fetchCreatorInfo();
  }, [meetup.createdBy, meetup.creatorAvatar]);
  
  // Fetch actual attendees from database - removing mock data
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select(`
            user_id,
            attendance_status,
            users!inner(
              username,
              profile_picture
            )
          `)
          .eq('event_id', parseInt(meetup.id)); // Convert string to number
          
        if (error) {
          console.error("Error fetching attendees:", error);
          setAttendees([]);
          return;
        }
        
        if (data && data.length > 0) {
          const mappedAttendees: Attendee[] = data.map(participant => ({
            id: participant.user_id.toString(),
            name: participant.users.username || "Anonymous",
            // Use user's custom avatar if available
            avatar: getUserAvatar(participant.user_id.toString(), participant.users.username),
            status: participant.attendance_status === 'attended' ? 'going' : 'interested'
          }));
          
          setAttendees(mappedAttendees);
        } else {
          // No mock data, just set empty array if no real attendees
          setAttendees([]);
        }
      } catch (err) {
        console.error("Error in fetchAttendees:", err);
        setAttendees([]);
      }
    };
    
    fetchAttendees();
  }, [meetup.id]);
  
  // Helper function to get user's avatar (from storage if available or generate one)
  const getUserAvatar = (userId: string, username?: string) => {
    // If the user is the current user, use their selected avatar
    if (userId === user?.uid) {
      return avatar || getAvatarForUser(userId, username);
    }
    
    // For other users, generate a consistent avatar
    return getAvatarForUser(userId, username);
  };
  
  // Check if user is in attendees list
  useEffect(() => {
    if (isJoinedLobby && user && !attendees.some(a => a.id === userId)) {
      setAttendees(prev => [
        ...prev,
        {
          id: userId || "current-user",
          name: user.email?.split('@')[0] || "Current User",
          // Use user's selected avatar if available
          avatar: avatar || getAvatarForUser(userId || "current-user", user.email?.split('@')[0]),
          status: "interested"
        }
      ]);
    }
  }, [isJoinedLobby, user, userId, attendees, avatar]);
  
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
      }

      if (dateObj && isValid(dateObj)) {
        return format(dateObj, "MMM d, yyyy h:mm a");
      }

      // If we couldn't parse it, just return the original string
      return typeof meetup.dateTime === 'string' ? meetup.dateTime : "Date unavailable";
    } catch (error) {
      console.error("Error formatting date:", error);
      return typeof meetup.dateTime === 'string' ? meetup.dateTime : "Date unavailable";
    }
  })();

  const handleJoinMeetup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to join a meetup",
          variant: "destructive"
        });
        return;
      }
      
      if (attendees.length >= meetup.lobbySize) {
        toast({
          title: "Lobby is full",
          description: `This meetup has reached its maximum capacity of ${meetup.lobbySize} attendees.`,
          variant: "destructive",
        });
        return;
      }
      
      // Get user ID if not already in store
      if (!userId) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();
          
        if (userError) {
          // Create user record if not found
          const username = user.email.split('@')[0];
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              email: user.email,
              username: username,
              join_date: new Date().toISOString(),
              profile_picture: avatar
            })
            .select('id')
            .single();
            
          if (createError) {
            console.error("Error creating user record:", createError);
            toast({
              title: "Error joining meetup",
              description: "Could not create user record in database",
              variant: "destructive"
            });
            return;
          }
          
          // Convert ID to string before passing to functions
          const newUserId = String(newUser.id);
          await joinMeetupInDb(meetup.id, newUserId);
          joinMeetupLobby(meetup.id);
        } else {
          // Update the user's avatar if they have one selected
          if (avatar) {
            await supabase
              .from('users')
              .update({ profile_picture: avatar })
              .eq('id', userData.id);
          }
          
          // Convert ID to string before passing to functions
          const userIdStr = String(userData.id);
          await joinMeetupInDb(meetup.id, userIdStr);
          joinMeetupLobby(meetup.id);
        }
      } else {
        // Update the user's avatar if they have one selected
        if (avatar) {
          await supabase
            .from('users')
            .update({ profile_picture: avatar })
            .eq('id', parseInt(userId));
        }
        
        // userId is already a string, so pass it directly
        await joinMeetupInDb(meetup.id, userId);
        joinMeetupLobby(meetup.id);
      }
      
      navigate(`/meetups/${meetup.id}`);
    } catch (error) {
      console.error("Error joining meetup:", error);
      toast({
        title: "Error joining meetup",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/meetups/${meetup.id}`);
  };
  
  // Check if the lobby is full based on actual attendees array
  const isLobbyFull = attendees.length >= meetup.lobbySize;
  
  return (
    <div className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow" onClick={handleViewDetails}>
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
          
          {/* Creator information - highlighted more prominently */}
          <div className="flex items-center mt-2 text-sm border-l-2 border-primary pl-2">
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarImage src={creatorInfo.avatar || ""} />
                <AvatarFallback>{creatorInfo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">Created by {creatorInfo.name}</span>
            </div>
          </div>
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
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <Users className="h-4 w-4 mr-1" />
                <span>{attendees.length}/{meetup.lobbySize}</span>
                
                {/* Show mini avatars for attendees */}
                {attendees.length > 0 && (
                  <div className="flex -space-x-2 ml-2">
                    {attendees.slice(0, 2).map((attendee, index) => (
                      <Avatar key={`${attendee.id}-${index}`} className="h-4 w-4 border border-background">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {attendees.length > 2 && (
                      <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-xs">
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
          variant={isJoinedLobby ? "outline" : "default"}
          disabled={isJoinedLobby || isLobbyFull || isLoading}
        >
          {isLoading ? (
            "Loading..."
          ) : isJoinedLobby ? (
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
