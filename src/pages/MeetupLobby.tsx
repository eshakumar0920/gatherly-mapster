
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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
  event_date: string;
  location: string;
  xp_reward: number;
  category?: string;
}

interface Attendee {
  id: string;
  name: string;
  avatar: string;
  status: "going" | "interested";
}

// Static fallback attendees
const mockAttendees: Attendee[] = [
  { id: "1", name: "Jane Cooper", avatar: "https://i.pravatar.cc/100?img=1", status: "going" },
  { id: "2", name: "Wade Warren", avatar: "https://i.pravatar.cc/100?img=2", status: "going" },
  { id: "3", name: "Esther Howard", avatar: "https://i.pravatar.cc/100?img=3", status: "going" },
];

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
        // Try real backend fetch
        const resp = await meetupsApi.getMeetupById(meetupId);
        if (!resp.data) throw new Error("No data");
        setMeetup(resp.data as Meetup);
      } catch {
        // Fallback to a dummy meetup
        const dummy: Meetup = {
          id: meetupId,
          title: `Mock Meetup #${meetupId}`,
          description: "This is a mock meetup because the server call failed.",
          event_date: new Date().toISOString(),
          location: "UTD Campus",
          xp_reward: 5,
          category: "General",
        };
        setMeetup(dummy);
      } finally {
        setLoading(false);
      }
    })();
  }, [meetupId]);

  useEffect(() => {
    if (meetup) {
      setIsJoined(joinedLobbies.includes(meetup.id));
      setIsCheckedIn(attendedMeetups.includes(meetup.id));
    }
  }, [meetup, joinedLobbies, attendedMeetups]);

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
    if (meetup && data.includes(meetupId)) {
      try {
        await meetupsApi.checkInToMeetup(meetup.id, { user_id: 1 });
        attendMeetup(meetup.id, meetup.xp_reward);
        setIsCheckedIn(true);
        toast({ title: "Checked In!", description: `+${meetup.xp_reward} XP` });
      } catch {
        // Local fallback
        attendMeetup(meetup.id, meetup.xp_reward);
        setIsCheckedIn(true);
      }
    } else {
      toast({ title: "Invalid QR", variant: "destructive" });
    }
    setQrOpen(false);
  };

  const filteredAttendees = mockAttendees.filter(a => view === "all" || a.status === view);

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
      {/* Header */}
      <div className="p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="ml-2 text-2xl font-bold">Meetup Details</h1>
      </div>

      {/* Details */}
      <div className="p-4 space-y-2">
        <h2 className="text-2xl font-bold">{meetup.title}</h2>
        <p className="text-muted-foreground">{meetup.description}</p>
        <div className="flex items-center gap-4 text-sm">
          <Calendar size={16} />
          <span>{format(new Date(meetup.event_date), "PPpp")}</span>
          <MapPin size={16} />
          <span>{meetup.location}</span>
        </div>
      </div>

      <Separator />

      {/* Attendees */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Users size={18} className="mr-2" /> Attendees
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
                      <AvatarImage src={a.avatar} />
                      <AvatarFallback>{a.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{a.name}</span>
                    <Badge>{a.status}</Badge>
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
                      <AvatarImage src={a.avatar} />
                      <AvatarFallback>{a.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{a.name}</span>
                    <Badge>{a.status}</Badge>
                  </div>
                ))}
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Inline avatars */}
        <div className="flex -space-x-2 overflow-hidden">
          {mockAttendees.slice(0, 5).map(a => (
            <Avatar key={a.id} className="border-2 border-white">
              <AvatarImage src={a.avatar} />
              <AvatarFallback>{a.name[0]}</AvatarFallback>
            </Avatar>
          ))}
          {mockAttendees.length > 5 && (
            <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-xs">
              +{mockAttendees.length - 5}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Actions */}
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

      {/* QR Scanner */}
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
