
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
import { useState } from "react";
import LocationSelector from "./LocationSelector";
import { campusLocations } from "@/utils/campusLocations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";

// Modified validation schema to handle Date objects and formatted time
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

interface EditMeetupFormProps {
  meetup: Meetup;
  onSuccess: (updatedMeetup: Meetup) => void;
  onClose: () => void;
}

const EditMeetupForm = ({ meetup, onSuccess, onClose }: EditMeetupFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState({ 
    lat: meetup.latitude || 0, 
    lng: meetup.longitude || 0 
  });

  // Parse the date and time from the meetup dateTime string
  const parseDateAndTime = (dateTimeStr: string) => {
    try {
      // Handle different datetime formats
      let dateObj: Date;
      let timeString: string = "";
      
      // Common format: "May 03, 2025 @ 3:00 PM"
      if (dateTimeStr.includes("@")) {
        const [dateStr, timeStr] = dateTimeStr.split("@").map(s => s.trim());
        dateObj = new Date(dateStr);
        
        // Extract time in 24h format
        const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeParts) {
          let hours = parseInt(timeParts[1], 10);
          const minutes = timeParts[2];
          const period = timeParts[3].toUpperCase();
          
          // Convert to 24-hour format
          if (period === "PM" && hours < 12) hours += 12;
          if (period === "AM" && hours === 12) hours = 0;
          
          timeString = `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
      } else {
        // Try parsing as a complete date string
        dateObj = new Date(dateTimeStr);
        timeString = format(dateObj, "HH:mm");
      }
      
      return {
        date: dateObj,
        time: timeString
      };
    } catch (error) {
      console.error("Error parsing date time:", error);
      return {
        date: new Date(),
        time: "12:00"
      };
    }
  };

  const { date: parsedDate, time: parsedTime } = parseDateAndTime(meetup.dateTime);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: meetup.title,
      description: meetup.description,
      date: parsedDate,
      time: parsedTime,
      location: meetup.location,
      category: meetup.category || "",
      lobbySize: meetup.lobbySize,
    },
  });

  // Format military time to standard AM/PM format for display
  const formatTimeToAmPm = (time24h: string): string => {
    try {
      if (!time24h) return "";
      const [hours, minutes] = time24h.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      console.error("Error formatting time:", e);
      return time24h; // Return original if there's an error
    }
  };

  // Convert AM/PM format back to 24h for form submission
  const formatTimeToMilitary = (time12h: string): string => {
    try {
      if (!time12h) return "";
      // If already in 24h format, return as is
      if (time12h.indexOf("AM") === -1 && time12h.indexOf("PM") === -1 && time12h.includes(":")) {
        return time12h;
      }
      
      // Parse the time string and convert to 24h format
      const date = parse(time12h, "h:mm a", new Date());
      return format(date, "HH:mm");
    } catch (e) {
      console.error("Error converting time to military:", e);
      return time12h; // Return original if there's an error
    }
  };

  const handleLocationCoordinatesChange = (lat: number, lng: number) => {
    setLocationCoordinates({ lat, lng });
  };

  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!user || !user.email) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to edit meetups",
          variant: "destructive"
        });
        return;
      }
      
      // Get user info to verify ownership
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .eq('email', user.email)
        .single();
        
      if (userError || !userData) {
        toast({
          title: "Error",
          description: "Could not verify user credentials",
          variant: "destructive"
        });
        return;
      }
      
      // Format the date and time into a single string with AM/PM format
      const militaryTime = values.time;
      const displayTime = formatTimeToAmPm(militaryTime);
      const formattedDateTime = format(values.date, 'MMM dd, yyyy') + ' @ ' + displayTime;
      
      // Use provided coordinates or get them from the location name
      const lat = locationCoordinates.lat || meetup.latitude || 0;
      const lng = locationCoordinates.lng || meetup.longitude || 0;
      
      // Update the meetup in the database
      const { data, error } = await supabase
        .from('events')
        .update({
          title: values.title,
          description: values.description,
          event_date: formattedDateTime,
          location: values.location,
          category: values.category,
          lobby_size: values.lobbySize,
          latitude: lat,
          longitude: lng,
        })
        .eq('id', parseInt(meetup.id))
        .eq('creator_id', userData.id) // Ensure only the creator can update
        .select('*')
        .single();
      
      if (error) {
        console.error("Error updating meetup:", error);
        if (error.message.includes("no rows")) {
          toast({
            title: "Permission denied",
            description: "You can only edit meetups that you created",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error updating meetup",
            description: error.message,
            variant: "destructive"
          });
        }
        return;
      }
      
      // Create the updated meetup object for the UI
      const updatedMeetup: Meetup = {
        ...meetup,
        title: values.title,
        description: values.description,
        dateTime: formattedDateTime,
        location: values.location,
        category: values.category,
        lobbySize: values.lobbySize,
        latitude: lat,
        longitude: lng,
      };
      
      onSuccess(updatedMeetup);
      onClose();
      
      toast({
        title: "Meetup updated!",
        description: "Your meetup has been successfully updated.",
      });
    } catch (error) {
      console.error("Error in meetup update:", error);
      toast({
        title: "Error updating meetup",
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
                          "w-full pl-3 text-left font-normal",
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
              <FormItem className="flex flex-col">
                <FormLabel>Time</FormLabel>
                <Select 
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select a time" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 48 }).map((_, i) => {
                      const hour = Math.floor(i / 2);
                      const minute = i % 2 === 0 ? "00" : "30";
                      const timeValueMilitary = `${hour.toString().padStart(2, '0')}:${minute}`;
                      const timeValueDisplay = formatTimeToAmPm(timeValueMilitary);
                      
                      return (
                        <SelectItem key={timeValueMilitary} value={timeValueMilitary}>
                          {timeValueDisplay}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
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
          <Button type="button" variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Meetup"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default EditMeetupForm;
