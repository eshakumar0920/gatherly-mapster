import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, MapPin, Clock, User, ScanQRCode, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUserStore } from "@/services/meetupService";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isValid } from "date-fns";
import { Meetup } from "@/types/meetup";
import QRScanner from "@/components/QRScanner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Sample attendees data
const sampleAttendees = [
  {
    id: "1",
    name: "Alex Johnson",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&h=200&q=80",
    status: "going" as const
  },
  {
    id: "2",
    name: "Maria Garcia",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
    status: "going" as const
  }
];

const MeetupLobby = () => {
  const { meetupId } = useParams<{ meetupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    name: userName, 
    avatar: userAvatar, 
    attendMeetup, 
    joinMeetupLobby, 
    attendedMeetups,
    joinedLobbies, 
    userId
  } = useUserStore();
  
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAttending, setIsAttending] = useState<boolean>(false);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [checkingIn, setCheckingIn] = useState<boolean>(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if the meetup is in attended meetups
    const hasAttended = attendedMeetups.some(m => m.id === meetupId);
    setIsAttending(hasAttended);
    
    // Check if joined the lobby
    const hasJoined = joinedLobbies?.includes(meetupId || "");
    setIsJoined(hasJoined);
    
    // Fetch meetup details from database or use mock data
    const fetchMeetupDetails = async () => {
      setIsLoading(true);
      try {
        if (meetupId) {
          const { data, error } = await supabase
            .from('events')
            .select('*, users(username, profile_picture)')
            .eq('id', parseInt(meetupId))
            .single();
            
          if (error) {
            console.error("Error fetching meetup:", error);
            toast({
              title: "Error loading meetup",
              description: "Could not load meetup details",
              variant: "destructive"
            });
            navigate('/meetups');
            return;
          }
          
          if (data) {
            const meetupData: Meetup = {
              id: data.id.toString(),
              title: data.title,
              description: data.description || "No description available",
              dateTime: data.event_date,
              location: data.location,
              points: data.xp_reward || 3,
              createdBy: data.creator_name || "Anonymous",
              creatorAvatar: data.users?.profile_picture || null,
              lobbySize: data.lobby_size || 5,
              category: data.category || "Other",
              attendees: []
            };
            
            setMeetup(meetupData);
            
            // Now fetch attendees
            fetchAttendees(meetupId);
          }
        }
      } catch (error) {
        console.error("Error in fetching meetup:", error);
        toast({
          title: "Error loading meetup",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeetupDetails();
  }, [meetupId, attendedMeetups, joinedLobbies, navigate, toast]);
  
  const fetchAttendees = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          user_id,
          attendance_status,
          users!inner(
            id,
            username,
            profile_picture
          )
        `)
        .eq('event_id', parseInt(id));
        
      if (error) {
        console.error("Error fetching attendees:", error);
        setAttendees([]);
        return;
      }
      
      if (data && data.length > 0) {
        const mappedAttendees = data.map(participant => ({
          id: participant.user_id.toString(),
          name: participant.users.username || "Anonymous",
          avatar: participant.users.profile_picture,
          status: participant.attendance_status === 'attended' ? 'going' : 'interested'
        }));
        
        setAttendees(mappedAttendees);
      } else {
        // No mock data fallback, just use empty array
        setAttendees([]);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
      setAttendees([]);
    }
  };
  
  const handleJoinLobby = async () => {
    if (!meetupId) return;
    
    try {
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to join this meetup",
          variant: "destructive"
        });
        return;
      }
      
      // First check if the lobby is full
      if (attendees.length >= (meetup?.lobbySize || 5)) {
        toast({
          title: "Lobby is full",
          description: "This meetup has reached its maximum capacity",
          variant: "destructive"
        });
        return;
      }
      
      // Add to database
      const { error } = await supabase.from('participants').insert({
        event_id: parseInt(meetupId),
        user_id: parseInt(userId),
        joined_at: new Date().toISOString(),
        attendance_status: 'registered'
      });
      
      if (error) {
        console.error("Error joining meetup:", error);
        toast({
          title: "Error joining meetup",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      // Update local store
      joinMeetupLobby(meetupId);
      
      // Add current user to attendees
      setAttendees(prev => [
        ...prev,
        {
          id: userId || "current-user",
          name: userName || "You",
          avatar: userAvatar,
          status: "interested"
        }
      ]);
      
      setIsJoined(true);
      
      toast({
        title: "Joined meetup lobby",
        description: "You have successfully joined the meetup lobby"
      });
      
    } catch (error) {
      console.error("Error joining meetup:", error);
      toast({
        title: "Error joining meetup",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleCheckIn = async () => {
    if (!meetupId || !meetup) return;
    
    setCheckingIn(true);
    try {
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to check in",
          variant: "destructive"
        });
        setCheckingIn(false);
        return;
      }
      
      // Update in database (if needed)
      supabase
        .from('participants')
        .update({ 
          attendance_status: 'attended',
          xp_earned: meetup.points || 3
        })
        .eq('event_id', parseInt(meetupId))
        .eq('user_id', parseInt(userId))
        .then(({ error }) => {
          if (error) {
            console.error("Error checking in:", error);
            toast({
              title: "Error checking in",
              description: error.message,
              variant: "destructive"
            });
            setCheckingIn(false);
            return;
          }
          
          // Dispatch action to add to attendedMeetups
          attendMeetup(meetupId, meetup.points || 3);
          
          // Update UI
          setIsAttending(true);
          
          // Update attendee status
          setAttendees(prev => 
            prev.map(a => 
              a.id === userId ? { ...a, status: "going" } : a
            )
          );
          
          toast({
            title: "Check-in successful!",
            description: `You earned ${meetup.points || 3} points!`
          });
          
          setCheckingIn(false);
        });
    } catch (error) {
      console.error("Error checking in:", error);
      toast({
        title: "Error checking in",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setCheckingIn(false);
    }
  };
  
  // Format date properly
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Date unavailable";
    
    // For already formatted strings like "Today @3pm", just return as is
    if (dateStr.includes('@') || 
        dateStr.toLowerCase().includes('today') || 
        dateStr.toLowerCase().includes('tomorrow')) {
      return dateStr;
    }
    
    try {
      const parsedDate = parseISO(dateStr);
      if (isValid(parsedDate)) {
        return format(parsedDate, "EEEE, MMM d, yyyy 'at' h:mm a");
      }
      return dateStr;
    } catch (error) {
      return dateStr;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading meetup details...</p>
      </div>
    );
  }
  
  if (!meetup) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Meetup not found</p>
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <div className="fixed top-0 left-0 right-0 bg-background z-10 border-b">
        <div className="p-4 flex items-center">
          <button 
            onClick={() => navigate('/meetups')} 
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Meetup Details</h1>
        </div>
      </div>
      
      <div className="pt-16 p-4">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold">{meetup.title}</h1>
              <div className="bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-sm font-medium">
                +{meetup.points} pts
              </div>
            </div>
            
            {meetup.category && (
              <Badge variant="outline" className="mt-2">
                {meetup.category}
              </Badge>
            )}
            
            <p className="text-muted-foreground mt-2">
              {meetup.description}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatDate(meetup.dateTime)}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{meetup.location}</span>
            </div>
            
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <div className="flex items-center">
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage src={meetup.creatorAvatar || ""} />
                  <AvatarFallback>{meetup.createdBy?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span>Organized by {meetup.createdBy}</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Attendees</h2>
              <div className="text-sm text-muted-foreground">
                {attendees.length}/{meetup.lobbySize}
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-md">
              <Progress 
                value={(attendees.length / meetup.lobbySize) * 100} 
                className="h-1 rounded-t-md"
              />
              <div className="p-4">
                {attendees.length === 0 ? (
                  <p className="text-center text-muted-foreground py-3">
                    No one has joined this meetup yet. Be the first!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {attendees.map(attendee => (
                      <div key={attendee.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={attendee.avatar || ""} />
                            <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{attendee.name}</span>
                        </div>
                        <Badge variant={attendee.status === "going" ? "default" : "outline"}>
                          {attendee.status === "going" ? (
                            <div className="flex items-center">
                              <Check className="h-3 w-3 mr-1" />
                              <span>Attending</span>
                            </div>
                          ) : "Interested"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
            <div className="max-w-lg mx-auto flex gap-2">
              {isAttending ? (
                <Button className="w-full" variant="default" disabled>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Checked In
                </Button>
              ) : isJoined ? (
                <Button 
                  className="w-full" 
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                >
                  <ScanQRCode className="mr-2 h-4 w-4" />
                  {checkingIn ? "Processing..." : "Scan QR Code to Check In"}
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleJoinLobby}
                  disabled={attendees.length >= meetup.lobbySize}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {attendees.length >= meetup.lobbySize ? "Lobby Full" : "Join Lobby"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Dialog */}
      <Dialog open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
        <DialogContent className="p-0 sm:max-w-md">
          <QRScanner 
            onSuccess={handleQRScanSuccess} 
            onCancel={() => setIsQRScannerOpen(false)}
            meetupId={meetupId}
            mode="scan"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetupLobby;
