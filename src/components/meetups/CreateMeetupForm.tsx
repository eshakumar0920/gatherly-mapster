
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
import { meetupsApi } from "@/services/api";

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
  onSuccess: (meetup: any) => void;
  onClose: () => void;
}

const CreateMeetupForm = ({ onSuccess, onClose }: CreateMeetupFormProps) => {
  const { toast } = useToast();
  const { user, accessToken } = useAuth();
  
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
    try {
      if (!user || !user.email) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create meetups",
          variant: "destructive"
        });
        return;
      }

      const eventDate = new Date().toISOString();
      
      // Create meetup object
      const meetupData = {
        title: values.title,
        description: values.description,
        location: values.location,
        event_date: eventDate,
        category: "meetup", // Always set to meetup regardless of selected category
        lobby_size: values.lobbySize,
      };
      
      console.log("Submitting meetup with data:", meetupData);
      
      // Try API approach first
      try {
        console.log("Creating meetup via API with auth token");
        const createResponse = await meetupsApi.createMeetup(meetupData);
        
        if (createResponse.error) {
          console.error("API error:", createResponse.error);
          throw new Error(createResponse.error);
        }
        
        console.log("Meetup created successfully via API");
        toast({
          title: "Meetup created!",
          description: "Your meetup has been successfully created.",
        });
        
        onSuccess(meetupData);
        return;
      } catch (apiError) {
        console.error("API meetup creation failed, falling back to Supabase:", apiError);
        // Continue to fallback approach below
      }
      
      // Fallback to direct Supabase approach
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (usersError || !usersData) {
        console.log("User not found in users table, creating a new record");
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: user.email,
            username: user.email.split('@')[0],
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
        
        await createMeetupInSupabase(values, eventDate, newUser.id);
      } else {
        await createMeetupInSupabase(values, eventDate, usersData.id);
      }
      
      onSuccess(meetupData);
      form.reset();
    } catch (error) {
      console.error("Error in meetup creation:", error);
      toast({
        title: "Error creating meetup",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const createMeetupInSupabase = async (values: FormValues, eventDate: string, userId: number) => {
    console.log("Creating meetup in Supabase with category: meetup");
    const { error } = await supabase.from('events').insert({
      title: values.title,
      description: values.description,
      location: values.location,
      event_date: eventDate,
      creator_id: userId,
      created_at: new Date().toISOString(),
      semester: "Spring 2025",
      xp_reward: 3,
      organizer_xp_reward: 5,
      category: "meetup" // Always set to meetup
    });
    
    if (error) {
      console.error("Error creating meetup in Supabase:", error);
      toast({
        title: "Error creating meetup",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Meetup created!",
      description: "Your meetup has been successfully created.",
    });
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
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit" className="w-full">Create Meetup</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CreateMeetupForm;
