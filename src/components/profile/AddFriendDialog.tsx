
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
import { Friend, Tag as TagType } from "@/services/types";

interface AddFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newFriend: Partial<Friend>;
  onNewFriendChange: (friend: Partial<Friend>) => void;
  onAddFriend: () => void;
}

const AddFriendDialog: React.FC<AddFriendDialogProps> = ({
  open,
  onOpenChange,
  newFriend,
  onNewFriendChange,
  onAddFriend
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={e => onNewFriendChange({...newFriend, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="friendTags" className="text-sm font-medium">Tags (optional)</label>
            <Input 
              id="friendTags"
              placeholder="Technology, Gaming, etc."
              value={newFriend.tags?.join(', ') || ''}
              onChange={e => onNewFriendChange({
                ...newFriend, 
                tags: e.target.value.split(',').map(tag => tag.trim() as TagType).filter(Boolean)
              })}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onAddFriend}>Add Friend</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendDialog;
