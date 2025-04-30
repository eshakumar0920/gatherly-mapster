
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileForm: {
    name: string;
    email: string;
  };
  onProfileFormChange: (form: { name: string; email: string }) => void;
  onUpdateProfile: () => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onOpenChange,
  profileForm,
  onProfileFormChange,
  onUpdateProfile
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={e => onProfileFormChange({...profileForm, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="profileEmail" className="text-sm font-medium">Email</label>
            <Input 
              id="profileEmail"
              placeholder="Your email"
              value={profileForm.email}
              onChange={e => onProfileFormChange({...profileForm, email: e.target.value})}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onUpdateProfile}>Update Profile</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
