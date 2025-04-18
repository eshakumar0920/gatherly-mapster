
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Users, Calendar, Clock, MapPin, QrCode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { useUserStore } from "@/services/meetupService";
import { useIsMobile } from "@/hooks/use-mobile";
import QRScanner from "@/components/QRScanner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMeetupService } from "@/services/flaskService";
import { supabase } from "@/integrations/supabase/client";

// Update the local Meetup interface to include category as optional
interface Meetup {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  points: number;
  createdBy: string;
  creatorAvatar?: string;
  lobbySize: number;
  category?: string; // Added category property as optional
  attendees?: string[];
}

interface Attendee {
  id: string;
  name: string;
  avatar: string;
  status: "going" | "interested";
}

const MeetupLobby = () => {
  const { meetupId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendeeView, setAttendeeView] = useState<"all" | "going" | "interested">("all");
  const [isJoinedLobby, setIsJoinedLobby] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const { attendMeetup, joinMeetupLobby: joinLocalLobby, joinedLobbies, attendedMeetups } = useUserStore();
  const { fetchMeetupById, checkInToMeetup: checkInToMeetupApi } = useMeetupService();
  
  // Mock attendees data - this would ideally come from the API
  const mockAttendees: Attendee[] = [
    { id: "1", name: "Jane Cooper", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop", status: "going" },
    { id: "2", name: "Wade Warren", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&auto=format&fit=crop", status: "going" },
    { id: "3", name: "Esther Howard", avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&auto=format&fit=crop", status: "going" },
  ];
  
  useEffect(() => {
    const fetchMeetupData = async () => {
      setLoading(true);
      try {
        if (!meetupId) {
          toast({
            title: "Error",
            description: "Invalid meetup ID",
            variant: "destructive"
          });
          return;
        }
        
        // Try using Flask service first
        const flaskMeetup = await fetchMeetupById(meetupId);
        
        if (flaskMeetup) {
          setMeetup(flaskMeetup as unknown as Meetup);
          setIsJoinedLobby(joinedLobbies?.includes(flaskMeetup.id));
          setIsCheckedIn(attendedMeetups?.includes(flaskMeetup.id));
          setLoading(false);
          return;
        }
        
        // If Flask service fails, try fetching directly from Supabase
        try {
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', parseInt(meetupId))
            .single();
            
          if (error) {
            // If Supabase fails too, use mock data based on ID
            console.log("Using mock data for meetup since 'events' table doesn't exist in Supabase or couldn't fetch the data");
            
            // Create a mock meetup based on ID
            const mockMeetup: Meetup = {
              id: meetupId,
              title: `Meetup ${meetupId}`,
              description: "This is a mock meetup since the events table doesn't exist in Supabase yet",
              dateTime: format(new Date(), "MM/dd/yyyy h:mm a"),
              location: "UTD Campus",
              points: 3,
              createdBy: "Student",
              creatorAvatar: "",
              lobbySize: 5,
              attendees: []
            };

            setMeetup(mockMeetup);
            setIsJoinedLobby(joinedLobbies?.includes(mockMeetup.id));
            setIsCheckedIn(attendedMeetups?.includes(mockMeetup.id));
          } else if (data) {
            // Transform Supabase data to Meetup format
            const meetupData: Meetup = {
              id: data.id.toString(),
              title: data.title,
              description: data.description || "No description available",
              dateTime: new Date(data.event_date).toLocaleString(),
              location: data.location,
              points: data.xp_reward || 3,
              createdBy: "Student",
              creatorAvatar: "",
              lobbySize: 5,
              category: data.category || "Other",
              attendees: []
            };
            
            setMeetup(meetupData);
            setIsJoinedLobby(joinedLobbies?.includes(meetupData.id));
            setIsCheckedIn(attendedMeetups?.includes(meetupData.id));
          }
        } catch (supabaseError) {
          console.error("Supabase error:", supabaseError);
          // Use mock data as a last resort
          const mockMeetup: Meetup = {
            id: meetupId,
            title: `Meetup ${meetupId}`,
            description: "This is a mock meetup since fetching data failed",
            dateTime: format(new Date(), "MM/dd/yyyy h:mm a"),
            location: "UTD Campus",
            points: 3,
            createdBy: "Student",
            creatorAvatar: "",
            lobbySize: 5,
            attendees: []
          };
          
          setMeetup(mockMeetup);
          setIsJoinedLobby(joinedLobbies?.includes(mockMeetup.id));
          setIsCheckedIn(attendedMeetups?.includes(mockMeetup.id));
        }
      } catch (error) {
        console.error("Error in fetching meetup:", error);
        toast({
          title: "Error",
          description: "Failed to load meetup details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMeetupData();
  }, [meetupId, joinedLobbies, attendedMeetups, toast, fetchMeetupById]);

  const filteredAttendees = mockAttendees.filter(attendee => {
    if (attendeeView === "all") return true;
    return attendee.status === attendeeView;
  });

  const handleJoinLobby = async () => {
    if (meetup) {
      // Use local state management regardless of API success
      joinLocalLobby(meetup.id);
      setIsJoinedLobby(true);
      toast({
        title: "Joined lobby",
        description: "You've joined the meetup lobby. Don't forget to scan the QR code at the meetup to check in and earn points!",
      });
    }
  };
  
  const handleCheckIn = () => {
    setIsQrScannerOpen(true);
  };
  
  const handleQrScanSuccess = async (data: string) => {
    if (meetup) {
      if (data.includes(meetupId as string)) {
        try {
          // Try the API first, but fall back to local state
          const success = await checkInToMeetupApi(meetup.id);
          
          if (!success) {
            // If API fails, use local state
            attendMeetup(meetup.id, meetup.points);
          }
          
          setIsCheckedIn(true);
          toast({
            title: "Meetup attendance confirmed!",
            description: `You've successfully checked in and earned ${meetup.points} points!`,
            variant: "default",
          });
        } catch (error) {
          console.error("Check-in error:", error);
          // Use local state as fallback
          attendMeetup(meetup.id, meetup.points);
          setIsCheckedIn(true);
          toast({
            title: "Meetup attendance confirmed!",
            description: `You've successfully checked in and earned ${meetup.points} points!`,
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Invalid QR Code",
          description: "This QR code doesn't match the current meetup.",
          variant: "destructive",
        });
      }
    }
    setIsQrScannerOpen(false);
  };
  
  const handleQrScanCancel = () => {
    setIsQrScannerOpen(false);
  };

  const AttendeesList = () => (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button 
          variant={attendeeView === "all" ? "yellow" : "outline"} 
          size="sm" 
          onClick={() => setAttendeeView("all")}
        >
          All ({mockAttendees.length})
        </Button>
        <Button 
          variant={attendeeView === "going" ? "yellow" : "outline"} 
          size="sm" 
          onClick={() => setAttendeeView("going")}
        >
          Going ({mockAttendees.filter(a => a.status === "going").length})
        </Button>
        <Button 
          variant={attendeeView === "interested" ? "yellow" : "outline"} 
          size="sm" 
          onClick={() => setAttendeeView("interested")}
        >
          Interested ({mockAttendees.filter(a => a.status === "interested").length})
        </Button>
      </div>

      <div className="space-y-3">
        {filteredAttendees.map(attendee => (
          <div key={attendee.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={attendee.avatar} />
                <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{attendee.name}</p>
                <Badge variant={attendee.status === "going" ? "default" : "outline"} className="text-xs">
                  {attendee.status === "going" ? "Going" : "Interested"}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="p-4 pt-6 w-full text-center">
          <h1 className="text-2xl font-medium">
            <span className="font-bold">i</span>mpulse
          </h1>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <p className="mt-4">Loading meetup details...</p>
        </div>
        
        <Navigation />
      </div>
    );
  }

  if (!meetup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="p-4 pt-6 w-full text-center">
          <h1 className="text-2xl font-medium">
            <span className="font-bold">i</span>mpulse
          </h1>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-xl mb-4">Meetup not found</h2>
          <Button onClick={() => navigate("/meetups")} className="bg-yellow-500 text-white">
            Back to Meetups
          </Button>
        </div>
        
        <Navigation />
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-background">
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      <header className="p-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Meetup Details</h1>
      </header>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold">{meetup?.title}</h2>
          <Badge className="bg-yellow-500 text-black">+{meetup?.points} pts</Badge>
        </div>
        <p className="text-muted-foreground mt-1">{meetup?.description}</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{meetup?.dateTime}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{meetup?.location}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Hosted by {meetup?.createdBy}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Attendees</h3>
          </div>
          
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </DrawerTrigger>
              <DrawerContent className="p-4 pt-6">
                <h3 className="text-lg font-semibold mb-4">Attendees</h3>
                <AttendeesList />
              </DrawerContent>
            </Drawer>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Attendees</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <AttendeesList />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <div className="flex -space-x-2 overflow-hidden">
          {mockAttendees.slice(0, 5).map((attendee) => (
            <Avatar key={attendee.id} className="border-2 border-background">
              <AvatarImage src={attendee.avatar} />
              <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {mockAttendees.length > 5 && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border-2 border-background text-xs font-medium">
              +{mockAttendees.length - 5}
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div className="p-4 space-y-4">
        {!isJoinedLobby ? (
          <Button className="w-full" onClick={handleJoinLobby}>
            Join Meetup Lobby
          </Button>
        ) : !isCheckedIn ? (
          <Button className="w-full" onClick={handleCheckIn}>
            <QrCode className="mr-2 h-4 w-4" />
            Scan QR Code to Check In
          </Button>
        ) : (
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white" disabled>
            <Check className="mr-2 h-4 w-4" />
            Checked In
          </Button>
        )}
      </div>

      <Dialog open={isQrScannerOpen} onOpenChange={setIsQrScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Scan QR Code to Check In</DialogTitle>
          <DialogDescription>
            At the actual meetup location, the organizer will display a unique QR code 
            for this event. Scan it with your camera to check in and earn {meetup?.points} points.
            This confirms your attendance and prevents earning points without being physically present.
          </DialogDescription>
          <QRScanner 
            onSuccess={handleQrScanSuccess} 
            onCancel={handleQrScanCancel}
            meetupId={meetupId}
          />
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
};

export default MeetupLobby;
