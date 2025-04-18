
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const AppHeader = () => {
  return (
    <>
      {/* App Name */}
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      {/* Header */}
      <header className="p-4">
        <h1 className="text-2xl font-bold">UTD Events</h1>
        <p className="text-muted-foreground">Discover student-led events and meetups around campus</p>
      </header>

      {/* Search bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search events & meetups..." 
            className="pl-10 rounded-full bg-muted/50"
          />
        </div>
      </div>
    </>
  );
};

export default AppHeader;
