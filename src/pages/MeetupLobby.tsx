
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Users,
  Calendar,
  MapPin,
  QrCode,
  Check
} from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { meetupsApi } from "@/services/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Meetup {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  points: number;
  createdBy: string;
  category?: string;
  attendees?: string[];
  event_date?: string;
}

interface Attendee {
  id: string;
  name: string;
  avatar: string;
  status: "going" | "interested";
}

const MeetupLobby = () => {
  const { meetupId } = useParams<{ meetupId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { attendMeetup, joinMeetupLobby: joinLocalLobby, joinedLobbies, attendedMeetups } = useUserStore();
  const { user } = useAuth();

  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendeeView, setAttendeeView] = useState<"all" | "going" | "interested">("all");
  const [isJoinedLobby, setIsJoinedLobby] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  const mockAttendees: Attendee[] = [
    { id: "1", name: "Jane Cooper", avatar: "https://randomuser.me/api/portraits/women/1.jpg", status: "going" },
    { id: "2", name: "Wade Warren", avatar: "https://randomuser.me/api/portraits/men/2.jpg", status: "going" },
    { id: "3", name: "Esther Howard", avatar: "https://randomuser.me/api/portraits/women/3.jpg", status: "going" },
  ];

  // 1. Fetch meetup details from /api/events/:id
  useEffect(() => {
    const fetchMeetupData = async () => {
      setLoading(true);
      try {
        const response = await meetupsApi.getMeetupById(meetupId!);
        const m = response.data;
        if (m) {
          setMeetup({
            ...m,
            dateTime: format(new Date(m.event_date || m.dateTime), "MM/dd/yyyy h:mm a"),
          });
          setIsJoinedLobby(joinedLobbies?.includes(m.id));
          setIsCheckedIn(attendedMeetups?.includes(m.id));
        }
      } catch {
        // fallback mock
        const mockM: Meetup = {
          id: meetupId!,
          title: `Meetup ${meetupId}`,
          description: "Could not load details",
          dateTime: format(new Date(), "MM/dd/yyyy h:mm a"),
          location: "UTD Campus",
          points: 3,
          createdBy: "N/A",
        };
        setMeetup(mockM);
        setIsJoinedLobby(joinedLobbies?.includes(mockM.id));
        setIsCheckedIn(attendedMeetups?.includes(mockM.id));
      } finally {
        setLoading(false);
      }
    };
    fetchMeetupData();
  }, [meetupId, joinedLobbies, attendedMeetups]);

  const filteredAttendees = mockAttendees.filter((a) =>
    attendeeView === "all" ? true : a.status === attendeeView
  );

  // 2. Join lobby → POST /api/events/:id/join
  const handleJoinLobby = async () => {
    if (!meetup || !user) return;
    try {
      await meetupsApi.joinMeetupLobby(meetup.id, { user_id: parseInt(user.id) });
    } catch {
      /* ignore */
    }
    joinLocalLobby(meetup.id);
    setIsJoinedLobby(true);
    toast({
      title: "Joined lobby",
      description: "You've joined the meetup lobby!",
    });
  };

  // 3. Check-in → same POST /join endpoint
  const handleQrScanSuccess = async (data: string) => {
    if (!meetup || !user) return;
    if (data.includes(meetupId!)) {
      try {
        await meetupsApi.checkInToMeetup(meetup.id, { user_id: parseInt(user.id) });
      } catch {
        attendMeetup(meetup.id, meetup.points);
      }
      setIsCheckedIn(true);
      toast({
        title: "Checked In",
        description: `You earned ${meetup.points} pts!`,
      });
    } else {
      toast({
        title: "Invalid QR Code",
        description: "This QR doesn't match the meetup.",
        variant: "destructive",
      });
    }
    setIsQrScannerOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="p-4 pt-6 w-full text-center">
          <h1 className="text-2xl font-medium"><span className="font-bold">i</span>mpulse</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
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
        <h2 className="text-xl mb-4">Meetup not found</h2>
        <Button onClick={() => navigate("/meetups")}>Back to Meetups</Button>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-background">
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium"><span className="font-bold">i</span>mpulse</h1>
      </div>

      <header className="p-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Meetup Details</h1>
      </header>

      <div className="p-4">
        <h2 className="text-2xl font-bold">{meetup.title}</h2>
        <Badge className="bg-yellow-500 text-black">+{meetup.points} pts</Badge>
        <p className="text-muted-foreground mt-1">{meetup.description}</p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{meetup.dateTime}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{meetup.location}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="p-4 space-y-4">
        {!isJoinedLobby ? (
          <Button className="w-full" onClick={handleJoinLobby}>
            Join Meetup Lobby
          </Button>
        ) : !isCheckedIn ? (
          <Button className="w-full" onClick={() => setIsQrScannerOpen(true)}>
            <QrCode className="mr-2 h-4 w-4" /> Scan QR Code
          </Button>
        ) : (
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white" disabled>
            <Check className="mr-2 h-4 w-4" /> Checked In
          </Button>
        )}
      </div>

      <Dialog open={isQrScannerOpen} onOpenChange={setIsQrScannerOpen}>
        <DialogContent>
          <QRScanner 
            onSuccess={handleQrScanSuccess} 
            onCancel={() => setIsQrScannerOpen(false)} 
            meetupId={meetupId!} 
          />
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
};

export default MeetupLobby;
