
import { useNavigate } from "react-router-dom";
import { Tag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { useUserStore } from "@/services/meetupService";
import { Friend, Tag as TagType } from "@/services/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLevelUp } from "@/contexts/LevelUpContext";
import ProfileAvatars from "@/components/ProfileAvatars";
import NotificationSettings, { NotificationSettingsType } from "@/components/profile/NotificationSettings";
import PrivacySettings, { PrivacySettingsType } from "@/components/profile/PrivacySettings";

// Import our newly created components
import ProfileHeader from "@/components/profile/ProfileHeader";
import FriendsSection from "@/components/profile/FriendsSection";
import AccountSettings from "@/components/profile/AccountSettings";
import AddFriendDialog from "@/components/profile/AddFriendDialog";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import TagsDialog from "@/components/profile/TagsDialog";

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
    selectedSticker: selectedAvatar,
    addFriend, 
    removeFriend, 
    updateTags,
    updateProfile,
  } = useUserStore();
  
  const [isAddFriendDialogOpen, setIsAddFriendDialogOpen] = useState(false);
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [isPrivacySettingsOpen, setIsPrivacySettingsOpen] = useState(false);
  
  const [newFriend, setNewFriend] = useState<Partial<Friend>>({
    name: "",
    avatar: ""
  });
  
  const [profileForm, setProfileForm] = useState({
    name,
    email
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsType>({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    friendRequests: true,
    meetupUpdates: true,
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsType>({
    profileVisibility: "public",
    locationSharing: true,
    activityStatus: true,
    allowTagging: true,
    dataUsageConsent: true,
  });
  
  const [selectedTags, setSelectedTags] = useState<TagType[]>(tags);
  
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

  const { setShowAvatars } = useLevelUp();

  const openAvatarSelector = () => {
    setShowAvatars(true);
  };

  const handleSaveNotificationSettings = (settings: NotificationSettingsType) => {
    setNotificationSettings(settings);
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved."
    });
  };

  const handleSavePrivacySettings = (settings: PrivacySettingsType) => {
    setPrivacySettings(settings);
    toast({
      title: "Privacy settings updated",
      description: "Your privacy preferences have been saved."
    });
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
          {/* Profile Header Section */}
          <ProfileHeader 
            name={name}
            email={email}
            level={level}
            points={points}
            attendedMeetups={attendedMeetups}
            tags={tags}
            selectedAvatar={selectedAvatar}
            openAvatarSelector={openAvatarSelector}
            openTagDialog={() => setIsTagDialogOpen(true)}
          />
          
          {/* Friends Section */}
          <FriendsSection 
            friends={friends}
            openAddFriendDialog={() => setIsAddFriendDialogOpen(true)}
            onRemoveFriend={handleRemoveFriend}
          />
          
          {/* Account Settings Section */}
          <AccountSettings 
            onEditProfile={() => setIsEditProfileDialogOpen(true)}
            onChangeAvatar={openAvatarSelector}
            onNotificationSettings={() => setIsNotificationSettingsOpen(true)}
            onPrivacySettings={() => setIsPrivacySettingsOpen(true)}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Dialogs */}
      <AddFriendDialog 
        open={isAddFriendDialogOpen}
        onOpenChange={setIsAddFriendDialogOpen}
        newFriend={newFriend}
        onNewFriendChange={setNewFriend}
        onAddFriend={handleAddFriend}
      />

      <EditProfileDialog 
        open={isEditProfileDialogOpen}
        onOpenChange={setIsEditProfileDialogOpen}
        profileForm={profileForm}
        onProfileFormChange={setProfileForm}
        onUpdateProfile={handleUpdateProfile}
      />

      <TagsDialog 
        open={isTagDialogOpen}
        onOpenChange={setIsTagDialogOpen}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onUpdateTags={handleUpdateTags}
      />

      <NotificationSettings 
        open={isNotificationSettingsOpen}
        onOpenChange={setIsNotificationSettingsOpen}
        onSave={handleSaveNotificationSettings}
        initialSettings={notificationSettings}
      />

      <PrivacySettings 
        open={isPrivacySettingsOpen}
        onOpenChange={setIsPrivacySettingsOpen}
        onSave={handleSavePrivacySettings}
        initialSettings={privacySettings}
      />

      <ProfileAvatars />

      <Navigation />
    </div>
  );
};

export default Profile;
