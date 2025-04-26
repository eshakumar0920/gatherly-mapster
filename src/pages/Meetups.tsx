
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
  const { toast } = useToast();

  const { points, level } = useUserStore();
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadMeetups = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching meetups...");
      const response = await meetupsApi.getAllMeetups();
      console.log("Meetups API response:", response);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Use real data when available, fallback to mock data
      const realMeetups = response.data || [];
      console.log("Real meetups from API:", realMeetups);
      
      // Combine real meetups with mock meetups
      const combined = [...realMeetups, ...mockMeetups];
      console.log("Combined meetups (total count):", combined.length);
      
      setAllMeetups(combined);
    } catch (error) {
      console.error("Error fetching meetups:", error);
      // if API fails, show all mock meetups
      setAllMeetups(mockMeetups);
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
  }, []);

  const filteredMeetups = allMeetups.filter((m) => {
    if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory && selectedCategory !== "all") {
      return m.category?.toLowerCase() === selectedCategory.toLowerCase();
    }
    return true;
  });

  const handleCreateSuccess = async (newMeetup: any) => {
    setIsDialogOpen(false);
    try {
      console.log("Creating new meetup:", newMeetup);
      const createResponse = await meetupsApi.createMeetup(newMeetup);
      console.log("Create meetup response:", createResponse);
      
      if (createResponse.error) {
        throw new Error(createResponse.error);
      }
      
      toast({
        title: "Meetup created",
        description: "Your meetup has been created successfully!",
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
