
import { Meetup } from "@/types/meetup";
import MeetupCard from "@/components/MeetupCard";
import ContentLoader from "@/components/home/ContentLoader";
import { Skeleton } from "@/components/ui/skeleton";

interface MeetupsListProps {
  meetups: Meetup[];
  isLoading: boolean;
  onMeetupClick: (meetupId: string) => void;
}

const MeetupsList = ({ meetups, isLoading, onMeetupClick }: MeetupsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (meetups.length === 0) {
    return (
      <div className="py-8 text-center">
        <p>No meetups found. Create one!</p>
      </div>
    );
  }

  console.log("MeetupsList - rendering", meetups.length, "meetups");
  
  return (
    <div className="space-y-4">
      {meetups.map(meetup => {
        const currentAttendees = meetup.attendees?.length || 1; // Default to 1 for creator
        const isLobbyFull = currentAttendees >= meetup.lobbySize;
        
        return (
          <div 
            key={meetup.id} 
            onClick={() => onMeetupClick(meetup.id)}
            className="cursor-pointer"
          >
            <MeetupCard 
              meetup={{
                ...meetup,
                attendees: meetup.attendees || []
              }} 
            />
          </div>
        );
      })}
    </div>
  );
};

export default MeetupsList;
