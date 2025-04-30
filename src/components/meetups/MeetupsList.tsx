
import { Meetup } from "@/types/meetup";
import MeetupCard from "@/components/MeetupCard";
import ContentLoader from "@/components/home/ContentLoader";
import { pointClassifications } from "@/services/types";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface MeetupsListProps {
  meetups: Meetup[];
  isLoading: boolean;
  onMeetupClick: (meetupId: string) => void;
  showPointsClassification?: boolean;
}

const MeetupsList = ({ 
  meetups, 
  isLoading, 
  onMeetupClick,
  showPointsClassification = false
}: MeetupsListProps) => {
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

  // Helper to get classification for a meetup
  const getClassification = (lobbySize: number) => {
    return pointClassifications.find(
      c => lobbySize >= c.minSize && lobbySize <= c.maxSize
    ) || pointClassifications[0];
  };

  // Updated meetups with correct point values based on classification
  const meetupsWithCorrectPoints = meetups.map(meetup => {
    const classification = getClassification(meetup.lobbySize);
    return {
      ...meetup,
      points: classification.basePoints
    };
  });

  return (
    <div className="space-y-4">
      {showPointsClassification && (
        <div className="bg-muted/50 p-3 rounded-md">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Users className="h-4 w-4 mr-1" /> 
            Points by Group Size
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {pointClassifications.map(classification => (
              <Badge 
                key={classification.type} 
                variant="outline" 
                className={`${classification.color} border-none`}
              >
                {classification.label}: {classification.basePoints} pts 
                <span className="opacity-75 ml-1">({classification.minSize}-{classification.maxSize} people)</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {meetupsWithCorrectPoints.map(meetup => {
        const classification = getClassification(meetup.lobbySize);
        return (
          <div 
            key={meetup.id} 
            onClick={() => onMeetupClick(meetup.id)}
            className="cursor-pointer"
          >
            <MeetupCard meetup={meetup} />
            {showPointsClassification && (
              <div className="mt-1 text-xs flex justify-end">
                <Badge variant="outline" className={`${classification.color} border-none`}>
                  {classification.label}: {classification.basePoints} pts
                </Badge>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MeetupsList;
