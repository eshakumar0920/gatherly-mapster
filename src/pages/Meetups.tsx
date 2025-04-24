
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
import { meetupsApi } from "@/services/api";
import { meetups as mockMeetups } from "@/services/meetupService";
import { useToast } from "@/hooks/use-toast";

const Meetups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allMeetups, setAllMeetups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { points, level } = useUserStore();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const loadMeetups = async () => {
    setIsLoading(true);
    try {
      console.log("Loading meetups...");
      const response = await meetupsApi.getAllMeetups();
      console.log("API response for meetups:", response);
      const real = response.data || [];
      
      // always append first 3 mocks
      const combined = [...real, ...mockMeetups.slice(0, 3)];
      console.log("Combined meetups:", combined);
      setAllMeetups(combined);
    } catch (err) {
      console.error("Error fetching meetups:", err);
      // if API fails, show just the 3 mocks
      setAllMeetups(mockMeetups.slice(0, 3));
      toast({
        title: "Error fetching meetups",
        description: "Couldn't load meetups from the server",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeetups();
  }, []);

  const filteredMeetups = allMeetups.filter((m) => {
    const titleMatch = !searchQuery || 
      (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const categoryMatch = !selectedCategory || selectedCategory === "all" ||
      (m.category && m.category.toLowerCase() === selectedCategory.toLowerCase());
    
    return titleMatch && categoryMatch;
  });

  const handleCreateSuccess = async (newMeetup: any) => {
    setIsDialogOpen(false);
    try {
      console.log("Creating meetup:", newMeetup);
      const response = await meetupsApi.createMeetup(newMeetup);
      console.log("Meetup creation response:", response);
      
      toast({
        title: "Meetup created",
        description: "Your meetup has been created successfully",
      });
      // Reload meetups after creating a new one
      console.log("Reloading meetups after creation");
      await loadMeetups();
    } catch (err) {
      console.error("Error creating meetup:", err);
      toast({
        title: "Error creating meetup",
        description: "There was an error creating your meetup",
        variant: "destructive"
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
