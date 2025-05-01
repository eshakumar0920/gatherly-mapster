import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventRow, Meetup } from "@/types/meetup";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { pointClassifications } from "@/services/types";
import { campusLocations, findLocationByName } from "@/utils/campusLocations";
import { useUserStore } from "@/services/meetupService";

export const useMeetups = (selectedCategory: string | null = null) => {
  const [allMeetups, setAllMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { avatar } = useUserStore(); // Get user's selected avatar
  
  // Helper function to calculate points based on lobby size
  const getPointsForLobbySize = (lobbySize: number): number => {
    const classification = pointClassifications.find(
      c => lobbySize >= c.minSize && lobbySize <= c.maxSize
    );
    return classification ? classification.basePoints : pointClassifications[0].basePoints;
  };

  // Helper function to get accurate coordinates for a location
  const getLocationCoordinates = (locationName: string) => {
    console.log("UseMeetups: Getting coordinates for location:", locationName);
    
    // Check for "The Plinth" directly with different variations
    if (locationName.toLowerCase().includes("plinth")) {
      const plinth = campusLocations.find(loc => loc.id === "plinth");
      if (plinth) {
        console.log(`UseMeetups: Found direct plinth match for "${locationName}": ${plinth.name} (${plinth.lat}, ${plinth.lng})`);
        return { lat: plinth.lat, lng: plinth.lng };
      }
    }
    
    const matchedLocation = findLocationByName(locationName);
    if (matchedLocation) {
      console.log(`UseMeetups: Found coordinates for "${locationName}": ${matchedLocation.name} (${matchedLocation.lat}, ${matchedLocation.lng})`);
      return { lat: matchedLocation.lat, lng: matchedLocation.lng };
    }
    
    // Default to library if no match found
    const defaultLocation = campusLocations.find(loc => loc.id === "library");
    if (defaultLocation) {
      console.log(`UseMeetups: No match found for "${locationName}", defaulting to Library: (${defaultLocation.lat}, ${defaultLocation.lng})`);
      return { lat: defaultLocation.lat, lng: defaultLocation.lng };
    }
    
    return { lat: 32.9886, lng: -96.7491 }; // UTD center coordinates as last resort
  };

  // Special avatars for specific people - updated with specified characteristics
  const specialAvatars = {
    "patrick": "https://api.dicebear.com/7.x/avataaars/svg?seed=Patrick&mouth=smile&eyes=happy&skinColor=f2d3b1&hairColor=a55728&accessoriesType=round&facialHairType=none&facialHairColor=a55728&clotheType=hoodie&clotheColor=3c4f5c&eyebrowType=default&mouthType=smile&top=shortHair&eyeType=happy",
    "neethu": "https://api.dicebear.com/7.x/avataaars/svg?seed=Neethu&mouth=smile&eyes=happy&skinColor=ae8569&hairColor=2c1b18&accessoriesType=none&facialHairType=none&clotheType=overall&clotheColor=d14836&eyebrowType=default&mouthType=smile&top=longHair&eyeType=happy",
    "esha": "https://api.dicebear.com/7.x/avataaars/svg?seed=Esha&mouth=smile&eyes=happy&skinColor=ae8569&hairColor=2c1b18&accessoriesType=none&facialHairType=none&clotheType=blazer&clotheColor=624a2e&eyebrowType=default&mouthType=smile&top=longHair&eyeType=happy",
    "sophia": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&mouth=smile&eyes=happy&skinColor=f2d3b1&hairColor=4a312c&accessoriesType=none&facialHairType=none&clotheType=blazer&clotheColor=5199e4&eyebrowType=default&mouthType=smile&top=longHair&eyeType=happy"
  };

  // Helper function to get an illustrated avatar for a user with happy facial expressions
  const getIllustratedAvatar = (id: string, name?: string) => {
    // Check for special avatars first
    if (name) {
      const lowerName = name.toLowerCase();
      for (const [specialName, avatar] of Object.entries(specialAvatars)) {
        if (lowerName.includes(specialName)) {
          return avatar;
        }
      }
    }
    
    // If this is for the current user and they have a selected avatar
    if (avatar) {
      return avatar;
    }
    
    const charSum = (id + (name || "")).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const avatars = [
      "/placeholder.svg",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&mouth=smile&eyes=happy",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&mouth=smile&eyes=happy", 
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight&mouth=smile&eyes=happy",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&mouth=smile&eyes=happy"
    ];
    return avatars[charSum % avatars.length];
  };

  useEffect(() => {
    const fetchMeetups = async () => {
      try {
        setIsLoading(true);
        let query = supabase.from('events').select('*');
        
        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching meetups:", error);
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
              console.log(`UseMeetups: Using matched coordinates for "${event.location}": (${latitude}, ${longitude})`);
            }
            
            // Use illustrated avatar instead of real photo
            const creatorAvatar = getIllustratedAvatar(event.id.toString(), event.creator_name);
            
            return {
              id: event.id.toString(),
              title: event.title,
              description: event.description || "No description available",
              dateTime: formatEventDate(event.event_date),
              location: event.location,
              points: getPointsForLobbySize(lobbySize),
              createdBy: event.creator_name || "Anonymous",
              creatorAvatar: creatorAvatar,
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
  }, [selectedCategory, toast, avatar]); // Add avatar to dependencies to refresh when it changes

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
        // Check for "The Plinth" directly
        if (meetupData.location.toLowerCase().includes("plinth")) {
          const plinth = campusLocations.find(loc => loc.id === "plinth");
          if (plinth) {
            latitude = plinth.lat;
            longitude = plinth.lng;
            console.log(`UseMeetups: Direct plinth match for "${meetupData.location}": ${plinth.name} (${latitude}, ${longitude})`);
          }
        } else {
          // Find exact match from our predefined locations
          const matchedLocation = findLocationByName(meetupData.location);
          
          if (matchedLocation) {
            latitude = matchedLocation.lat;
            longitude = matchedLocation.lng;
            console.log(`UseMeetups: Using exact location coordinates for "${meetupData.location}": (${latitude}, ${longitude})`);
          } else {
            // Fallback to library as default location
            const defaultLocation = campusLocations.find(loc => loc.id === "library");
            if (defaultLocation) {
              latitude = defaultLocation.lat;
              longitude = defaultLocation.lng;
              console.log(`UseMeetups: No match found for "${meetupData.location}", using library coordinates: (${latitude}, ${longitude})`);
            }
          }
        }
      }
      
      console.log("Creating meetup with coordinates:", { latitude, longitude, location: meetupData.location });
      
      // Insert the meetup into the database
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
      
      // Get profile picture if the user has one set
      const userAvatar = avatar; // Use the user's selected avatar
      
      // Use the user's selected avatar if available
      const creatorAvatar = userAvatar || getIllustratedAvatar(eventRow.id.toString(), userName);
      
      const newMeetup: Meetup = {
        id: eventRow.id.toString(),
        title: eventRow.title,
        description: eventRow.description || "No description available",
        dateTime: formatEventDate(eventRow.event_date),
        location: eventRow.location,
        points: points,
        createdBy: eventRow.creator_name || userName,
        creatorAvatar: creatorAvatar,
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
      
      // Automatically add creator to the lobby as "attended" (not just "registered")
      const numericMeetupId = eventRow.id;
      const numericUserId = parseInt(userId);
      
      // Add to participants table with "attended" status
      await supabase.from('participants').insert({
        event_id: numericMeetupId,
        user_id: numericUserId,
        joined_at: new Date().toISOString(),
        attendance_status: 'attended', // Mark as attended immediately
        xp_earned: points // Award points immediately
      });
      
      // Update local state via the user store
      const { joinMeetupLobby, attendMeetup } = useUserStore.getState();
      joinMeetupLobby(eventRow.id.toString());
      attendMeetup(eventRow.id.toString(), points); // Also mark as attended in the store
      
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

  // Update joinMeetupLobby to accept string IDs
  const joinMeetupLobby = async (meetupId: string, userId: string): Promise<boolean> => {
    try {
      // Convert string IDs to numbers for database operations
      const numericMeetupId = parseInt(meetupId);
      const numericUserId = parseInt(userId);
      
      // First check if user is already in the lobby
      const { data: existingParticipant, error: checkError } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', numericMeetupId)
        .eq('user_id', numericUserId)
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
      
      // Insert participant - using numeric IDs for the database
      const { error } = await supabase.from('participants').insert({
        event_id: numericMeetupId,
        user_id: numericUserId,
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
      // Convert string IDs to numbers for database operations
      const numericMeetupId = parseInt(meetupId);
      const numericUserId = parseInt(userId);
      
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
        .eq('event_id', numericMeetupId)
        .eq('user_id', numericUserId);
      
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

  // New function to update an existing meetup
  const updateMeetup = async (
    meetupId: string,
    meetupData: Partial<Meetup>,
    userId: string
  ): Promise<boolean> => {
    try {
      // Convert IDs to numbers for database operations
      const numericMeetupId = parseInt(meetupId);
      const numericUserId = parseInt(userId);
      
      // First verify that this user is the creator of the meetup
      const { data: meetupCheck, error: checkError } = await supabase
        .from('events')
        .select('creator_id')
        .eq('id', numericMeetupId)
        .single();
      
      if (checkError) {
        console.error("Error checking meetup ownership:", checkError);
        toast({
          title: "Error updating meetup",
          description: "Could not verify meetup ownership",
          variant: "destructive"
        });
        return false;
      }
      
      if (meetupCheck.creator_id !== numericUserId) {
        toast({
          title: "Permission denied",
          description: "You can only edit meetups that you created",
          variant: "destructive"
        });
        return false;
      }
      
      // Make sure we have coordinates if location is being updated
      let latitude = meetupData.latitude;
      let longitude = meetupData.longitude;
      
      if (meetupData.location && (!latitude || !longitude || latitude === 0 || longitude === 0)) {
        const coords = getLocationCoordinates(meetupData.location);
        latitude = coords.lat;
        longitude = coords.lng;
      }
      
      // Prepare update object
      const updateObject: any = {};
      
      if (meetupData.title) updateObject.title = meetupData.title;
      if (meetupData.description) updateObject.description = meetupData.description;
      if (meetupData.dateTime) updateObject.event_date = meetupData.dateTime;
      if (meetupData.location) updateObject.location = meetupData.location;
      if (meetupData.category) updateObject.category = meetupData.category;
      if (meetupData.lobbySize) updateObject.lobby_size = meetupData.lobbySize;
      if (latitude !== undefined && longitude !== undefined) {
        updateObject.latitude = latitude;
        updateObject.longitude = longitude;
      }
      
      // Update the meetup in Supabase
      const { error } = await supabase
        .from('events')
        .update(updateObject)
        .eq('id', numericMeetupId)
        .eq('creator_id', numericUserId);
      
      if (error) {
        console.error("Error updating meetup:", error);
        toast({
          title: "Error updating meetup",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      // Update the meetup in our local state
      setAllMeetups(prevMeetups => 
        prevMeetups.map(meetup => 
          meetup.id === meetupId
            ? { ...meetup, ...meetupData }
            : meetup
        )
      );
      
      toast({
        title: "Meetup updated",
        description: "Your meetup details have been successfully updated.",
      });
      
      return true;
    } catch (error) {
      console.error("Error updating meetup:", error);
      toast({
        title: "Error updating meetup",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  return { 
    allMeetups, 
    isLoading, 
    setAllMeetups,
    createMeetup,
    joinMeetupLobby,
    checkInToMeetup,
    updateMeetup // Add the new update function to the return object
  };
};
