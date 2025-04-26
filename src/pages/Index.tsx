
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "@/components/EventCard";
import MeetupCard from "@/components/MeetupCard";
import Navigation from "@/components/Navigation";
import AppHeader from "@/components/home/AppHeader";
import CategoryFilter from "@/components/home/CategoryFilter";
import SectionHeader from "@/components/home/SectionHeader";
import ContentLoader from "@/components/home/ContentLoader";

// Mock data
import { events as mockEvents } from "@/services/eventService";
import { meetups as mockMeetups } from "@/services/meetupService";

// Centralized API
import { eventsApi } from "@/services/api";
import { useMeetupService, FlaskMeetup } from "@/services/flaskService";

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

  // old hook to fetch meetups (you could eventually replace with meetupsApi)
  const { fetchMeetups } = useMeetupService();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // 1️⃣ Fetch Meetups
      try {
        const meetupsData = await fetchMeetups();
        if (Array.isArray(meetupsData) && meetupsData.length > 0) {
          setMeetups(meetupsData);
        } else {
          console.log("Using mock meetups (empty array from API)");
          setMeetups(mockMeetups);
        }
      } catch (err) {
        console.log("Failed to fetch meetups from API, falling back to mock", err);
        setMeetups(mockMeetups);
      }

      // 2️⃣ Fetch Events
      try {
        // searchEvents endpoint returns { data: Event[] } or throws
        const response = await eventsApi.searchEvents({ query: "" });
        // if your API returns { data: [...] }
        const eventArray = Array.isArray(response.data) ? response.data : [];
        if (eventArray.length > 0) {
          setFeaturedEvents(eventArray);
        } else {
          console.log("Using mock events (empty array from API)");
          setFeaturedEvents(mockEvents);
        }
      } catch (err) {
        console.log("Failed to fetch events from API, falling back to mock", err);
        setFeaturedEvents(mockEvents);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [fetchMeetups]);

  // apply category filter
  const filteredEvents = selectedCategory
    ? featuredEvents.filter(e => e.category?.toLowerCase() === selectedCategory.toLowerCase())
    : featuredEvents;

  const filteredMeetups = selectedCategory
    ? meetups.filter(m => m.category?.toLowerCase() === selectedCategory.toLowerCase())
    : meetups;

  return (
    <div className="pb-20">
      <AppHeader />

      <Tabs defaultValue="all" className="w-full px-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="meetups">Meetups</TabsTrigger>
        </TabsList>

        {/* All */}
        <TabsContent value="all">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />

          {isLoading ? (
            <ContentLoader />
          ) : (
            <>
              <div className="pb-6">
                <SectionHeader title="Featured Events" />
                {filteredEvents.length > 0 ? (
                  filteredEvents.map(e => <EventCard key={e.id} event={e} featured />)
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No events found in this category
                  </p>
                )}
              </div>

              <div className="pb-6">
                <SectionHeader title="Student Meetups" />
                {filteredMeetups.length > 0 ? (
                  filteredMeetups.slice(0, 3).map(m => (
                    <MeetupCard key={m.id} meetup={m} />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No meetups found in this category
                  </p>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* Events */}
        <TabsContent value="events">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
          {isLoading ? (
            <ContentLoader />
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map(e => <EventCard key={e.id} event={e} featured />)
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No events found in this category
            </p>
          )}
        </TabsContent>

        {/* Meetups */}
        <TabsContent value="meetups">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
          {isLoading ? (
            <ContentLoader />
          ) : filteredMeetups.length > 0 ? (
            filteredMeetups.map(m => <MeetupCard key={m.id} meetup={m} />)
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No meetups found in this category
            </p>
          )}
        </TabsContent>
      </Tabs>

      <Navigation />
    </div>
  );
};

export default Index;
