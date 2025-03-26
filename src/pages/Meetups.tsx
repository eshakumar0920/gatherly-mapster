
import { useState } from "react";
import { Search, Plus, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { getMeetups, useUserStore } from "@/services/meetupService";
import { useToast } from "@/components/ui/use-toast";

const Meetups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const allMeetups = getMeetups();
  const { points, level, attendMeetup, attendedMeetups } = useUserStore();
  const { toast } = useToast();
  
  const filteredMeetups = allMeetups.filter(meetup => {
    // Filter by search query
    if (searchQuery && !meetup.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleAttendMeetup = (meetupId: string, points: number) => {
    if (attendedMeetups.includes(meetupId)) {
      toast({
        title: "Already attending",
        description: "You're already signed up for this meetup",
        variant: "destructive",
      });
      return;
    }

    attendMeetup(meetupId, points);
    
    const newLevel = Math.floor((useUserStore.getState().points) / 10) + 1;
    if (newLevel > level) {
      toast({
        title: "Level up!",
        description: `Congratulations! You've reached level ${newLevel}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Points added",
        description: `You earned ${points} points for joining this meetup`,
        variant: "default",
      });
    }
  };

  return (
    <div className="pb-20">
      {/* App Name */}
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Meetups</h1>
          <p className="text-muted-foreground">Find student-organized meetups</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-primary/10 px-2 py-1 rounded-full">
            <Star className="h-4 w-4 text-primary mr-1" />
            <span className="font-medium">{points} pts</span>
          </div>
          <div className="px-2 py-1 bg-primary/20 rounded-full">
            <span className="font-medium">Level {level}</span>
          </div>
        </div>
      </header>

      {/* Search bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search meetups..." 
            className="pl-10 rounded-full bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Create Meetup Button */}
      <div className="px-4 pb-4">
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Create New Meetup
        </Button>
      </div>

      {/* Meetups List */}
      <div className="px-4">
        <ul className="space-y-2">
          {filteredMeetups.map(meetup => (
            <li 
              key={meetup.id} 
              className="p-3 bg-yellow-100/80 rounded-lg flex justify-between items-center"
            >
              <div className="flex-1">
                <p className="font-medium">{meetup.title}</p>
                <p className="text-xs text-muted-foreground">{meetup.dateTime} • {meetup.location}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="whitespace-nowrap"
                onClick={() => handleAttendMeetup(meetup.id, meetup.points)}
                disabled={attendedMeetups.includes(meetup.id)}
              >
                {attendedMeetups.includes(meetup.id) ? (
                  "Joined"
                ) : (
                  <>+{meetup.points}</>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Meetups;
