
import { useState } from "react";
import { Search, Plus, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { getMeetups, useUserStore } from "@/services/meetupService";
import { useToast } from "@/components/ui/use-toast";
import MeetupCard from "@/components/MeetupCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dateTime: z.string().min(3, "Date and time is required"),
  location: z.string().min(3, "Location is required"),
});

const Meetups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const allMeetups = getMeetups();
  const { points, level, attendMeetup, attendedMeetups } = useUserStore();
  const { toast } = useToast();

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      dateTime: "",
      location: "",
    },
  });

  const filteredMeetups = allMeetups.filter(meetup => {
    // Filter by search query
    if (searchQuery && !meetup.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleAttendMeetup = (meetupId: string, points: number) => {
    if (attendedMeetups.includes(meetupId)) {
      toast({
        title: "Already attending",
        description: "You're already signed up for this meetup",
        variant: "destructive",
      });
      return;
    }

    attendMeetup(meetupId, points);
    
    const newLevel = Math.floor((useUserStore.getState().points) / 10) + 1;
    if (newLevel > level) {
      toast({
        title: "Level up!",
        description: `Congratulations! You've reached level ${newLevel}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Points added",
        description: `You earned ${points} points for joining this meetup`,
        variant: "default",
      });
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // In a real app, this would send the data to a backend
    // For now, we'll just show a toast
    toast({
      title: "Meetup created!",
      description: "Your meetup has been successfully created.",
    });
    
    // Close the dialog
    setIsDialogOpen(false);
    
    // Reset the form
    form.reset();
  };

  return (
    <div className="pb-20">
      {/* App Name */}
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Meetups</h1>
          <p className="text-muted-foreground">Find student-organized meetups</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-primary/10 px-2 py-1 rounded-full">
            <Star className="h-4 w-4 text-primary mr-1" />
            <span className="font-medium">{points} pts</span>
          </div>
          <div className="px-2 py-1 bg-primary/20 rounded-full">
            <span className="font-medium">Level {level}</span>
          </div>
        </div>
      </header>

      {/* Search bar */}
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

      {/* Create Meetup Button */}
      <div className="px-4 pb-4">
        <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create New Meetup
        </Button>
      </div>

      {/* Meetups List */}
      <div className="px-4">
        <div className="space-y-4">
          {filteredMeetups.map(meetup => (
            <MeetupCard key={meetup.id} meetup={meetup} />
          ))}
        </div>
      </div>

      {/* Create Meetup Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Meetup</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Chess at the Student Union" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Looking for chess partners at the Student Union. All skill levels welcome!"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input placeholder="Today @2pm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Student Union" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" className="w-full">Create Meetup</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Meetups;
