
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
}

const SectionHeader = ({ 
  title, 
  actionText = "See all", 
  onAction 
}: SectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {onAction && (
        <Button variant="link" className="text-sm p-0" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default SectionHeader;
