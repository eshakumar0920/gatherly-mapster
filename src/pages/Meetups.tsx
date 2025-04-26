
import { useState, useEffect } from "react";
import { Search, Plus, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useUserStore } from "@/services/meetupService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { categories } from "@/services/eventService";
import { useAuth } from "@/hooks/useAuth";
import CreateMeetupForm from "@/components/meetups/CreateMeetupForm";
import MeetupsList from "@/components/meetups/MeetupsList";
import { supabase } from "@/integrations/supabase/client";
import { meetups as mockMeetups } from "@/services/meetupService";
import { useToast } from "@/hooks/use-toast";
import { Meetup, EventRow } from "@/types/meetup";

const Meetups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allMeetups, setAllMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const { points, level } = useUserStore();
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadMeetups = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching meetups directly from Supabase...");
      
      // First try to get meetups from Supabase
      let query = supabase.from('events').select('*');
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching meetups from Supabase:", error);
        throw error;
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
        console.log("Fetched", realMeetups.length, "meetups from Supabase");
      } else {
        console.log("No meetups found in Supabase");
      }
      
      // Combine real meetups with mock meetups for development
      const filteredMockMeetups = selectedCategory 
        ? mockMeetups.filter(m => m.category?.toLowerCase() === selectedCategory.toLowerCase())
        : mockMeetups;
      
      const combined = [...realMeetups, ...filteredMockMeetups];
      console.log("Combined meetups (total count):", combined.length);
      
      setAllMeetups(combined);
    } catch (error) {
      console.error("Error fetching meetups:", error);
      // if Supabase query fails, show all mock meetups
      const filteredMockMeetups = selectedCategory 
        ? mockMeetups.filter(m => m.category?.toLowerCase() === selectedCategory.toLowerCase())
        : mockMeetups;
      
      setAllMeetups(filteredMockMeetups);
      toast({
        title: "Error loading meetups",
        description: "Could not load meetups from server. Showing sample meetups instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeetups();
  }, [selectedCategory]);

  const filteredMeetups = allMeetups.filter((m) => {
    if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCreateSuccess = async (newMeetup: any) => {
    setIsDialogOpen(false);
    try {
      console.log("Creating new meetup in Supabase:", newMeetup);
      
      // First create the meetup
      const { data: eventData, error: eventError } = await supabase.from('events').insert({
        title: newMeetup.title,
        description: newMeetup.description,
        location: newMeetup.location,
        event_date: newMeetup.event_date,
        category: newMeetup.category,
        creator_id: newMeetup.creator_id || 1,
        created_at: new Date().toISOString(),
        semester: "Spring 2025",
        xp_reward: newMeetup.xp_reward || 3,
        organizer_xp_reward: newMeetup.organizer_xp_reward || 5,
      }).select().single();
      
      if (eventError) {
        throw eventError;
      }

      // Then automatically add the creator as a participant
      const { error: participantError } = await supabase.from('participants').insert({
        event_id: eventData.id,
        user_id: newMeetup.creator_id || 1,
        joined_at: new Date().toISOString(),
        attendance_status: 'going'
      });

      if (participantError) {
        console.error("Error adding creator as participant:", participantError);
      }
      
      console.log("Meetup created successfully in Supabase:", eventData);
      
      toast({
        title: "Meetup created",
        description: "Your meetup has been created and you've been added to the lobby!",
      });
      
      // Immediately reload meetups to show the new one
      console.log("Reloading meetups after creation...");
      await loadMeetups();
      console.log("Meetups reloaded successfully");
    } catch (error) {
      console.error("Error creating meetup:", error);
      toast({
        title: "Error creating meetup",
        description: "Could not create the meetup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMeetupClick = (meetupId: string) => {
    navigate(`/meetups/${meetupId}`);
  };

  return (
    <div className="pb-20">
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      <header className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Meetups</h1>
          <p className="text-muted-foreground">Find student-organized meetups</p>
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

      <div className="px-4 pb-4">
        <Tabs defaultValue="all" onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="px-4 pb-4">
        <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create New Meetup
        </Button>
      </div>

      <div className="px-4">
        <MeetupsList
          meetups={filteredMeetups}
          isLoading={isLoading}
          onMeetupClick={handleMeetupClick}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Meetup</DialogTitle>
          </DialogHeader>
          <CreateMeetupForm
            onSuccess={handleCreateSuccess}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
};

export default Meetups;
