import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Calendar, MapPin, QrCode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import QRScanner from "@/components/QRScanner";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/services/meetupService";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import type { Meetup, Participant } from "@/types/meetup";

const MeetupLobby = () => {
  const { meetupId } = useParams<{ meetupId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { attendMeetup, joinMeetupLobby: joinLocal, joinedLobbies, attendedMeetups } = useUserStore();

  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [attendees, setAttendees] = useState<Participant[]>([]);
  const [view, setView] = useState<"all" | "going" | "interested">("all");

  useEffect(() => {
    const fetchMeetupData = async () => {
      setLoading(true);
      if (!meetupId) return;

      try {
        const numericId = parseInt(meetupId);
        if (isNaN(numericId)) {
          throw new Error("Invalid meetup ID");
        }

        const { data: meetupData, error: meetupError } = await supabase
          .from('events')
          .select('*, participants(*)')
          .eq('id', numericId)
          .single();

        if (meetupError) {
          console.error("Error fetching meetup from Supabase:", meetupError);
          throw meetupError;
        }

        if (!meetupData) {
          console.error("No meetup found with ID:", meetupId);
          throw new Error("Meetup not found");
        }

        console.log("Fetched meetup data:", meetupData);
        
        // Transform the data to match our Meetup type
        const transformedMeetup: Meetup = {
          id: meetupData.id.toString(),
          title: meetupData.title,
          description: meetupData.description || "No description available",
          dateTime: new Date(meetupData.event_date).toISOString(),
          location: meetupData.location,
          points: meetupData.xp_reward || 3,
          createdBy: "UTD Student", // Default creator name
          creatorAvatar: undefined,
          lobbySize: 5, // Default lobby size
          category: meetupData.category || "Other",
          attendees: meetupData.participants || []
        };

        setMeetup(transformedMeetup);
        setAttendees(meetupData.participants || []);
        
      } catch (error) {
        console.error("Error in fetching meetup details:", error);
        toast({
          title: "Error loading meetup",
          description: "Failed to load meetup details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMeetupData();
  }, [meetupId, toast]);

  useEffect(() => {
    if (meetup) {
      setIsJoined(joinedLobbies.includes(meetup.id));
      setIsCheckedIn(attendedMeetups.includes(meetup.id));
    }
  }, [meetup, joinedLobbies, attendedMeetups]);

  const handleJoin = async () => {
    if (!meetup) return;
    
    try {
      const numericId = parseInt(meetup.id);
      if (isNaN(numericId)) {
        throw new Error("Invalid meetup ID");
      }

      const { error } = await supabase
        .from('participants')
        .insert({
          event_id: numericId,
          user_id: 1, // Default user ID
          joined_at: new Date().toISOString(),
          attendance_status: 'going'
        });
        
      if (error) {
        console.error("Error joining meetup:", error);
        toast({ 
          title: "Could not join", 
          description: "Failed to join the meetup. Please try again.",
          variant: "destructive" 
        });
        return;
      }
      
      joinLocal(meetup.id);
      setIsJoined(true);
      
      // Refresh attendees list
      const { data: updatedParticipants } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', numericId);
        
      if (updatedParticipants) {
        setAttendees(updatedParticipants);
      }
      
      toast({ title: "Joined Meetup Lobby" });
    } catch (error) {
      toast({ title: "Could not join", variant: "destructive" });
    }
  };

  const handleCheckIn = () => setQrOpen(true);

  const onScan = async (data: string) => {
    if (meetup && data.includes(meetupId)) {
      try {
        const { error } = await supabase
          .from('participants')
          .update({ 
            attendance_status: 'attended',
            xp_earned: meetup.xp_reward 
          })
          .eq('event_id', meetup.id)
          .eq('user_id', 1); // Default user ID
          
        if (error) {
          console.error("Error checking in:", error);
          toast({
            title: "Check-in failed",
            description: "Could not update attendance status",
            variant: "destructive"
          });
          return;
        }
        
        attendMeetup(meetup.id, meetup.xp_reward);
        setIsCheckedIn(true);
        toast({ title: "Checked In!", description: `+${meetup.xp_reward} XP` });
      } catch (error) {
        attendMeetup(meetup.id, meetup.xp_reward);
        setIsCheckedIn(true);
      }
    } else {
      toast({ title: "Invalid QR", variant: "destructive" });
    }
    setQrOpen(false);
  };

  const filteredAttendees = attendees.filter(a => 
    view === "all" || a.attendance_status === view
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="mt-4">Loading meetup details...</p>
      </div>
    );
  }

  if (!meetup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl mb-4">Meetup not found</h2>
        <Button onClick={() => navigate("/meetups")}>Back to Meetups</Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="ml-2 text-2xl font-bold">Meetup Details</h1>
      </div>

      <div className="p-4 space-y-2">
        <h2 className="text-2xl font-bold">{meetup?.title}</h2>
        <p className="text-muted-foreground">{meetup?.description}</p>
        <div className="flex items-center gap-4 text-sm">
          <Calendar size={16} />
          <span>{meetup?.dateTime ? format(new Date(meetup.dateTime), "PPpp") : "Date not available"}</span>
          <MapPin size={16} />
          <span>{meetup?.location}</span>
        </div>
      </div>

      <Separator />

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Users size={18} className="mr-2" /> 
            Attendees ({attendees.length})
          </h3>

          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button size="sm">View All</Button>
              </DrawerTrigger>
              <DrawerContent className="p-4">
                <h4 className="text-lg mb-4">Attendees</h4>
                {filteredAttendees.map(a => (
                  <div key={a.id} className="flex items-center gap-3 mb-2">
                    <Avatar>
                      <AvatarFallback>U{a.id}</AvatarFallback>
                    </Avatar>
                    <span>{a.name}</span>
                    <Badge>{a.attendance_status || "going"}</Badge>
                  </div>
                ))}
              </DrawerContent>
            </Drawer>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm">View All</Button>
              </SheetTrigger>
              <SheetContent className="w-80 p-4">
                <SheetHeader>
                  <SheetTitle>Attendees</SheetTitle>
                </SheetHeader>
                {filteredAttendees.map(a => (
                  <div key={a.id} className="flex items-center gap-3 mb-2">
                    <Avatar>
                      <AvatarFallback>U{a.id}</AvatarFallback>
                    </Avatar>
                    <span>{a.name}</span>
                    <Badge>{a.attendance_status || "going"}</Badge>
                  </div>
                ))}
              </SheetContent>
            </Sheet>
          )}
        </div>

        <div className="flex -space-x-2 overflow-hidden">
          {attendees.slice(0, 5).map((a, index) => (
            <Avatar key={a.id} className="border-2 border-white">
              <AvatarFallback>U{index + 1}</AvatarFallback>
            </Avatar>
          ))}
          {attendees.length > 5 && (
            <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-xs">
              +{attendees.length - 5}
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div className="p-4 space-y-3">
        {!isJoined ? (
          <Button className="w-full" onClick={handleJoin}>
            Join Meetup Lobby
          </Button>
        ) : !isCheckedIn ? (
          <Button className="w-full" onClick={handleCheckIn}>
            <QrCode size={16} className="mr-2" /> Scan QR to Check In
          </Button>
        ) : (
          <Button className="w-full bg-green-500 text-white" disabled>
            <Check size={16} className="mr-2" /> Checked In
          </Button>
        )}
      </div>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Scan the meetup's QR code to confirm your attendance.
          </DialogDescription>
          <QRScanner onSuccess={onScan} onCancel={() => setQrOpen(false)} meetupId={meetupId!} />
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
};

export default MeetupLobby;
