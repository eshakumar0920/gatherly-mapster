
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
}

const SectionHeader = ({ title }: SectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button variant="link" className="text-sm p-0">See all</Button>
    </div>
  );
};

export default SectionHeader;
