
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
import { useToast } from "@/hooks/use-toast";

interface NotificationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: NotificationSettingsType) => void;
  initialSettings?: NotificationSettingsType;
}

export interface NotificationSettingsType {
  emailNotifications: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
  friendRequests: boolean;
  meetupUpdates: boolean;
}

const defaultSettings: NotificationSettingsType = {
  emailNotifications: true,
  pushNotifications: true,
  eventReminders: true,
  friendRequests: true,
  meetupUpdates: true,
};

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  open,
  onOpenChange,
  onSave,
  initialSettings = defaultSettings,
}) => {
  const [settings, setSettings] = useState<NotificationSettingsType>(initialSettings);
  const { toast } = useToast();

  const handleToggle = (setting: keyof NotificationSettingsType) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = () => {
    onSave(settings);
    onOpenChange(false);
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Choose which notifications you'd like to receive
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get alerts on your device
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={() => handleToggle("pushNotifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="event-reminders">Event Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive reminders before events you've joined
              </p>
            </div>
            <Switch
              id="event-reminders"
              checked={settings.eventReminders}
              onCheckedChange={() => handleToggle("eventReminders")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="friend-requests">Friend Requests</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone adds you as a friend
              </p>
            </div>
            <Switch
              id="friend-requests"
              checked={settings.friendRequests}
              onCheckedChange={() => handleToggle("friendRequests")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="meetup-updates">Meetup Updates</Label>
              <p className="text-sm text-muted-foreground">
                Notifications for changes to meetups you're attending
              </p>
            </div>
            <Switch
              id="meetup-updates"
              checked={settings.meetupUpdates}
              onCheckedChange={() => handleToggle("meetupUpdates")}
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

export default NotificationSettings;
