
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, User, X } from "lucide-react";
import { Friend, Tag } from "@/services/types";

interface FriendsSectionProps {
  friends: Friend[];
  openAddFriendDialog: () => void;
  onRemoveFriend: (friendId: string, friendName: string) => void;
}

const FriendsSection: React.FC<FriendsSectionProps> = ({
  friends,
  openAddFriendDialog,
  onRemoveFriend
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Friends</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full"
          onClick={openAddFriendDialog}
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
                <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
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
                onClick={() => onRemoveFriend(friend.id, friend.name)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendsSection;
