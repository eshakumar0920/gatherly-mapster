
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Users, Share, Calendar, Clock, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { getEvents } from "@/services/eventService";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, parse } from "date-fns";
import QRScanner from "@/components/QRScanner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUserStore } from "@/services/meetupService";

const mockAttendees = [
  { id: "1", name: "Jane Cooper", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop", status: "going" },
  { id: "2", name: "Wade Warren", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&auto=format&fit=crop", status: "going" },
  { id: "3", name: "Esther Howard", avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&auto=format&fit=crop", status: "going" },
  { id: "4", name: "Cameron Williamson", avatar: "https://images.unsplash.com/photo-1507003211169-7472b28e22ac?w=200&h=200&auto=format&fit=crop", status: "interested" },
  { id: "5", name: "Brooklyn Simmons", avatar: "https://images.unsplash.com/photo-1507101105822-7472b28e22ac?w=200&h=200&auto=format&fit=crop", status: "interested" },
  { id: "6", name: "Jenny Wilson", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&auto=format&fit=crop", status: "interested" },
  { id: "7", name: "Robert Fox", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&auto=format&fit=crop", status: "interested" },
];

const EventLobby = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { attendMeetup } = useUserStore();
  const [event, setEvent] = useState<any>(null);
  const [attendeeView, setAttendeeView] = useState<"all" | "going" | "interested">("all");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [organizer, setOrganizer] = useState<any>(null);
  
  useEffect(() => {
    const events = getEvents();
    const foundEvent = events.find(e => e.id === eventId);
    if (foundEvent) {
      let formattedTime = foundEvent.time;
      try {
        const timeString = foundEvent.time.split(" - ")[0].trim();
        if (timeString.includes("AM") || timeString.includes("PM") || 
            timeString.includes("am") || timeString.includes("pm")) {
          formattedTime = timeString;
        } else {
          const timeParts = timeString.split(":");
          if (timeParts.length >= 2) {
            const hour = parseInt(timeParts[0], 10);
            const minute = parseInt(timeParts[1], 10);
            
            if (!isNaN(hour) && !isNaN(minute)) {
              const ampm = hour >= 12 ? "PM" : "AM";
              const hour12 = hour % 12 || 12;
              formattedTime = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
            }
          }
        }
      } catch (error) {
        console.error("Error parsing time:", error);
        formattedTime = foundEvent.time;
      }
      
      const updatedEvent = {
        ...foundEvent,
        time: formattedTime
      };
      setEvent(updatedEvent);
      
      // Fetch organizer info if we have creatorId
      if (foundEvent.creatorId) {
        fetchOrganizerInfo(foundEvent.creatorId);
      }
    } else {
      console.log("Event not found for ID:", eventId);
    }
  }, [eventId]);

  const fetchOrganizerInfo = async (creatorId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, profile_picture')
        .eq('id', parseInt(creatorId)) // Convert string to number for the query
        .single();
      
      if (data && !error) {
        setOrganizer({
          name: data.username || "Event Organizer",
          avatar: data.profile_picture || null
        });
      }
    } catch (error) {
      console.error("Error fetching organizer info:", error);
    }
  };

  const filteredAttendees = mockAttendees.filter(attendee => {
    if (attendeeView === "all") return true;
    return attendee.status === attendeeView;
  });

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    
    // Add to user's attended events
    if (eventId && event?.points) {
      attendMeetup(eventId, event.points);
    }
    
    toast({
      title: "Check-in successful!",
      description: "You've checked in to this event",
      variant: "default",
    });
  };
  
  const handleQRScan = () => {
    setIsQRScannerOpen(true);
  };
  
  const handleQRScanSuccess = (data: string) => {
    setIsQRScannerOpen(false);
    handleCheckIn();
  };

  if (!event) {
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
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-3 left-3 z-20">
          <Badge className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs rounded-full">
            {event.category}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-2xl font-bold">{event.title}</h2>
        <p className="text-muted-foreground mt-1">{event.description}</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{event.date}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-2">
                <AvatarImage src={organizer?.avatar || ""} />
                <AvatarFallback>{(organizer?.name || event.organizer || "O").charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{organizer?.name || event.organizer || "Event Organizer"}</span>
            </div>
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
            onClick={handleQRScan}
          >
            <Check className="mr-2 h-4 w-4" />
            Check In
          </Button>
        )}
        <Button variant="outline" className="w-full">
          Interested
        </Button>
      </div>

      {/* QR Scanner Dialog */}
      <Dialog open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
        <DialogContent className="p-0 sm:max-w-md">
          <QRScanner 
            onSuccess={handleQRScanSuccess}
            onCancel={() => setIsQRScannerOpen(false)}
            meetupId={eventId}
          />
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
};

export default EventLobby;
