
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/EventCard";
import Navigation from "@/components/Navigation";
import { getFeaturedEvents, categories } from "@/services/eventService";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const featuredEvents = getFeaturedEvents();

  return (
    <div className="pb-20">
      {/* App Name */}
      <div className="p-4 pt-6 flex items-center justify-center">
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
      </div>

      {/* Header */}
      <header className="p-4">
        <h1 className="text-2xl font-bold">UTD Events</h1>
        <p className="text-muted-foreground">Discover student-led events around campus</p>
      </header>

      {/* Search bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search events..." 
            className="pl-10 rounded-full bg-muted/50"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pb-4">
        <h2 className="text-lg font-semibold mb-2">Categories</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            className={`rounded-full text-xs ${
              selectedCategory === null ? "" : ""
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`rounded-full text-xs whitespace-nowrap`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Events */}
      <div className="px-4 pb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Featured Events</h2>
          <Button variant="link" className="text-sm p-0">See all</Button>
        </div>
        <div className="space-y-4">
          {featuredEvents.map(event => (
            <EventCard key={event.id} event={event} featured />
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="px-4 pb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Upcoming This Week</h2>
          <Button variant="link" className="text-sm p-0">See all</Button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {featuredEvents.map(event => (
            <div key={event.id} className="min-w-[250px] max-w-[250px]">
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Index;
