
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import QRScanner from "@/components/QRScanner";
import { useToast } from "@/hooks/use-toast";
import { meetupsApi } from "@/services/api";
import { useUserStore } from "@/services/meetupService";
import { useIsMobile } from "@/hooks/use-mobile";

interface Meetup {
  id: string;
  title: string;
  description: string;
  event_date: string;   // match your Flask field names
  location: string;
  xp_reward: number;
  category?: string;
}

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
  const [view, setView] = useState<"all" | "going" | "interested">("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!meetupId) return;
      try {
        const resp = await meetupsApi.getMeetupById(meetupId);
        if (resp.data) {
          const m = resp.data as Meetup;
          setMeetup(m);
          setIsJoined(joinedLobbies.includes(m.id.toString()));
          setIsCheckedIn(attendedMeetups.includes(m.id.toString()));
        } else {
          throw new Error("No data");
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Meetup not found",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [meetupId, joinedLobbies, attendedMeetups, toast]);

  const handleJoin = async () => {
    if (!meetup) return;
    try {
      await meetupsApi.joinMeetupLobby(meetup.id, { user_id: 1 });
      joinLocal(meetup.id);
      setIsJoined(true);
      toast({ title: "Joined Meetup Lobby" });
    } catch {
      toast({ title: "Could not join", variant: "destructive" });
    }
  };

  const handleCheckIn = () => setQrOpen(true);

  const onScan = async (data: string) => {
    if (data.includes(meetupId) && meetup) {
      try {
        await meetupsApi.checkInToMeetup(meetup.id, { user_id: 1 });
        attendMeetup(meetup.id, meetup.xp_reward);
        setIsCheckedIn(true);
        toast({ title: "Checked In!", description: `+${meetup.xp_reward} XP` });
      } catch {
        // fallback local
        attendMeetup(meetup.id, meetup.xp_reward);
        setIsCheckedIn(true);
      }
    } else {
      toast({ title: "Invalid QR", variant: "destructive" });
    }
    setQrOpen(false);
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
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2>Meetup not found</h2>
        <Button onClick={() => navigate("/meetups")}>Back to Meetups</Button>
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
        <Badge className="bg-yellow-500 text-black">+{meetup.xp_reward} pts</Badge>
        <p className="text-muted-foreground mt-1">{meetup.description}</p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{format(new Date(meetup.event_date), "MM/dd/yyyy h:mm a")}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{meetup.location}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="p-4 space-y-4">
        {!isJoined ? (
          <Button className="w-full" onClick={handleJoin}>
            Join Meetup Lobby
          </Button>
        ) : !isCheckedIn ? (
          <Button className="w-full" onClick={handleCheckIn}>
            <QrCode className="mr-2 h-4 w-4" /> Scan QR to Check In
          </Button>
        ) : (
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white" disabled>
            <Check className="mr-2 h-4 w-4" /> Checked In
          </Button>
        )}
      </div>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            <QRScanner onSuccess={onScan} onCancel={() => setQrOpen(false)} meetupId={meetupId!} />
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
};

export default MeetupLobby;
