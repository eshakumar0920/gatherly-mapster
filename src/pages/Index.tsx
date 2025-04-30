
import { useState, useEffect } from "react";
import { Search, Plus, X, Star } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import MeetupCard from "@/components/MeetupCard";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { categories } from "@/services/eventService";
import { useUserStore } from "@/services/meetupService";
import ContentLoader from "@/components/home/ContentLoader";
import CreateMeetupForm from "@/components/meetups/CreateMeetupForm";

// APIs
import { eventsApi } from "@/services/api";
import { useMeetups } from "@/hooks/useMeetups";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Mock data for fallback
import { events as mockEvents } from "@/services/eventService";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { points, level, setUserId } = useUserStore();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Pass the selectedCategory to the hook for filtering at the database level
  const { allMeetups, isLoading: isMeetupsLoading, setAllMeetups } = useMeetups(selectedCategory);

  // Fetch user ID if logged in
  useEffect(() => {
    const fetchUserId = async () => {
      if (user?.email) {
        const { data, error } = await supabase
          .from('users')
          .select('id, current_xp, current_level')
          .eq('email', user.email)
          .single();
          
        if (!error && data) {
          setUserId(data.id.toString());
        }
      }
    };
    
    fetchUserId();
  }, [user, setUserId]);

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      setIsEventsLoading(true);
      try {
        // searchEvents endpoint returns { data: Event[] } or throws
        const response = await eventsApi.searchEvents({ 
          query: searchQuery,
          // Fix: Only add category if it's not null
          ...(selectedCategory ? { category: selectedCategory } : {})
        });
        
        // if your API returns { data: [...] }
        const eventArray = Array.isArray(response.data) ? response.data : [];
        if (eventArray.length > 0) {
          setFeaturedEvents(eventArray);
        } else {
          console.log("Using mock events (empty array from API)");
          
          // Filter mock events based on search and category
          let filteredMockEvents = mockEvents;
          
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredMockEvents = filteredMockEvents.filter(event => 
              event.title.toLowerCase().includes(query) || 
              event.description.toLowerCase().includes(query)
            );
          }
          
          if (selectedCategory) {
            filteredMockEvents = filteredMockEvents.filter(event => 
              event.category.toLowerCase() === selectedCategory.toLowerCase()
            );
          }
          
          setFeaturedEvents(filteredMockEvents);
        }
      } catch (err) {
        console.log("Failed to fetch events from API, falling back to mock", err);
        
        // Filter mock events based on search and category
        let filteredMockEvents = mockEvents;
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredMockEvents = filteredMockEvents.filter(event => 
            event.title.toLowerCase().includes(query) || 
            event.description.toLowerCase().includes(query)
          );
        }
        
        if (selectedCategory) {
          filteredMockEvents = filteredMockEvents.filter(event => 
            event.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
        
        setFeaturedEvents(filteredMockEvents);
      } finally {
        setIsEventsLoading(false);
      }
    };
    
    fetchEvents();
  }, [searchQuery, selectedCategory]);

  // Filter meetups by search query (client-side)
  const filteredMeetups = allMeetups.filter(meetup => {
    if (searchQuery && !meetup.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleMeetupClick = (meetupId: string) => {
    navigate(`/meetups/${meetupId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <div className="pb-20">
      {/* App Name */}
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      {/* Header - Updated with welcome message and exclamation mark */}
      <header className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome to impulse!</h1>
          <p className="text-muted-foreground">Discover exciting UTD events and connect with fellow students</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-full">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="font-medium">{points} pts</span>
          </div>
          <div className="px-2 py-1 bg-yellow-500/20 rounded-full">
            <span className="font-medium">Level {level}</span>
          </div>
        </div>
      </header>

      {/* Search bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search events & meetups..." 
            className="pl-10 rounded-full bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Clear filters button - only show when filters are applied */}
      {(searchQuery || selectedCategory) && (
        <div className="px-4 pb-4">
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        </div>
      )}

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full px-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="meetups">Meetups</TabsTrigger>
        </TabsList>

        {/* Categories Tabs */}
        <div className="pb-4">
          <Tabs defaultValue="all" value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id.toLowerCase()}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* All Tab */}
        <TabsContent value="all">
          {(isMeetupsLoading || isEventsLoading) ? (
            <ContentLoader message="Loading content..." />
          ) : (
            <>
              {/* Events Section - Now first */}
              <div className="pb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Featured Events</h2>
                  <Button variant="link" className="text-sm p-0" onClick={() => navigate('/events')}>
                    See all
                  </Button>
                </div>
                
                {featuredEvents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {featuredEvents.slice(0, 3).map(event => (
                      <div key={event.id} onClick={() => handleEventClick(event.id)} className="cursor-pointer">
                        <EventCard event={event} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No events found in this category
                  </p>
                )}
              </div>

              {/* Meetups Section - Now second */}
              <div className="pb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Student Meetups</h2>
                  <Button variant="link" className="text-sm p-0" onClick={() => navigate('/meetups')}>
                    See all
                  </Button>
                </div>

                <div className="pb-4">
                  <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Create New Meetup
                  </Button>
                </div>

                {filteredMeetups.length > 0 ? (
                  <div className="space-y-4">
                    {filteredMeetups.slice(0, 3).map(meetup => (
                      <div 
                        key={meetup.id} 
                        onClick={() => handleMeetupClick(meetup.id)}
                        className="cursor-pointer"
                      >
                        <MeetupCard meetup={meetup} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No meetups found in this category
                  </p>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          {isEventsLoading ? (
            <ContentLoader message="Loading events..." />
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {featuredEvents.map(event => (
                <div key={event.id} onClick={() => handleEventClick(event.id)} className="cursor-pointer">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events found matching your criteria.</p>
              <button 
                onClick={clearFilters}
                className="mt-4 text-sm text-foreground hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </TabsContent>

        {/* Meetups Tab */}
        <TabsContent value="meetups">
          <div className="pb-4">
            <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create New Meetup
            </Button>
          </div>

          {isMeetupsLoading ? (
            <ContentLoader message="Loading meetups..." />
          ) : filteredMeetups.length > 0 ? (
            <div className="space-y-4">
              {filteredMeetups.map(meetup => (
                <div 
                  key={meetup.id} 
                  onClick={() => handleMeetupClick(meetup.id)}
                  className="cursor-pointer"
                >
                  <MeetupCard meetup={meetup} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No meetups found matching your criteria.</p>
              <button 
                onClick={clearFilters}
                className="mt-4 text-sm text-foreground hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Meetup</DialogTitle>
          </DialogHeader>
          <CreateMeetupForm 
            onSuccess={(newMeetups) => {
              setAllMeetups(prev => Array.isArray(newMeetups) ? [...newMeetups, ...prev] : [...prev, newMeetups]);
              setIsDialogOpen(false);
            }}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
};

export default Index;
