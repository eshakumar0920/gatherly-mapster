
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "@/components/EventCard";
import MeetupCard from "@/components/MeetupCard";
import Navigation from "@/components/Navigation";
import { FlaskMeetup, useMeetupService, useEventService } from "@/services/flaskService";
import AppHeader from "@/components/home/AppHeader";
import CategoryFilter from "@/components/home/CategoryFilter";
import SectionHeader from "@/components/home/SectionHeader";
import ContentLoader from "@/components/home/ContentLoader";
import { events as mockEvents } from "@/services/eventService";
import { meetups as mockMeetups } from "@/services/meetupService";

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
  const [meetups, setMeetups] = useState<FlaskMeetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Use our Flask services
  const { fetchMeetups } = useMeetupService();
  const { searchEvents } = useEventService();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Try to fetch real data, fall back to mock data if it fails
      try {
        let meetupsData;
        try {
          meetupsData = await fetchMeetups();
          if (meetupsData && Array.isArray(meetupsData) && meetupsData.length > 0) {
            setMeetups(meetupsData);
          } else {
            console.log("Using mock meetups data due to empty response");
            setMeetups(mockMeetups);
          }
        } catch (error) {
          console.log("Failed to fetch meetups from API, using mock data");
          setMeetups(mockMeetups);
        }
        
        let eventsData;
        try {
          eventsData = await searchEvents({});
          if (eventsData && Array.isArray(eventsData) && eventsData.length > 0) {
            setFeaturedEvents(eventsData);
          } else {
            console.log("Using mock events data due to empty response");
            setFeaturedEvents(mockEvents);
          }
        } catch (error) {
          console.log("Failed to fetch events from API, using mock data");
          setFeaturedEvents(mockEvents);
        }
      } catch (error) {
        console.error("General error in data fetching:", error);
        // Set mock data as fallback
        setFeaturedEvents(mockEvents);
        setMeetups(mockMeetups);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [fetchMeetups, searchEvents, toast]);

  // Filter events and meetups based on selected category
  const filteredEvents = selectedCategory && Array.isArray(featuredEvents)
    ? featuredEvents.filter(event => event.category?.toLowerCase() === selectedCategory.toLowerCase())
    : featuredEvents;

  const filteredMeetups = selectedCategory && Array.isArray(meetups)
    ? meetups.filter(meetup => meetup.category?.toLowerCase() === selectedCategory.toLowerCase())
    : meetups;

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
                {Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
                  <div className="space-y-4">
                    {filteredEvents.map(event => (
                      <EventCard key={event.id} event={event} featured />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No events found in this category</p>
                )}
              </div>

              {/* Student Meetups */}
              <div className="pb-6">
                <SectionHeader title="Student Meetups" />
                {Array.isArray(filteredMeetups) && filteredMeetups.length > 0 ? (
                  <div className="space-y-4">
                    {filteredMeetups.slice(0, 3).map(meetup => (
                      <MeetupCard key={meetup.id} meetup={meetup} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No meetups found in this category</p>
                )}
              </div>
            </>
          )}
        </TabsContent>
        
        {/* Events Tab */}
        <TabsContent value="events">
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onCategorySelect={setSelectedCategory}
          />
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Campus Events</h2>
            {isLoading ? (
              <ContentLoader />
            ) : Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard key={event.id} event={event} featured />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No events found in this category</p>
            )}
          </div>
        </TabsContent>
        
        {/* Meetups Tab */}
        <TabsContent value="meetups">
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onCategorySelect={setSelectedCategory}
          />
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Student Meetups</h2>
            {isLoading ? (
              <ContentLoader />
            ) : Array.isArray(filteredMeetups) && filteredMeetups.length > 0 ? (
              filteredMeetups.map(meetup => (
                <MeetupCard key={meetup.id} meetup={meetup} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No meetups found in this category</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Navigation />
    </div>
  );
};

export default Index;
