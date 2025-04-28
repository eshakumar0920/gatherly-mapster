
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useMeetupService } from "@/services/flaskService";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dateTime: z.string().min(3, "Date and time is required"),
  location: z.string().min(3, "Location is required"),
  category: z.string().min(1, "Category is required"),
  lobbySize: z.preprocess(
    (val) => Number(val),
    z.number().int().positive("Lobby size must be greater than 0")
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateMeetupFormProps {
  onSuccess: (meetups: Meetup[]) => void;
  onClose: () => void;
}

const CreateMeetupForm = ({ onSuccess, onClose }: CreateMeetupFormProps) => {
  const { toast } = useToast();
  const { user, isLoggedIn } = useAuth();
  const { createMeetup, fetchMeetups } = useMeetupService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
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

  const onSubmit = async (values: FormValues) => {
    setErrorDetails(null);
    try {
      setIsSubmitting(true);
      
      if (!isLoggedIn || !user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create meetups",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Submitting form with values:", values);
      
      // Create the meetup using the Flask API
      const createdMeetup = await createMeetup({
        ...values,
        createdBy: user.email?.split('@')[0] || "Student",
      });
      
      if (createdMeetup) {
        console.log("Meetup created successfully:", createdMeetup);
        // Fetch updated meetups list
        const updatedMeetups = await fetchMeetups();
        console.log("Updated meetups after creation:", updatedMeetups);
        onSuccess(updatedMeetups);
        onClose();
        form.reset();
      } else {
        // This will run if createMeetup returns null (which happens on error)
        console.error("Failed to create meetup, no error thrown but result is null");
        setErrorDetails("The server couldn't process your request. Please check all fields and try again.");
      }
    } catch (error) {
      console.error("Error in meetup creation submit handler:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrorDetails(errorMessage);
      toast({
        title: "Error creating meetup",
        description: errorMessage,
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
                  <Input placeholder="Student Union" {...field} />
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {errorDetails && (
          <div className="text-destructive text-sm">
            <p>Error details: {errorDetails}</p>
          </div>
        )}
        
        <DialogFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Meetup"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CreateMeetupForm;
