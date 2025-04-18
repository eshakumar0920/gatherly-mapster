
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/EventCard";
import Navigation from "@/components/Navigation";
import { getFeaturedEvents, categories } from "@/services/eventService";
import { getMeetups } from "@/services/meetupService";
import MeetupCard from "@/components/MeetupCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  category: string;
}

interface Meetup {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  points: number;
  createdBy: string;
  creatorAvatar?: string;
  lobbySize: number;
  attendees?: string[];
}

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // For now, use mock data since the events table doesn't exist in Supabase
        console.log("Supabase doesn't have the events table yet. Using mock data.");
        setFeaturedEvents(getFeaturedEvents());
        setMeetups(getMeetups());
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description: "Could not load data, using mock data instead",
          variant: "destructive"
        });
        
        // Fall back to mock data on errors
        setFeaturedEvents(getFeaturedEvents());
        setMeetups(getMeetups());
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="pb-20">
      {/* App Name */}
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      {/* Header */}
      <header className="p-4">
        <h1 className="text-2xl font-bold">UTD Events</h1>
        <p className="text-muted-foreground">Discover student-led events and meetups around campus</p>
      </header>

      {/* Search bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search events & meetups..." 
            className="pl-10 rounded-full bg-muted/50"
          />
        </div>
      </div>

      {/* Tabs for Events and Meetups */}
      <Tabs defaultValue="all" className="w-full px-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="meetups">Meetups</TabsTrigger>
        </TabsList>
        
        {/* All Content Tab */}
        <TabsContent value="all">
          {/* Categories */}
          <div className="pb-4">
            <h2 className="text-lg font-semibold mb-2">Categories</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                className="rounded-full text-xs"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="rounded-full text-xs whitespace-nowrap"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center">
              <p>Loading content...</p>
            </div>
          ) : (
            <>
              {/* Featured Events */}
              <div className="pb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Featured Events</h2>
                  <Button variant="link" className="text-sm p-0">See all</Button>
                </div>
                <div className="space-y-4">
                  {featuredEvents.map(event => (
                    <EventCard key={event.id} event={event} featured />
                  ))}
                </div>
              </div>

              {/* Student Meetups */}
              <div className="pb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Student Meetups</h2>
                  <Button variant="link" className="text-sm p-0">See all</Button>
                </div>
                <div className="space-y-4">
                  {meetups.slice(0, 3).map(meetup => (
                    <MeetupCard key={meetup.id} meetup={meetup} />
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>
        
        {/* Events Tab */}
        <TabsContent value="events">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Campus Events</h2>
            {isLoading ? (
              <p className="text-center py-8">Loading events...</p>
            ) : (
              featuredEvents.map(event => (
                <EventCard key={event.id} event={event} featured />
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Meetups Tab */}
        <TabsContent value="meetups">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Student Meetups</h2>
            {isLoading ? (
              <p className="text-center py-8">Loading meetups...</p>
            ) : (
              meetups.map(meetup => (
                <MeetupCard key={meetup.id} meetup={meetup} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Index;
