
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
import { useMeetups } from "@/hooks/useMeetups";

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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Use our Flask services
  const { fetchMeetups } = useMeetupService();
  const { searchEvents } = useEventService();
  
  // Use the consistent meetups hook for category filtering
  const { allMeetups: meetups, isLoading: isMeetupsLoading } = useMeetups(selectedCategory);

  // Fetch events data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const eventsData = await searchEvents({});
        // Ensure eventsData is always an array
        setFeaturedEvents(Array.isArray(eventsData) ? eventsData : []);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description: "Could not load data, please try again later",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [searchEvents, toast]);

  // Filter events based on selected category
  const filteredEvents = selectedCategory && Array.isArray(featuredEvents)
    ? featuredEvents.filter(event => {
        const eventCategory = event.category?.toLowerCase() || '';
        const filterCategory = selectedCategory.toLowerCase();
        return eventCategory === filterCategory;
      })
    : featuredEvents;

  // Log for debugging
  console.log("Home page - Current category filter:", selectedCategory);
  console.log("Home page - Available meetups:", meetups);
  console.log("Home page - Available events:", filteredEvents);

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

          {isLoading || isMeetupsLoading ? (
            <ContentLoader />
          ) : (
            <>
              {/* Featured Events */}
              <div className="pb-6">
                <SectionHeader title="Featured Events" />
                {filteredEvents.length > 0 ? (
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
                {meetups.length > 0 ? (
                  <div className="space-y-4">
                    {meetups.slice(0, 3).map(meetup => (
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
            ) : filteredEvents.length > 0 ? (
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
            {isMeetupsLoading ? (
              <ContentLoader />
            ) : meetups.length > 0 ? (
              meetups.map(meetup => (
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
