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
import { Meetup, EventRow } from "@/types/meetup";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
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
      if (!isLoggedIn || !user || !user.email) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create meetups",
          variant: "destructive"
        });
        onClose();
        navigate("/auth");
        return;
      }
      
      const eventDate = new Date().toISOString();
      
      if (!user || !user.id) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create meetups",
          variant: "destructive"
        });
        return;
      }
      
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
        
        await createMeetup(values, eventDate, newUser.id);
      } else {
        await createMeetup(values, eventDate, usersData.id);
      }
      
      const { data: updatedRawData } = await supabase.from('events').select('*');
      if (updatedRawData) {
        const supabaseMeetups = updatedRawData.map((event) => {
          const typedEvent = event as EventRow;
          const meetup: Meetup = {
            id: typedEvent.id.toString(),
            title: typedEvent.title,
            description: typedEvent.description || "No description available",
            dateTime: new Date(typedEvent.event_date).toLocaleString(),
            location: typedEvent.location,
            points: typedEvent.xp_reward || 3,
            createdBy: "Student",
            creatorAvatar: undefined,
            lobbySize: 5,
            category: typedEvent.category || "Other",
            attendees: []
          };
          return meetup;
        });
        
        onSuccess(supabaseMeetups);
      }
      
      onClose();
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

  const createMeetup = async (values: FormValues, eventDate: string, userId: number) => {
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
      category: values.category
    });
    
    if (error) {
      console.error("Error creating meetup:", error);
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

  if (!isLoggedIn) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-destructive">You must be logged in to create meetups</p>
        <Button onClick={() => navigate("/auth")}>Go to Login</Button>
      </div>
    );
  }

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
