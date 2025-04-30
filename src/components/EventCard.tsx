import { Badge } from "@/components/ui/badge";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  category?: string;
  points?: number;
  creatorId?: string; // Add creatorId property
  organizer?: string;
}

export interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
      style={{ height: "400px" }}
    >
      <div className="relative h-1/2">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          {event.category && (
            <Badge variant="secondary">{event.category}</Badge>
          )}
        </div>
      </div>
      <div className="p-4 h-1/2 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <p>
            Date: <span className="font-medium">{event.date}</span>
          </p>
          <p>
            Time: <span className="font-medium">{event.time}</span>
          </p>
          <p>
            Location: <span className="font-medium">{event.location}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
