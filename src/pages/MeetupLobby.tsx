
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Users, Calendar, Clock, MapPin, ScanLine, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import QRScanner from "@/components/QRScanner";
import { getMeetups, useUserStore } from "@/services/meetupService";
import { useIsMobile } from "@/hooks/use-mobile";

const mockAttendees = [
  { id: "1", name: "Jane Cooper", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop", status: "going" },
  { id: "2", name: "Wade Warren", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&auto=format&fit=crop", status: "going" },
  { id: "3", name: "Esther Howard", avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&auto=format&fit=crop", status: "going" },
];

const MeetupLobby = () => {
  const { meetupId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [meetup, setMeetup] = useState<any>(null);
  const [attendeeView, setAttendeeView] = useState<"all" | "going" | "interested">("all");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const { attendMeetup, attendedMeetups } = useUserStore();
  
  useEffect(() => {
    const meetups = getMeetups();
    const foundMeetup = meetups.find(e => e.id === meetupId);
    if (foundMeetup) {
      setMeetup(foundMeetup);
      setIsCheckedIn(attendedMeetups?.includes(foundMeetup.id));
    } else {
      console.log("Meetup not found for ID:", meetupId);
    }
  }, [meetupId, attendedMeetups]);

  const filteredAttendees = mockAttendees.filter(attendee => {
    if (attendeeView === "all") return true;
    return attendee.status === attendeeView;
  });

  const handleScanSuccess = (data: string) => {
    if (data && meetup) {
      attendMeetup(meetup.id, meetup.points);
      setIsCheckedIn(true);
      toast({
        title: "Check-in successful!",
        description: `You've checked in to this meetup and earned ${meetup.points} points!`,
        variant: "default",
      });
      setIsScannerOpen(false);
    }
  };

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
          <h2 className="text-2xl font-bold">{meetup.title}</h2>
          <Badge className="bg-yellow-500 text-black">+{meetup.points} pts</Badge>
        </div>
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
          
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Hosted by {meetup.createdBy}</span>
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

      <div className="p-4 grid grid-cols-2 gap-3">
        {isCheckedIn ? (
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white" disabled>
            <Check className="mr-2 h-4 w-4" />
            Checked In
          </Button>
        ) : (
          <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <ScanLine className="mr-2 h-4 w-4" />
                Check In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan QR Code</DialogTitle>
              </DialogHeader>
              <QRScanner 
                onSuccess={handleScanSuccess} 
                onCancel={() => setIsScannerOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        )}
        <Button variant="outline" className="w-full">
          Interested
        </Button>
      </div>

      <Navigation />
    </div>
  );
};

export default MeetupLobby;
