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
import { supabase } from "@/integrations/supabase/client";

// Mock data
import { events as mockEvents } from "@/services/eventService";
import { meetups as mockMeetups } from "@/services/meetupService";
import { Meetup, EventRow } from "@/types/meetup";

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // 1️⃣ Fetch Meetups directly from Supabase
      try {
        console.log("Fetching meetups for home page from Supabase...");
        
        // Query the events table
        const { data, error } = await supabase.from('events').select('*');
        
        if (error) {
          console.error("Supabase error:", error);
          throw new Error(error.message);
        }
        
        // Convert Supabase data to our Meetup type
        let realMeetups: Meetup[] = [];
        if (data && data.length > 0) {
          const eventRows = data as unknown as EventRow[];
          realMeetups = eventRows.map(event => ({
            id: event.id.toString(),
            title: event.title,
            description: event.description || "No description available",
            dateTime: new Date(event.event_date).toISOString(),
            location: event.location,
            points: event.xp_reward || 3,
            createdBy: "Student",
            creatorAvatar: undefined,
            lobbySize: 5,
            category: event.category || "Other",
            attendees: []
          }));
          console.log("Home page - Real meetups from Supabase:", realMeetups.length);
        } else {
          console.log("No meetups found in Supabase");
        }
        
        // Use all mock meetups, but prioritize real data
        const combined = [...realMeetups, ...mockMeetups];
        console.log("Combined meetups on home page (total count):", combined.length);
        setMeetups(combined);
      } catch (err) {
        console.error("Failed to fetch meetups from Supabase, falling back to mock", err);
        setMeetups(mockMeetups);
        toast({
          title: "Error loading meetups",
          description: "Could not load meetups from server. Showing sample meetups instead.",
          variant: "destructive",
        });
      }

      // 2️⃣ For Events, we'll keep the existing logic for now
      try {
        // In a real app, you would fetch events from Supabase too
        // For now, we'll use the mock events
        setFeaturedEvents(mockEvents);
      } catch (err) {
        console.error("Failed to fetch events, falling back to mock", err);
        setFeaturedEvents(mockEvents);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [toast, selectedCategory]);

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
