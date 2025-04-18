
import { Loader2 } from "lucide-react";

interface ContentLoaderProps {
  message?: string;
}

const ContentLoader = ({ message = "Loading content..." }: ContentLoaderProps) => {
  return (
    <div className="py-20 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
      <p>{message}</p>
    </div>
  );
};

export default ContentLoader;
