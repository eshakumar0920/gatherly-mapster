
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Meetup } from "@/types/meetup";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/services/eventService";
import { DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import LocationSelector from "./LocationSelector";
import { campusLocations } from "@/utils/campusLocations";
import { useMeetups } from "@/hooks/useMeetups";

// Improved validation for location to ensure it's an exact match from the predefined locations
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

interface EditMeetupFormProps {
  meetup: Meetup;
  userId: string;
  onSuccess: (updatedMeetup: Partial<Meetup>) => void;
  onClose: () => void;
}

const EditMeetupForm = ({ meetup, userId, onSuccess, onClose }: EditMeetupFormProps) => {
  const { updateMeetup } = useMeetups();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState({ 
    lat: meetup.latitude || 0, 
    lng: meetup.longitude || 0 
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: meetup.title || "",
      description: meetup.description || "",
      dateTime: meetup.dateTime || "",
      location: meetup.location || "",
      category: meetup.category || "",
      lobbySize: meetup.lobbySize || 5,
    },
  });

  // Handle location coordinates change
  const handleLocationCoordinatesChange = (lat: number, lng: number) => {
    console.log(`Location coordinates selected: (${lat}, ${lng})`);
    setLocationCoordinates({ lat, lng });
  };

  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedMeetupData = {
        ...values,
        latitude: locationCoordinates.lat,
        longitude: locationCoordinates.lng
      };
      
      const success = await updateMeetup(meetup.id, updatedMeetupData, userId);
      
      if (success) {
        onSuccess(updatedMeetupData);
        onClose();
      }
    } catch (error) {
      console.error("Error in meetup update:", error);
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
                <Input {...field} />
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
                <Textarea {...field} />
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
                  <Input {...field} />
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
