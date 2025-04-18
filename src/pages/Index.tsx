
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getFeaturedEvents } from "@/services/eventService";
import { getMeetups } from "@/services/meetupService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "@/components/EventCard";
import MeetupCard from "@/components/MeetupCard";
import Navigation from "@/components/Navigation";
import { Meetup } from "@/types/meetup";
import AppHeader from "@/components/home/AppHeader";
import CategoryFilter from "@/components/home/CategoryFilter";
import SectionHeader from "@/components/home/SectionHeader";
import ContentLoader from "@/components/home/ContentLoader";

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
      <AppHeader />

      {/* Tabs for Events and Meetups */}
      <Tabs defaultValue="all" className="w-full px-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="meetups">Meetups</TabsTrigger>
        </TabsList>
        
        {/* All Content Tab */}
        <TabsContent value="all">
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onCategorySelect={setSelectedCategory}
          />

          {isLoading ? (
            <ContentLoader />
          ) : (
            <>
              {/* Featured Events */}
              <div className="pb-6">
                <SectionHeader title="Featured Events" />
                <div className="space-y-4">
                  {featuredEvents.map(event => (
                    <EventCard key={event.id} event={event} featured />
                  ))}
                </div>
              </div>

              {/* Student Meetups */}
              <div className="pb-6">
                <SectionHeader title="Student Meetups" />
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
              <ContentLoader />
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
              <ContentLoader />
            ) : (
              meetups.map(meetup => (
                <MeetupCard key={meetup.id} meetup={meetup} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Navigation />
    </div>
  );
};

export default Index;
