
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Tag as TagType } from "@/services/types";

interface TagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableTags: TagType[];
  selectedTags: TagType[];
  onToggleTag: (tag: TagType) => void;
  onUpdateTags: () => void;
}

const TagsDialog: React.FC<TagsDialogProps> = ({
  open,
  onOpenChange,
  availableTags,
  selectedTags,
  onToggleTag,
  onUpdateTags
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onClick={() => onToggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onUpdateTags}>Save Interests</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TagsDialog;
