
import { Clock, MapPin, User, ScanLine, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meetup, useUserStore } from "@/services/meetupService";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRScanner from "@/components/QRScanner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface MeetupCardProps {
  meetup: Meetup;
}

const MeetupCard = ({ meetup }: MeetupCardProps) => {
  const { attendMeetup, attendedMeetups } = useUserStore();
  const { toast } = useToast();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  const isAttended = attendedMeetups?.includes(meetup.id);
  const currentAttendees = meetup.attendees?.length || 0;
  const isLobbyFull = currentAttendees >= meetup.lobbySize;
  
  const handleAttend = () => {
    if (isLobbyFull) {
      toast({
        title: "Lobby is full",
        description: `This meetup has reached its maximum capacity of ${meetup.lobbySize} attendees.`,
        variant: "destructive",
      });
      return;
    }
    setIsScannerOpen(true);
  };
  
  const handleScanSuccess = (data: string) => {
    // In a real app, we would validate the QR code data against the meetup ID
    if (isLobbyFull) {
      toast({
        title: "Lobby is full",
        description: `This meetup has reached its maximum capacity of ${meetup.lobbySize} attendees.`,
        variant: "destructive",
      });
      setIsScannerOpen(false);
      return;
    }
    
    attendMeetup(meetup.id, meetup.points);
    toast({
      title: "Meetup joined!",
      description: `You earned ${meetup.points} points for joining this meetup.`,
    });
    setIsScannerOpen(false);
  };
  
  return (
    <div className="border rounded-lg p-4 bg-card animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-base line-clamp-1">{meetup.title}</h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
            {meetup.description}
          </p>
        </div>
        <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-full text-yellow-600 text-xs">
          +{meetup.points} pts
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          <span>{meetup.dateTime}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{meetup.location}</span>
        </div>
        
        <div className="flex justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarImage src={meetup.creatorAvatar || ""} />
                <AvatarFallback>{meetup.createdBy.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{meetup.createdBy}</span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>{currentAttendees}/{meetup.lobbySize}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full flex items-center justify-center" 
              onClick={handleAttend} 
              variant={isAttended ? "outline" : "yellow"}
              disabled={isAttended || isLobbyFull}
            >
              {isAttended ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Checked In
                </>
              ) : isLobbyFull ? (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Lobby Full
                </>
              ) : (
                <>
                  <ScanLine className="mr-2 h-4 w-4" />
                  Scan QR Code
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scan QR Code to Check In</DialogTitle>
            </DialogHeader>
            <QRScanner 
              onSuccess={handleScanSuccess} 
              onCancel={() => setIsScannerOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MeetupCard;
