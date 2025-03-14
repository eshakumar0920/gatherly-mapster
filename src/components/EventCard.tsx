
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <span className="px-2 py-1 bg-event-primary/80 text-white text-xs rounded-full">
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
        
        <div className="mt-4">
          <Button className="w-full bg-gradient-to-r from-event-primary to-event-secondary hover:opacity-90">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
