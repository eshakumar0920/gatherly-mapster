
import React from "react";
import { format, parseISO, isValid } from "date-fns";
import { Meetup } from "@/types/meetup";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface MeetupCardProps {
  meetup: Meetup;
}

// Format date function for the meetup card
const formatDate = (meetup: Meetup): string => {
  if (!meetup.dateTime) {
    return "Date unavailable";
  }

  // For already formatted strings like "Today @3pm", just return as is
  if (typeof meetup.dateTime === 'string' && 
      (meetup.dateTime.includes('@') || 
       meetup.dateTime.toLowerCase().includes('today') || 
       meetup.dateTime.toLowerCase().includes('tomorrow'))) {
    return meetup.dateTime;
  }

  // Try to parse as a date for other cases
  try {
    let dateObj: Date | null = null;

    if (typeof meetup.dateTime === 'string') {
      // First try ISO format
      const parsedDate = parseISO(meetup.dateTime);
      if (isValid(parsedDate)) {
        dateObj = parsedDate;
      } else {
        // Try with a more lenient approach
        const fallbackDate = new Date(meetup.dateTime);
        if (isValid(fallbackDate)) {
          dateObj = fallbackDate;
        }
      }
    } else if (meetup.dateTime && typeof meetup.dateTime === 'object') {
      // Instead of instanceof Date, check if it's an object
      const dateCheck = new Date(meetup.dateTime.toString());
      if (isValid(dateCheck)) {
        dateObj = dateCheck;
      }
    }

    if (dateObj && isValid(dateObj)) {
      return format(dateObj, "MMM d, yyyy h:mm a");
    }

    // If we couldn't parse it, just return the original string
    return typeof meetup.dateTime === 'string' ? meetup.dateTime : "Date unavailable";
  } catch (error) {
    console.error("Error formatting date:", error);
    return typeof meetup.dateTime === 'string' ? meetup.dateTime : "Date unavailable";
  }
};

const MeetupCard = ({ meetup }: MeetupCardProps) => {
  return (
    <Card className="mb-3 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold">{meetup.title}</h2>
            <p className="text-muted-foreground text-sm line-clamp-2">{meetup.description}</p>
          </div>
          {meetup.creatorAvatar && (
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <img 
                src={meetup.creatorAvatar} 
                alt={`${meetup.createdBy}'s avatar`}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(meetup)}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm">
            {meetup.location}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {meetup.category || "Meetup"}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default MeetupCard;
export { formatDate };
