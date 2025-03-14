
import { User, Settings, Heart, Calendar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import EventCard from "@/components/EventCard";
import Navigation from "@/components/Navigation";
import { getFeaturedEvents } from "@/services/eventService";

const Profile = () => {
  const savedEvents = getFeaturedEvents().slice(0, 2);

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
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* Profile Info */}
      <div className="px-4 py-6 flex flex-col items-center">
        <Avatar className="h-24 w-24">
          <AvatarImage src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <h2 className="mt-4 text-xl font-semibold">Jane Doe</h2>
        <p className="text-muted-foreground">jane.doe@example.com</p>
        
        <div className="mt-6 w-full max-w-xs flex justify-around">
          <div className="text-center">
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Attended</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">5</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">Saved</p>
          </div>
        </div>
        
        <Button className="mt-6">
          Edit Profile
        </Button>
      </div>

      <Separator />

      {/* Saved Events */}
      <div className="px-4 py-4">
        <div className="flex items-center mb-4">
          <Heart className="h-5 w-5 text-event-primary mr-2" />
          <h3 className="text-lg font-semibold">Saved Events</h3>
        </div>
        
        <div className="space-y-4">
          {savedEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
          
          {savedEvents.length > 0 && (
            <Button variant="outline" className="w-full">
              View All Saved Events
            </Button>
          )}
        </div>
      </div>
      
      <Separator />
      
      {/* Account Options */}
      <div className="px-4 py-4">
        <div className="space-y-3">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <User className="h-5 w-5 mr-3" />
            Account Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <Calendar className="h-5 w-5 mr-3" />
            My Calendar
          </Button>
          <Button variant="ghost" className="w-full justify-start text-destructive">
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Profile;
