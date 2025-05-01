import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MeetupsList from "@/components/meetups/MeetupsList";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import CreateMeetupForm from "@/components/meetups/CreateMeetupForm";
import { useMeetups } from "@/hooks/useMeetups";
import MapView from "@/components/MapView";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore } from "@/services/meetupService";
import { Meetup } from "@/types/meetup";

// The component
const Meetups = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "map">("list");
  const { allMeetups, isLoading, setAllMeetups } = useMeetups();
  const { joinedLobbies, attendedMeetups } = useUserStore();

  // Listen for meetup update events
  useEffect(() => {
    const handleMeetupUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ meetupId: string, updatedMeetup: Meetup }>;
      const { meetupId, updatedMeetup } = customEvent.detail;
      
      setAllMeetups(prev => 
        prev.map(meetup => 
          meetup.id === meetupId ? updatedMeetup : meetup
        )
      );
    };
    
    window.addEventListener('meetup-updated', handleMeetupUpdated as EventListener);
    
    return () => {
      window.removeEventListener('meetup-updated', handleMeetupUpdated as EventListener);
    };
  }, [setAllMeetups]);
  
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
          <h1 className="text-2xl font-bold">Student Meetups</h1>
          <p className="text-muted-foreground">Connect with fellow students and explore exciting UTD events</p>
        </div>
      </header>

      {/* Create Meetup Button */}
      <div className="px-4 pb-4">
        <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create New Meetup
        </Button>
      </div>

      {/* View Toggle */}
      <div className="px-4 pb-4">
        <Tabs defaultValue={view} className="w-full" onValueChange={setView}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Meetups List or Map */}
      <div className="px-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Loading meetups...</p>
        ) : view === "list" ? (
          <MeetupsList meetups={allMeetups} />
        ) : (
          <MapView meetups={allMeetups} />
        )}
      </div>

      {/* Create Meetup Dialog */}
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
