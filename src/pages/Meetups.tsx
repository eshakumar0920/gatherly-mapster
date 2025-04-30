
import { useState, useEffect } from "react";
import { Search, Plus, Star, MapPin } from "lucide-react";
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
import { useMeetups } from "@/hooks/useMeetups";
import { useLeveling } from "@/hooks/useLeveling";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Meetups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localPoints, setLocalPoints] = useState(0);
  const [localLevel, setLocalLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { points, level, setUserId, userId } = useUserStore();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  
  // Use local state for UI to prevent flickering
  useEffect(() => {
    if (points !== undefined) setLocalPoints(points);
    if (level !== undefined) setLocalLevel(level);
  }, [points, level]);
  
  // Pass the selectedCategory to the hook for filtering at the database level
  const { 
    allMeetups, 
    isLoading: isMeetupsLoading, 
    setAllMeetups,
    error: meetupsError
  } = useMeetups(selectedCategory);
  
  const { pointClassifications } = useLeveling();

  // Fetch user ID if logged in - with error handling
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserId = async () => {
      // If userId is already set, no need to fetch again
      if (userId) {
        setIsLoading(false);
        return;
      }

      if (!user?.email) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching user ID for email:", user.email);
        
        const { data, error } = await supabase
          .from('users')
          .select('id, current_xp, current_level')
          .eq('email', user.email)
          .single();
          
        if (error && isMounted) {
          console.error("Error fetching user ID:", error);
          toast({
            title: "Error loading profile",
            description: "Please try refreshing the page",
            variant: "destructive"
          });
          
          // Still proceed, even with error
          setIsLoading(false);
        } else if (data && isMounted) {
          console.log("Found user data:", data);
          if (data.id) {
            await setUserId(data.id.toString());
          }
        } else if (isMounted) {
          console.log("No user found for email:", user.email);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Exception fetching user ID:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    if (isLoggedIn) {
      fetchUserId();
    } else {
      setIsLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, setUserId, userId, isLoggedIn, toast]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : value);
  };

  // Further filter by search term client-side
  const filteredMeetups = allMeetups.filter(meetup => {
    if (searchQuery && !meetup.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleMeetupClick = (meetupId: string) => {
    navigate(`/meetups/${meetupId}`);
  };

  // View on map functionality
  const handleViewOnMap = () => {
    navigate("/maps");
  };

  // If the loading takes too long (more than 5 seconds), show a retry button
  const [showRetry, setShowRetry] = useState(false);
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowRetry(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading]);

  // Handle error display or excessive loading time
  if (meetupsError || (showRetry && isLoading)) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">
          {meetupsError ? "Error loading meetups" : "Loading is taking longer than expected"}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
        <Navigation />
      </div>
    );
  }

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
            <span className="font-medium">{localPoints} pts</span>
          </div>
          <div className="px-2 py-1 bg-yellow-500/20 rounded-full">
            <span className="font-medium">Level {localLevel}</span>
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
        <Tabs defaultValue="all" onValueChange={handleCategoryChange} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-4">
        <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create New Meetup
        </Button>
        
        <Button variant="outline" className="w-full" onClick={handleViewOnMap}>
          <MapPin className="h-4 w-4 mr-2" /> View All Meetups on Map
        </Button>
      </div>

      <div className="px-4">
        <MeetupsList 
          meetups={filteredMeetups}
          isLoading={isLoading || isMeetupsLoading}
          onMeetupClick={handleMeetupClick}
          showPointsClassification={true}
        />
      </div>

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

export default Meetups;
