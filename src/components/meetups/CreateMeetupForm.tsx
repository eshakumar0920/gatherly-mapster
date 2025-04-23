
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
import { useEffect, useState } from "react";

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
  const { user, isLoggedIn, accessToken } = useAuth();
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState<string>("Checking auth status...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    console.log("Auth state in CreateMeetupForm:", { isLoggedIn, user, tokenExists: !!accessToken });
    
    if (isLoggedIn && user) {
      setAuthStatus(`Logged in as: ${user.email || "Unknown email"}`);
    } else {
      setAuthStatus("Not logged in");
    }
  }, [isLoggedIn, user, accessToken]);
  
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
    if (!isLoggedIn || !user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create meetups",
        variant: "destructive"
      });
      onClose();
      navigate("/auth");
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Submit attempted with auth state:", { isLoggedIn, userExists: !!user, userEmail: user?.email });
      
      if (!user || !user.email) {
        toast({
          title: "User data missing",
          description: "Your login session appears incomplete. Please try logging in again.",
          variant: "destructive"
        });
        return;
      }
      
      // Check if session is still valid
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current session:", sessionData?.session ? "Valid" : "Invalid");
      
      if (!sessionData?.session) {
        toast({
          title: "Session expired",
          description: "Your login session has expired. Please log in again.",
          variant: "destructive"
        });
        onClose();
        navigate("/auth");
        return;
      }
      
      const eventDate = new Date().toISOString();
      
      // Try to find the user first
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
      
      console.log("User lookup result:", { usersData, usersError });
      
      let userId: number;
      
      if (usersError || !usersData) {
        console.log("User not found in users table, creating a new record");
        
        // Create a new user record
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
        
        userId = newUser.id;
      } else {
        userId = usersData.id;
      }
      
      // Create the meetup with the user ID
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
      
      // Fetch updated meetups list
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoggedIn && !user) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-destructive">Authentication issue detected</p>
        <p className="mb-4 text-sm text-muted-foreground">
          You appear to be logged in but your user data is missing. This might be a session issue.
        </p>
        <Button onClick={() => navigate("/auth")}>Re-login</Button>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-destructive">You must be logged in to create meetups</p>
        <p className="mb-2 text-sm text-muted-foreground">Auth status: {authStatus}</p>
        <Button onClick={() => navigate("/auth")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-xs text-muted-foreground mb-4 p-2 bg-muted/50 rounded">
          Auth status: {authStatus}
        </div>
        
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
