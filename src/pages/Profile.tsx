import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Settings, LogOut, Trophy, Star, Users, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LevelProgress } from "@/components/LevelProgress";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { useUserStore } from "@/services/meetupService";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Mock profile achievements data
const profileAchievements = [
  {
    name: "Social Butterfly",
    value: "Connect with 10+ students",
    progress: 80,
  },
  {
    name: "Event Enthusiast",
    value: "Attend 5+ events this month",
    progress: 60,
  },
  {
    name: "Campus Explorer",
    value: "Visit 8 different campus locations",
    progress: 75,
  },
];

// Mock activity stats for bar chart
const mockActivityData = [
  {
    name: "Mon",
    events: 2,
  },
  {
    name: "Tue",
    events: 0,
  },
  {
    name: "Wed",
    events: 1,
  },
  {
    name: "Thu",
    events: 3,
  },
  {
    name: "Fri",
    events: 4,
  },
  {
    name: "Sat",
    events: 2,
  },
  {
    name: "Sun",
    events: 0,
  },
];

// Mock user interests
const userInterests = [
  "Technology",
  "Academic",
  "Social",
  "Gaming",
  "Sports",
  "Arts",
];

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { name, points, level, updateProfile, avatar, updateAvatar, tags } = useUserStore();
  const { user, logout } = useAuth();
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [editProfile, setEditProfile] = useState(false);
  const [newName, setNewName] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Fetch current user session on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error fetching user session:", error);
          return;
        }
        
        if (data.session?.user) {
          setCurrentUser(data.session.user);
          
          // Get the full name from user metadata or localStorage
          let fullName = "";
          
          // First try to get the name from user metadata
          fullName = data.session.user.user_metadata?.name || "";
          
          // If not available in metadata, try localStorage
          if (!fullName) {
            fullName = localStorage.getItem("impulse_user_name") || "";
          }
          
          // If still not available, use email as fallback
          if (!fullName) {
            fullName = data.session.user.email?.split('@')[0] || "User";
          }
          
          // Set the display name and email
          setDisplayName(fullName);
          setUserEmail(data.session.user.email || "");
        }
      } catch (error) {
        console.error("Error in fetchUser:", error);
      }
    };
    
    fetchUser();
  }, []);

  const handleSettings = () => {
    // Implement settings functionality
    toast({
      title: "Settings",
      description: "Settings page is not implemented yet.",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateProfile = () => {
    if (newName.trim()) {
      updateProfile(newName, userEmail);
      
      // Also update in Supabase if possible
      if (currentUser) {
        supabase.auth.updateUser({
          data: { name: newName }
        }).then(() => {
          // Update localStorage
          localStorage.setItem("impulse_user_name", newName);
          
          // Update state
          setDisplayName(newName);
          
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully.",
          });
        }).catch(error => {
          console.error("Error updating user profile:", error);
        });
      }
    }
    
    setEditProfile(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({
        title: "Upload failed",
        description: "No file selected.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const timestamp = new Date().getTime();
      const filePath = `avatars/${user?.id}/${timestamp}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const publicURL = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
      setAvatarUrl(publicURL);
      updateAvatar(publicURL);

      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during avatar upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col gap-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-24 w-24">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : (
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{displayName || "User"}</h1>
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-1" />
                    <span>{userEmail || "No email available"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5" />
                      <span>Level {level}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      <span>{points} XP</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-auto flex gap-2">
                  {editProfile ? (
                    <div className="flex flex-col md:flex-row gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="New name"
                        className="px-3 py-2 rounded border border-border bg-background"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdateProfile}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditProfile(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => {
                        setNewName(displayName);
                        setEditProfile(true);
                      }}>
                        Edit Profile
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleSettings}>
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
                      <Button size="sm" variant="destructive" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-1" />
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <LevelProgress
                  level={level}
                  progress={65}
                  pointsForCurrentLevel={0}
                  pointsForNextLevel={100}
                />
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="interests">Interests</TabsTrigger>
            </TabsList>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                  <CardDescription>Your event participation this week.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="events" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Achievements</CardTitle>
                  <CardDescription>Track your progress and unlock new achievements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">{achievement.name}</h3>
                        <p className="text-xs text-muted-foreground">{achievement.value}</p>
                      </div>
                      <div className="w-24">
                        <LevelProgress
                          level={1}
                          progress={achievement.progress}
                          pointsForCurrentLevel={0}
                          pointsForNextLevel={100}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interests Tab */}
            <TabsContent value="interests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Interests</CardTitle>
                  <CardDescription>Customize your interests to discover relevant events.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {userInterests.map((interest, index) => (
                    <Badge key={index}>{interest}</Badge>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Avatar Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Update Avatar</CardTitle>
              <CardDescription>Choose a new avatar to personalize your profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  {isUploading ? "Uploading..." : "Upload New Avatar"}
                </label>
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="Current Avatar"
                    className="h-10 w-10 rounded-full"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
