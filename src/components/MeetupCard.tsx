
import { Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meetup, useUserStore } from "@/services/meetupService";
import { useToast } from "@/hooks/use-toast";

interface MeetupCardProps {
  meetup: Meetup;
}

const MeetupCard = ({ meetup }: MeetupCardProps) => {
  const { attendMeetup, attendedMeetups } = useUserStore();
  const { toast } = useToast();
  
  const isAttended = attendedMeetups?.includes(meetup.id);
  
  const handleAttend = () => {
    attendMeetup(meetup.id, meetup.points);
    toast({
      title: "Meetup joined!",
      description: `You earned ${meetup.points} points for joining this meetup.`,
    });
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
        <div className="flex items-center bg-primary/10 px-2 py-1 rounded-full text-primary text-xs">
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
        
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="h-4 w-4 mr-2" />
          <span>{meetup.createdBy}</span>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          className="w-full" 
          onClick={handleAttend} 
          variant={isAttended ? "outline" : "default"}
          disabled={isAttended}
        >
          {isAttended ? "Already Joined" : "Join Meetup"}
        </Button>
      </div>
    </div>
  );
};

export default MeetupCard;
