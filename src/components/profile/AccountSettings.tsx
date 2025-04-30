
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface AccountSettingsProps {
  onEditProfile: () => void;
  onChangeAvatar: () => void;
  onNotificationSettings: () => void;
  onPrivacySettings: () => void;
  onLogout: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({
  onEditProfile,
  onChangeAvatar,
  onNotificationSettings,
  onPrivacySettings,
  onLogout
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Account Settings</h3>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={onEditProfile}
        >
          <User className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={onChangeAvatar}
        >
          <User className="mr-2 h-4 w-4" />
          Change Avatar
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={onNotificationSettings}
        >
          Notification Settings
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={onPrivacySettings}
        >
          Privacy Settings
        </Button>
      </div>
      
      <Button 
        variant="destructive"
        className="w-full"
        onClick={onLogout}
      >
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>
    </div>
  );
};

export default AccountSettings;
