
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface PrivacySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: PrivacySettingsType) => void;
  initialSettings?: PrivacySettingsType;
}

export interface PrivacySettingsType {
  profileVisibility: "public" | "friends" | "private";
  locationSharing: boolean;
  activityStatus: boolean;
  allowTagging: boolean;
  dataUsageConsent: boolean;
}

const defaultSettings: PrivacySettingsType = {
  profileVisibility: "public",
  locationSharing: true,
  activityStatus: true,
  allowTagging: true,
  dataUsageConsent: true,
};

const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  open,
  onOpenChange,
  onSave,
  initialSettings = defaultSettings,
}) => {
  const [settings, setSettings] = useState<PrivacySettingsType>(initialSettings);
  const { toast } = useToast();

  const handleToggle = (setting: keyof PrivacySettingsType) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleProfileVisibilityChange = (value: "public" | "friends" | "private") => {
    setSettings(prev => ({
      ...prev,
      profileVisibility: value
    }));
  };

  const handleSave = () => {
    onSave(settings);
    onOpenChange(false);
    toast({
      title: "Privacy settings saved",
      description: "Your privacy preferences have been updated."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Privacy Settings</DialogTitle>
          <DialogDescription>
            Control how your information is shared and used
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="profile-visibility">Profile Visibility</Label>
            <Select 
              value={settings.profileVisibility}
              onValueChange={(value: "public" | "friends" | "private") => 
                handleProfileVisibilityChange(value)
              }
            >
              <SelectTrigger id="profile-visibility">
                <SelectValue placeholder="Who can see your profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Everyone can see</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="private">Private - Only you</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="location-sharing">Location Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Share your location with others at events
              </p>
            </div>
            <Switch
              id="location-sharing"
              checked={settings.locationSharing}
              onCheckedChange={() => handleToggle("locationSharing")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="activity-status">Online Activity Status</Label>
              <p className="text-sm text-muted-foreground">
                Show when you're active on impulse
              </p>
            </div>
            <Switch
              id="activity-status"
              checked={settings.activityStatus}
              onCheckedChange={() => handleToggle("activityStatus")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-tagging">Allow Tagging</Label>
              <p className="text-sm text-muted-foreground">
                Let others tag you in meetups and events
              </p>
            </div>
            <Switch
              id="allow-tagging"
              checked={settings.allowTagging}
              onCheckedChange={() => handleToggle("allowTagging")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="data-usage">Data Usage Consent</Label>
              <p className="text-sm text-muted-foreground">
                Allow using your data to improve your experience
              </p>
            </div>
            <Switch
              id="data-usage"
              checked={settings.dataUsageConsent}
              onCheckedChange={() => handleToggle("dataUsageConsent")}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacySettings;
