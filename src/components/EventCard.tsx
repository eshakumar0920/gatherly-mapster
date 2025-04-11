
import { CalendarDays, Clock, MapPin, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  category: string;
}

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

const EventCard = ({ event, featured = false }: EventCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const handleViewDetails = () => {
    navigate(`/events/${event.id}`);
  };
  
  const handleAddToProfile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    // In a real app, this would connect to a backend
    // For now, just store in localStorage
    const savedEvents = JSON.parse(localStorage.getItem("savedEvents") || "[]");
    
    if (!savedEvents.includes(event.id)) {
      savedEvents.push(event.id);
      localStorage.setItem("savedEvents", JSON.stringify(savedEvents));
      
      toast({
        title: "Event added to profile",
        description: "This event has been added to your profile.",
      });
      
      setIsAdded(true);
    } else {
      toast({
        title: "Event already in profile",
        description: "This event is already in your profile.",
      });
    }
  };
  
  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem("savedEvents") || "[]");
    if (savedEvents.includes(event.id)) {
      setIsAdded(true);
    }
  }, [event.id]);
  
  return (
    <div className={`event-card ${featured ? 'w-full' : 'w-full'} animate-fade-in`}>
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.title}
          className={`w-full object-cover ${featured ? 'h-48' : 'h-36'}`}
        />
        <div className="event-card-gradient"></div>
        <div className="absolute bottom-3 left-3 z-20">
          <span className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs rounded-full">
            {event.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className={`font-bold ${featured ? 'text-xl' : 'text-lg'} line-clamp-1`}>{event.title}</h3>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{event.description}</p>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-2" />
            <span>{event.date}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.location}</span>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={handleViewDetails}>
            View Details
          </Button>
          <Button 
            variant={isAdded ? "outline" : "secondary"} 
            className="flex items-center" 
            onClick={handleAddToProfile}
            disabled={isAdded}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            {isAdded ? "Added" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
