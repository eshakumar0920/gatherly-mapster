
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogOut, Award, Star, UserPlus, X, Tag, User, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { useUserStore } from "@/services/meetupService";
import { Friend, Tag as TagType } from "@/services/types";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import LootBoxPopup from "@/components/LootBoxPopup";
import { useLevelUp } from "@/contexts/LevelUpContext";
import { ProfileSticker } from "@/components/ProfileStickers";

const availableTags: TagType[] = [
  "Technology", "Arts", "Music", "Sports", "Food", "Outdoors", 
  "Gaming", "Reading", "Photography", "Fitness", "Movies",
  "Science", "Cooking", "Fashion", "Design", "Travel", "Academic"
];

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();
  const { 
    points, 
    level, 
    attendedMeetups, 
    name, 
    email, 
    friends, 
    tags, 
    selectedSticker,
    avatar,
    addFriend, 
    removeFriend, 
    updateTags,
    updateProfile,
    updateAvatar,
  } = useUserStore();
  
  const [isAddFriendDialogOpen, setIsAddFriendDialogOpen] = useState(false);
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isProfilePictureDialogOpen, setIsProfilePictureDialogOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [newFriend, setNewFriend] = useState<Partial<Friend>>({
    name: "",
    avatar: ""
  });
  
  const [profileForm, setProfileForm] = useState({
    name,
    email
  });
  
  const [selectedTags, setSelectedTags] = useState<TagType[]>(tags);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(avatar || null);
  
  const pointsToNextLevel = level * 10;
  const progress = (points % 10) * 10;
  
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };
  
  const handleAddFriend = () => {
    if (!newFriend.name) {
      toast({
        title: "Friend name required",
        description: "Please enter a name for your friend.",
        variant: "destructive"
      });
      return;
    }
    
    const friend: Friend = {
      id: `friend${Date.now()}`,
      name: newFriend.name,
      avatar: newFriend.avatar || undefined,
      tags: []
    };
    
    addFriend(friend);
    setNewFriend({ name: "", avatar: "" });
    setIsAddFriendDialogOpen(false);
    
    toast({
      title: "Friend added!",
      description: `${friend.name} has been added to your friends list.`
    });
  };
  
  const handleRemoveFriend = (friendId: string, friendName: string) => {
    removeFriend(friendId);
    toast({
      title: "Friend removed",
      description: `${friendName} has been removed from your friends list.`
    });
  };
  
  const handleUpdateTags = () => {
    updateTags(selectedTags);
    setIsTagDialogOpen(false);
    
    toast({
      title: "Tags updated!",
      description: "Your profile tags have been updated."
    });
  };
  
  const handleUpdateProfile = () => {
    updateProfile(profileForm.name, profileForm.email);
    setIsEditProfileDialogOpen(false);
    
    toast({
      title: "Profile updated!",
      description: "Your profile information has been updated."
    });
  };
  
  const toggleTag = (tag: TagType) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const { setShowStickers } = useLevelUp();

  const triggerStickers = () => {
    setShowStickers(true);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    try {
      setUploadingAvatar(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      // Create object URL for immediate preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
      
      // Simulate upload with a delay
      setTimeout(() => {
        // Update avatar in state
        updateAvatar(objectUrl);
        setUploadingAvatar(false);
        setIsProfilePictureDialogOpen(false);
        
        toast({
          title: "Profile picture updated!",
          description: "Your profile picture has been successfully updated."
        });
      }, 1000);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your profile picture.",
        variant: "destructive"
      });
      setUploadingAvatar(false);
    }
  };
  
  return (
    <div className="pb-20">
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      <header className="p-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </header>

      <div className="p-4">
        <div className="bg-card border rounded-lg p-6 space-y-8">
          <div className="flex flex-col items-center">
            <div className="relative cursor-pointer" onClick={() => setIsProfilePictureDialogOpen(true)}>
              <Avatar className="h-24 w-24 rounded-full bg-muted mb-4">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={name} />
                ) : (
                  <AvatarFallback className="text-4xl">👤</AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Upload className="h-8 w-8 text-white" />
              </div>
              {level > 0 && (
                <ProfileSticker 
                  level={level} 
                  selectedSticker={selectedSticker} 
                  size="lg"
                />
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerStickers();
                }}
              >
                {selectedSticker !== null ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
              </Button>
            </div>
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-muted-foreground">{email}</p>
            
            <div className="flex flex-wrap gap-1 mt-2 justify-center">
              {tags.map(tag => (
                <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full h-6 text-xs"
                onClick={() => setIsTagDialogOpen(true)}
              >
                <Tag className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-primary mr-2" />
                <span className="font-semibold">Level {level}</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-primary mr-1" />
                <span>{points} points</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress to Level {level + 1}</span>
                <span>{points % 10}/10 points</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span>Attended {attendedMeetups.length} meetups</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Friends</h3>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full"
                onClick={() => setIsAddFriendDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            <div className="space-y-2">
              {friends.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No friends added yet. Add your first friend!
                </p>
              ) : (
                friends.map(friend => (
                  <div key={friend.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {friend.avatar ? (
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                        ) : (
                          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{friend.name}</p>
                        <div className="flex gap-1">
                          {friend.tags?.map(tag => (
                            <span key={tag} className="text-xs text-muted-foreground">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleRemoveFriend(friend.id, friend.name)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Account Settings</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsEditProfileDialogOpen(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setIsProfilePictureDialogOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Change Profile Picture
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Notification Settings
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Privacy Settings
              </Button>
            </div>
          </div>
          
          <Button 
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <Dialog open={isAddFriendDialogOpen} onOpenChange={setIsAddFriendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Friend</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="friendName" className="text-sm font-medium">Friend's Name</label>
              <Input 
                id="friendName"
                placeholder="Enter friend's name"
                value={newFriend.name || ''}
                onChange={e => setNewFriend({...newFriend, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="friendAvatar" className="text-sm font-medium">Avatar URL (optional)</label>
              <Input 
                id="friendAvatar"
                placeholder="https://example.com/avatar.jpg"
                value={newFriend.avatar || ''}
                onChange={e => setNewFriend({...newFriend, avatar: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleAddFriend}>Add Friend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditProfileDialogOpen} onOpenChange={setIsEditProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="profileName" className="text-sm font-medium">Name</label>
              <Input 
                id="profileName"
                placeholder="Your name"
                value={profileForm.name}
                onChange={e => setProfileForm({...profileForm, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="profileEmail" className="text-sm font-medium">Email</label>
              <Input 
                id="profileEmail"
                placeholder="Your email"
                value={profileForm.email}
                onChange={e => setProfileForm({...profileForm, email: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleUpdateProfile}>Update Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Interests</DialogTitle>
          </DialogHeader>
          
          <div className="py-2">
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleUpdateTags}>Save Interests</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfilePictureDialogOpen} onOpenChange={setIsProfilePictureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="py-6 flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={name} />
              ) : (
                <AvatarFallback className="text-5xl">👤</AvatarFallback>
              )}
            </Avatar>
            
            <div className="text-center">
              <label htmlFor="avatarUpload" className="cursor-pointer">
                <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md inline-flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {uploadingAvatar ? "Uploading..." : "Upload New Picture"}
                </div>
                <input 
                  id="avatarUpload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: Square image, max 2MB
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfilePictureDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
};

export default Profile;
