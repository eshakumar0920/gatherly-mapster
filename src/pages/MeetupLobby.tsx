import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Users, Calendar, MapPin, QrCode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { QRScanner } from "@/components/QRScanner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import Navigation from "@/components/Navigation";

const mockAttendees = [
  { id: "1", name: "Jane Cooper", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop", status: "going" },
  { id: "2", name: "Wade Warren", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&auto=format&fit=crop", status: "going" },
  { id: "3", name: "Esther Howard", avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&auto=format&fit=crop", status: "going" },
  { id: "4", name: "Cameron Williamson", avatar: "https://images.unsplash.com/photo-1507003211169-7472b28e22ac?w=200&h=200&auto=format&fit=crop", status: "interested" },
  { id: "5", name: "Brooklyn Simmons", avatar: "https://images.unsplash.com/photo-1507101105822-7472b28e22ac?w=200&h=200&auto=format&fit=crop", status: "interested" },
  { id: "6", name: "Jenny Wilson", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&auto=format&fit=crop", status: "interested" },
  { id: "7", name: "Robert Fox", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&auto=format&fit=crop", status: "interested" },
];

const MeetupLobby = () => {
  const { meetupId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [meetup, setMeetup] = useState<any>(null);
  const [attendeeView, setAttendeeView] = useState<"all" | "going" | "interested">("all");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const [scannedData, setScannedData] = useState<string | null>(null);

  const handleScan = (data: string | null) => {
    if (data) {
      setScannedData(data);
      toast({
        title: "QR Code Scanned!",
        description: `Data from QR code: ${data}`,
      });
    }
    setIsQRScannerOpen(false);
  };

  const handleCloseQRScanner = () => {
    setIsQRScannerOpen(false);
  };

  const filteredAttendees = mockAttendees.filter(attendee => {
    if (attendeeView === "all") return true;
    return attendee.status === attendeeView;
  });

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    toast({
      title: "Check-in successful!",
      description: "You've checked in to this event",
      variant: "default",
    });
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
          <h2 className="text-xl mb-4">Event not found</h2>
          <Button onClick={() => navigate("/events")} className="bg-primary text-primary-foreground">
            Back to Events
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
          variant={attendeeView === "all" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setAttendeeView("all")}
        >
          All ({mockAttendees.length})
        </Button>
        <Button 
          variant={attendeeView === "going" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setAttendeeView("going")}
        >
          Going ({mockAttendees.filter(a => a.status === "going").length})
        </Button>
        <Button 
          variant={attendeeView === "interested" ? "default" : "outline"} 
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

  useEffect(() => {
    const fetchMeetupDetails = async () => {
      if (!meetupId) return;

      try {
        const { data: meetupData, error } = await supabase
          .from('events')
          .select(`
            *,
            creator:creator_id (
              name,
              avatar_url
            )
          `)
          .eq('event_id', meetupId)
          .single();

        if (error) throw error;

        if (meetupData) {
          setMeetup({
            id: meetupData.event_id.toString(),
            title: meetupData.title,
            description: meetupData.description || "No description available",
            dateTime: format(new Date(meetupData.event_time), "MM/dd/yyyy h:mm a"),
            location: meetupData.location,
            points: 3,
            createdBy: meetupData.creator?.name || "Anonymous",
            creatorAvatar: meetupData.creator?.avatar_url,
            lobbySize: meetupData.lobby_size || 5,
            attendees: mockAttendees.map(a => a.id)
          });
        }
      } catch (error) {
        console.error('Error fetching meetup:', error);
      }
    };

    fetchMeetupDetails();
  }, [meetupId]);

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
        <h1 className="text-xl font-bold">Event Details</h1>
      </header>

      <div className="relative">
        {/* <img 
          src={meetup.image} 
          alt={meetup.title}
          className="w-full h-48 object-cover"
        /> */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-3 left-3 z-20">
          <Badge className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs rounded-full">
            {meetup.category}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-2xl font-bold">{meetup.title}</h2>
        <p className="text-muted-foreground mt-1">{meetup.description}</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{meetup.dateTime}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{meetup.time}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{meetup.location}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <Avatar className="h-5 w-5 mr-1">
              <AvatarImage src={meetup.creatorAvatar || ""} />
              <AvatarFallback>{meetup.createdBy.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{meetup.createdBy}</span>
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
          <Button 
            className="w-full bg-primary text-primary-foreground"
            onClick={handleCheckIn}
          >
            <Check className="mr-2 h-4 w-4" />
            Check In
          </Button>
        )}
        <Button variant="outline" className="w-full">
          Interested
        </Button>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-background border-t">
        <Button className="w-full" onClick={() => setIsQRScannerOpen(true)}>
          <QrCode className="mr-2 h-4 w-4" />
          Scan QR Code
        </Button>
      </div>

      <Sheet open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Scan QR Code</SheetTitle>
          </SheetHeader>
          <QRScanner onScan={handleScan} onClose={handleCloseQRScanner} />
        </SheetContent>
      </Sheet>

      {scannedData && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-lg font-semibold">Scanned Data:</h2>
            <p>{scannedData}</p>
            <Button onClick={() => setScannedData(null)}>Close</Button>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
};

export default MeetupLobby;
