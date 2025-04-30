
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventRow, Meetup } from "@/types/meetup";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { pointClassifications } from "@/services/types";
import { campusLocations, findLocationByName } from "@/utils/campusLocations";

export const useMeetups = (selectedCategory: string | null = null) => {
  const [allMeetups, setAllMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Helper function to calculate points based on lobby size
  const getPointsForLobbySize = (lobbySize: number): number => {
    const classification = pointClassifications.find(
      c => lobbySize >= c.minSize && lobbySize <= c.maxSize
    );
    return classification ? classification.basePoints : pointClassifications[0].basePoints;
  };

  // Helper function to get accurate coordinates for a location
  const getLocationCoordinates = (locationName: string) => {
    const matchedLocation = findLocationByName(locationName);
    if (matchedLocation) {
      console.log(`Found coordinates for "${locationName}": ${matchedLocation.name} (${matchedLocation.lat}, ${matchedLocation.lng})`);
      return { lat: matchedLocation.lat, lng: matchedLocation.lng };
    }
    
    // Default to library if no match found
    const defaultLocation = campusLocations.find(loc => loc.id === "library");
    if (defaultLocation) {
      console.log(`No match found for "${locationName}", defaulting to Library: (${defaultLocation.lat}, ${defaultLocation.lng})`);
      return { lat: defaultLocation.lat, lng: defaultLocation.lng };
    }
    
    return { lat: 32.9886, lng: -96.7491 }; // UTD center coordinates as last resort
  };

  useEffect(() => {
    const fetchMeetups = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let query = supabase.from('events').select('*');
        
        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }
        
        const { data, error: supabaseError } = await query;
        
        if (supabaseError) {
          console.error("Error fetching meetups:", supabaseError);
          setError(new Error(supabaseError.message));
          toast({
            title: "Error fetching meetups",
            description: "Could not load meetups from the database.",
            variant: "destructive"
          });
          setAllMeetups([]);
          return;
        }
        
        if (data && data.length > 0) {
          const eventRows = data as unknown as EventRow[];
          const meetups: Meetup[] = eventRows.map(event => {
            const lobbySize = event.lobby_size || 5;
            
            // Determine coordinates - use stored coordinates if available, otherwise find them based on location name
            let latitude = event.latitude;
            let longitude = event.longitude;
            
            if ((!latitude || !longitude || latitude === 0 || longitude === 0) && event.location) {
              const coords = getLocationCoordinates(event.location);
              latitude = coords.lat;
              longitude = coords.lng;
              console.log(`Using matched coordinates for "${event.location}": (${latitude}, ${longitude})`);
            }
            
            return {
              id: event.id.toString(),
              title: event.title,
              description: event.description || "No description available",
              dateTime: formatEventDate(event.event_date),
              location: event.location,
              points: getPointsForLobbySize(lobbySize),
              createdBy: event.creator_name || "Anonymous",
              creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
              lobbySize: lobbySize,
              category: event.category || "Other",
              attendees: [],
              latitude: latitude,
              longitude: longitude
            };
          });
          
          setAllMeetups(meetups);
        } else {
          setAllMeetups([]);
          toast({
            title: "No meetups found",
            description: "Try creating a new meetup!",
          });
        }
      } catch (error) {
        console.error("Error in fetching meetups:", error);
        setError(error as Error);
        setAllMeetups([]);
        
        toast({
          title: "Connection error",
          description: "Could not connect to the database",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeetups();
  }, [selectedCategory, toast]);

  // Helper function to handle date formatting safely
  const formatEventDate = (dateString: string): string => {
    try {
      // Check if it's already a formatted date string
      if (dateString.includes('@') || dateString.includes('/')) {
        return dateString;
      }
      
      // Try to parse as ISO date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, "MMM d, yyyy h:mm a");
      }
      
      // Return the original if we can't parse it
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const createMeetup = async (meetupData: Partial<Meetup>, userId: string, userName: string): Promise<Meetup | null> => {
    try {
      const lobbySize = meetupData.lobbySize || 5;
      const points = getPointsForLobbySize(lobbySize);
      
      // Make sure we have coordinates - use provided coordinates or find them based on location name
      let latitude = meetupData.latitude;
      let longitude = meetupData.longitude;
      
      if ((!latitude || !longitude || latitude === 0 || longitude === 0) && meetupData.location) {
        // Find exact match from our predefined locations
        const matchedLocation = findLocationByName(meetupData.location);
        
        if (matchedLocation) {
          latitude = matchedLocation.lat;
          longitude = matchedLocation.lng;
          console.log(`Using exact location coordinates for "${meetupData.location}": (${latitude}, ${longitude})`);
        } else {
          // Fallback to library as default location
          const defaultLocation = campusLocations.find(loc => loc.id === "library");
          if (defaultLocation) {
            latitude = defaultLocation.lat;
            longitude = defaultLocation.lng;
            console.log(`No match found for "${meetupData.location}", using library coordinates: (${latitude}, ${longitude})`);
          }
        }
      }
      
      console.log("Creating meetup with coordinates:", { latitude, longitude, location: meetupData.location });
      
      const { data, error } = await supabase.from('events').insert({
        title: meetupData.title,
        description: meetupData.description,
        location: meetupData.location,
        event_date: meetupData.dateTime,
        creator_id: parseInt(userId),
        creator_name: userName,
        created_at: new Date().toISOString(),
        semester: "Spring 2025",
        xp_reward: points,
        organizer_xp_reward: 5,
        category: meetupData.category,
        lobby_size: lobbySize,
        latitude: latitude,
        longitude: longitude
      }).select().single();

      if (error) {
        console.error("Error creating meetup:", error);
        toast({
          title: "Error creating meetup",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      if (!data) {
        toast({
          title: "Error creating meetup",
          description: "No data returned from database",
          variant: "destructive"
        });
        return null;
      }
      
      const eventRow = data as unknown as EventRow;
      const newMeetup: Meetup = {
        id: eventRow.id.toString(),
        title: eventRow.title,
        description: eventRow.description || "No description available",
        dateTime: formatEventDate(eventRow.event_date),
        location: eventRow.location,
        points: points,
        createdBy: eventRow.creator_name || userName,
        creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
        lobbySize: eventRow.lobby_size || 5,
        category: eventRow.category || "Other",
        attendees: [],
        latitude: eventRow.latitude,
        longitude: eventRow.longitude
      };
      
      setAllMeetups(prev => [newMeetup, ...prev]);
      
      toast({
        title: "Meetup created!",
        description: "Your meetup has been successfully created.",
      });
      
      return newMeetup;
    } catch (error) {
      console.error("Error in meetup creation:", error);
      toast({
        title: "Error creating meetup",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    }
  };

  const joinMeetupLobby = async (meetupId: string, userId: string): Promise<boolean> => {
    try {
      // First check if user is already in the lobby
      const { data: existingParticipant, error: checkError } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', parseInt(meetupId))
        .eq('user_id', parseInt(userId))
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error("Error checking participant:", checkError);
        return false;
      }
      
      // If participant already exists, don't add again
      if (existingParticipant) {
        toast({
          title: "Already joined",
          description: "You've already joined this meetup lobby.",
        });
        return true;
      }
      
      // Insert participant
      const { error } = await supabase.from('participants').insert({
        event_id: parseInt(meetupId),
        user_id: parseInt(userId),
        joined_at: new Date().toISOString(),
        attendance_status: 'registered'
      });
      
      if (error) {
        console.error("Error joining meetup lobby:", error);
        toast({
          title: "Error joining lobby",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Joined lobby",
        description: "You've joined the meetup lobby. Don't forget to check in when you attend to earn points!",
      });
      
      return true;
    } catch (error) {
      console.error("Error joining meetup lobby:", error);
      toast({
        title: "Error joining lobby",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  const checkInToMeetup = async (meetupId: string, userId: string): Promise<boolean> => {
    try {
      // Find the meetup to get its points value based on lobby size
      const meetup = allMeetups.find(m => m.id === meetupId);
      const pointsToAward = meetup ? meetup.points : 3;

      // Update participant status to attended
      const { error } = await supabase
        .from('participants')
        .update({ 
          attendance_status: 'attended',
          xp_earned: pointsToAward // Use the points based on lobby size
        })
        .eq('event_id', parseInt(meetupId))
        .eq('user_id', parseInt(userId));
      
      if (error) {
        console.error("Error checking in to meetup:", error);
        toast({
          title: "Error checking in",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Check-in successful!",
        description: `You've checked in to this meetup and earned ${pointsToAward} points!`,
      });
      
      return true;
    } catch (error) {
      console.error("Error checking in to meetup:", error);
      toast({
        title: "Error checking in",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  return { 
    allMeetups, 
    isLoading, 
    error,
    setAllMeetups,
    createMeetup,
    joinMeetupLobby,
    checkInToMeetup 
  };
};
