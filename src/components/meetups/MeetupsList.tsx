
import { Meetup } from "@/types/meetup";
import MeetupCard from "@/components/MeetupCard";
import ContentLoader from "@/components/home/ContentLoader";

interface MeetupsListProps {
  meetups: Meetup[];
  isLoading: boolean;
  onMeetupClick: (meetupId: string) => void;
}

const MeetupsList = ({ meetups, isLoading, onMeetupClick }: MeetupsListProps) => {
  if (isLoading) {
    return <ContentLoader message="Loading meetups..." />;
  }

  if (meetups.length === 0) {
    return (
      <div className="py-8 text-center">
        <p>No meetups found. Create one!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {meetups.map(meetup => (
        <div 
          key={meetup.id} 
          onClick={() => onMeetupClick(meetup.id)}
          className="cursor-pointer"
        >
          <MeetupCard meetup={meetup} />
        </div>
      ))}
    </div>
  );
};

export default MeetupsList;
