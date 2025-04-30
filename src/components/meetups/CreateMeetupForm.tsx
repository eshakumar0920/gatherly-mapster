
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
import { campusLocations } from "@/utils/campusLocations";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dateTime: z.string().min(3, "Date and time is required"),
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
      dateTime: "",
      location: "",
      category: "",
      lobbySize: 5,
    },
  });

  const handleLocationCoordinatesChange = (lat: number, lng: number) => {
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
      
      const meetupData = {
        ...values,
        points: 3, // Default points
        latitude: locationCoordinates.lat,
        longitude: locationCoordinates.lng
      };
      
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
        </div>

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

