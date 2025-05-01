
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Users, Clock, MapPin, Trophy, QrCode, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserStore } from "@/services/meetupService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MapView from "@/components/MapView";
import QRScanner from "@/components/QRScanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useMeetups } from "@/hooks/useMeetups";
import ContentLoader from "@/components/home/ContentLoader";
import { Meetup } from "@/types/meetup";
import EditMeetupForm from "@/components/meetups/EditMeetupForm";

interface Attendee {
  id: string;
  name: string;
  status: "attending" | "registered";
}

// Define a MapLocation type that matches what MapView expects
interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const MeetupLobby = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { allMeetups, joinMeetupLobby: joinMeetupInDb, checkInToMeetup: checkInAtDb } = useMeetups();
  const { joinMeetupLobby, attendMeetup, joinedLobbies, attendedMeetups, userId, points } = useUserStore();
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isAttendanceQrOpen, setIsAttendanceQrOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isAttended, setIsAttended] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch meetup details
  useEffect(() => {
    const fetchMeetupDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      // Try to find the meetup in our local state first
      const cachedMeetup = allMeetups.find(m => m.id === id);
      if (cachedMeetup) {
        setMeetup(cachedMeetup);
        
        // Check if user has already joined or attended
        setIsJoined(joinedLobbies?.includes(id) || false);
        setIsAttended(attendedMeetups?.includes(id) || false);
        
        // Check if user is the creator
        if (userId) {
          try {
            const { data, error } = await supabase
              .from('events')
              .select('creator_id')
              .eq('id', parseInt(id))
              .single();
              
            if (!error && data) {
              setIsCreator(data.creator_id === parseInt(userId));
            }
          } catch (err) {
            console.error("Error checking meetup creator:", err);
          }
        }
        
        setIsLoading(false);
      } else {
        // If not in local state, fetch from the database
        try {
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', parseInt(id))
            .single();
            
          if (error) {
            console.error("Error fetching meetup:", error);
            toast({
              title: "Error",
              description: "Could not load meetup details",
              variant: "destructive"
            });
            navigate("/meetups");
            return;
          }
          
          if (data) {
            const event = data as any;
            const meetupData: Meetup = {
              id: event.id.toString(),
              title: event.title,
              description: event.description || "No description available",
              dateTime: event.event_date,
              location: event.location,
              points: event.xp_reward || 3,
              createdBy: event.creator_name || "Student",
              creatorAvatar: undefined,
              lobbySize: event.lobby_size || 5,
              category: event.category || "Other",
              attendees: [],
              latitude: event.latitude,
              longitude: event.longitude
            };
            
            setMeetup(meetupData);
            
            // Check if user has already joined or attended
            setIsJoined(joinedLobbies?.includes(id) || false);
            setIsAttended(attendedMeetups?.includes(id) || false);
            
            // Check if user is the creator
            if (userId) {
              try {
                const { data, error } = await supabase
                  .from('events')
                  .select('creator_id')
                  .eq('id', parseInt(id))
                  .single();
                  
                if (!error && data) {
                  setIsCreator(data.creator_id === parseInt(userId));
                }
              } catch (err) {
                console.error("Error checking meetup creator:", err);
              }
            }
          } else {
            toast({
              title: "Error",
              description: "Meetup not found",
              variant: "destructive"
            });
            navigate("/meetups");
          }
        } catch (error) {
          console.error("Error fetching meetup:", error);
          toast({
            title: "Error",
            description: "Could not load meetup details",
            variant: "destructive"
          });
          navigate("/meetups");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchMeetupDetails();
  }, [id, allMeetups, joinedLobbies, attendedMeetups, navigate, toast, userId]);
  
  // Fetch attendees
  useEffect(() => {
    const fetchAttendees = async () => {
      if (!meetup) return;
      
      try {
        const { data, error } = await supabase
          .from('participants')
          .select(`
            user_id,
            attendance_status,
            users!inner(
              username
            )
          `)
          .eq('event_id', parseInt(meetup.id));
          
        if (error) {
          console.error("Error fetching attendees:", error);
          setAttendees([]);
          return;
        }
        
        if (data && data.length > 0) {
          const mappedAttendees: Attendee[] = data.map(participant => ({
            id: participant.user_id.toString(),
            name: participant.users.username || "Anonymous",
            status: participant.attendance_status === 'attended' ? 'attending' : 'registered'
          }));
          
          setAttendees(mappedAttendees);
        } else {
          setAttendees([]);
        }
      } catch (err) {
        console.error("Error in fetchAttendees:", err);
        setAttendees([]);
      }
    };
    
    fetchAttendees();
  }, [meetup]);
  
  const handleBackClick = () => {
    navigate(-1);
  };
  
  const handleJoinLobby = async () => {
    if (!id || !user) return;
    
    try {
      // Get user ID if not already in store
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to join a meetup",
          variant: "destructive"
        });
        return;
      }
      
      await joinMeetupInDb(id, userId);
      joinMeetupLobby(id);
      setIsJoined(true);
      
      toast({
        title: "Joined lobby",
        description: "You've joined the meetup lobby. Don't forget to scan the QR code at the meetup to check in and earn points!",
      });
    } catch (error) {
      console.error("Error joining meetup lobby:", error);
      toast({
        title: "Error joining lobby",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleCheckIn = async () => {
    if (!id || !user) return;
    
    try {
      // Get user ID if not already in store
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to check in to a meetup",
          variant: "destructive"
        });
        return;
      }
      
      const success = await checkInAtDb(id, userId);
      
      if (success) {
        // Use attendMeetup instead of checkInToMeetup
        attendMeetup(id, meetup?.points || 3);
        setIsAttended(true);
        
        toast({
          title: "Check-in successful!",
          description: `You've checked in to this meetup and earned ${meetup?.points || 3} points!`,
        });
      }
    } catch (error) {
      console.error("Error checking in to meetup:", error);
      toast({
        title: "Error checking in",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleQrCodeClick = () => {
    setIsAttendanceQrOpen(true);
  };

  const handleScanResult = (result: string) => {
    setIsCameraOpen(false);
    setIsAttendanceQrOpen(false);
    
    if (result === `checkin:${id}`) {
      handleCheckIn();
    } else {
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not valid for this meetup.",
        variant: "destructive"
      });
    }
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = (updatedMeetup: Partial<Meetup>) => {
    if (meetup) {
      // Update the meetup with the new details
      setMeetup({...meetup, ...updatedMeetup});
    }
    setIsEditDialogOpen(false);
  };
  
  if (isLoading) {
    return <ContentLoader message="Loading meetup details..." />;
  }
  
  if (!meetup) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={handleBackClick} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-center">Meetup not found.</p>
      </div>
    );
  }

  // Convert the map data to the format expected by MapView
  const mapLocations: MapLocation[] = [];
  if (meetup.latitude && meetup.longitude) {
    mapLocations.push({
      id: meetup.id,
      name: meetup.title,
      lat: meetup.latitude,
      lng: meetup.longitude
    });
  }

  return (
    <div className="pb-20">
      <div className="p-4 flex items-center">
        <Button variant="ghost" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {isCreator && (
          <Button variant="ghost" className="ml-auto" onClick={handleEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{meetup.title}</h1>
            {meetup.category && (
              <Badge className="mt-1">{meetup.category}</Badge>
            )}
          </div>
          <div className="flex items-center bg-yellow-500/10 px-3 py-1.5 rounded-full">
            <Trophy className="h-4 w-4 text-yellow-600 mr-1" />
            <span className="font-medium text-yellow-600">+{meetup.points} pts</span>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-6">{meetup.description}</p>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-muted-foreground mr-3" />
            <span>{meetup.dateTime}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-muted-foreground mr-3" />
            <span>{meetup.location}</span>
          </div>
          
          <div className="flex items-center">
            <User className="h-5 w-5 text-muted-foreground mr-3" />
            <div className="flex items-center">
              <span>Created by </span>
              <div className="flex items-center ml-1">
                {meetup.creatorAvatar && (
                  <Avatar className="h-6 w-6 mr-1">
                    <AvatarImage src={meetup.creatorAvatar} alt={meetup.createdBy} />
                    <AvatarFallback>{meetup.createdBy?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <span className="font-medium">{meetup.createdBy}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Users className="h-5 w-5 text-muted-foreground mr-3" />
            <span>{attendees.length} of {meetup.lobbySize} participants</span>
          </div>
        </div>
        
        {/* Map View - updated to use locations prop instead of center/markers */}
        <div className="mb-6 h-[200px] rounded-lg overflow-hidden border">
          {meetup.latitude && meetup.longitude ? (
            <MapView locations={mapLocations} />
          ) : (
            <div className="h-full flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">No location data available</p>
            </div>
          )}
        </div>
        
        {/* Participants */}
        <div className="mb-6">
          <h2 className="font-semibold mb-3">Participants</h2>
          {attendees.length > 0 ? (
            <div className="space-y-2">
              {attendees.map((attendee, idx) => (
                <div key={`${attendee.id}-${idx}`} className="flex items-center justify-between p-2 rounded-md border">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{attendee.name}</span>
                  </div>
                  <Badge variant={attendee.status === "attending" ? "default" : "outline"}>
                    {attendee.status === "attending" ? "Checked In" : "Registered"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground p-4 border rounded-md">
              No participants yet. Be the first to join!
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {!isJoined && (
            <Button 
              className="w-full" 
              onClick={handleJoinLobby}
              disabled={attendees.length >= meetup.lobbySize}
            >
              {attendees.length >= meetup.lobbySize ? "Lobby Full" : "Join Lobby"}
            </Button>
          )}
          
          {isJoined && !isAttended && (
            <Button className="w-full" variant="default" onClick={handleCheckIn}>
              Check In
            </Button>
          )}
          
          {isJoined && !isAttended && (
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={handleQrCodeClick}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Scan QR Code to Check In
            </Button>
          )}
          
          {isAttended && (
            <Button className="w-full" variant="outline" disabled>
              Already Checked In (+{meetup.points} pts)
            </Button>
          )}
        </div>
      </div>
      
      {/* QR Code Dialog */}
      <Dialog open={isAttendanceQrOpen} onOpenChange={setIsAttendanceQrOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan QR Code to Check In</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Button onClick={() => { setIsAttendanceQrOpen(false); setIsCameraOpen(true); }}>
              Open Camera
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* QR Scanner Dialog - updated to use onSuccess and onCancel props */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <QRScanner onSuccess={handleScanResult} onCancel={handleCloseCamera} />
        </DialogContent>
      </Dialog>

      {/* Edit Meetup Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meetup</DialogTitle>
          </DialogHeader>
          {meetup && (
            <EditMeetupForm
              meetup={meetup}
              userId={userId || ""}
              onSuccess={handleEditSuccess}
              onClose={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetupLobby;
