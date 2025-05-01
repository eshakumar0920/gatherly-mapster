
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/services/eventService";
import { DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { Meetup } from "@/types/meetup";
import { useMeetups } from "@/hooks/useMeetups";
import { useUserStore } from "@/services/meetupService";
import { useState } from "react";
import LocationSelector from "./LocationSelector";
import { campusLocations, findLocationByName } from "@/utils/campusLocations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Modified validation schema to handle Date objects
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.date({
    required_error: "A date is required",
  }),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(3, "Location is required").refine(
    (val) => campusLocations.some(loc => loc.name === val),
    { message: "Please select a valid campus location from the dropdown" }
  ),
  category: z.string().min(1, "Category is required"),
  lobbySize: z.preprocess(
    (val) => Number(val),
    z.number().int().positive("Lobby size must be greater than 0")
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateMeetupFormProps {
  onSuccess: (meetups: Meetup | Meetup[]) => void;
  onClose: () => void;
}

const CreateMeetupForm = ({ onSuccess, onClose }: CreateMeetupFormProps) => {
  const { toast } = useToast();
  const { user, isLoggedIn } = useAuth();
  const { createMeetup } = useMeetups();
  const { userId, setUserId } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState({ lat: 0, lng: 0 });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: undefined,
      time: "",
      location: "",
      category: "",
      lobbySize: 5,
    },
  });

  const handleLocationCoordinatesChange = (lat: number, lng: number) => {
    console.log(`Location coordinates selected: (${lat}, ${lng})`);
    setLocationCoordinates({ lat, lng });
  };

  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!isLoggedIn || !user || !user.email) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create meetups",
          variant: "destructive"
        });
        return;
      }
      
      // If we don't have userId in store yet, fetch it
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();
          
        if (userError || !userData) {
          // Create new user record if not found
          const username = user.email.split('@')[0];
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              email: user.email,
              username: username,
              join_date: new Date().toISOString()
            })
            .select('id')
            .single();
            
          if (createError) {
            console.error("Error creating user record:", createError);
            toast({
              title: "Error creating meetup",
              description: "Could not create user record in database",
              variant: "destructive"
            });
            return;
          }
          
          currentUserId = newUser.id.toString();
          setUserId(currentUserId);
        } else {
          currentUserId = userData.id.toString();
          setUserId(currentUserId);
        }
      }
      
      // Get username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', parseInt(currentUserId))
        .single();
        
      if (userError || !userData) {
        console.error("Error fetching username:", userError);
        toast({
          title: "Error creating meetup",
          description: "Could not fetch user information",
          variant: "destructive"
        });
        return;
      }
      
      // Format the date and time into a single string
      const formattedDateTime = format(values.date, 'MMM dd, yyyy') + ' @ ' + values.time;
      
      // Get exact coordinates for the selected location
      let lat = locationCoordinates.lat;
      let lng = locationCoordinates.lng;
      
      // If coordinates weren't selected directly, find the exact location from campusLocations
      if (lat === 0 && lng === 0) {
        const exactLocationMatch = campusLocations.find(loc => loc.name === values.location);
        
        if (exactLocationMatch) {
          lat = exactLocationMatch.lat;
          lng = exactLocationMatch.lng;
          console.log(`Using exact coordinates for "${values.location}": (${lat}, ${lng})`);
        } else {
          const defaultLocation = campusLocations.find(loc => loc.id === "library");
          if (defaultLocation) {
            lat = defaultLocation.lat;
            lng = defaultLocation.lng;
            console.log(`No match found for "${values.location}", using library coordinates: (${lat}, ${lng})`);
          }
        }
      }
      
      const meetupData = {
        title: values.title,
        description: values.description,
        dateTime: formattedDateTime,
        location: values.location,
        category: values.category,
        lobbySize: values.lobbySize,
        points: 3, // Default points
        latitude: lat,
        longitude: lng
      };
      
      console.log(`Creating meetup at location "${values.location}" with coordinates: (${lat}, ${lng})`);
      const newMeetup = await createMeetup(meetupData, currentUserId, userData.username);
      
      if (newMeetup) {
        onSuccess(newMeetup);
        onClose();
        form.reset();
        
        toast({
          title: "Meetup created!",
          description: "Your meetup has been successfully added to the map.",
        });
      }
    } catch (error) {
      console.error("Error in meetup creation:", error);
      toast({
        title: "Error creating meetup",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          {/* Date Picker */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "MMM dd, yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Time Picker */}
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="time" 
                      className="pl-10" 
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <LocationSelector 
                  value={field.value}
                  onChange={field.onChange}
                  onCoordinatesChange={handleLocationCoordinatesChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="lobbySize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lobby Size (max participants)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  placeholder="5" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Meetup"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CreateMeetupForm;
