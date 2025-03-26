
import { Link, useLocation } from "react-router-dom";
import { Home, Users, User, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/services/meetupService";

const Navigation = () => {
  const location = useLocation();
  const { points, level } = useUserStore();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/meetups", icon: Users, label: "Meetups" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/maps", icon: Map, label: "Maps" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-2 px-4 z-50">
      <nav className="max-w-lg mx-auto">
        <ul className="flex justify-between items-center">
          {navItems.map((item) => (
            <li key={item.path} className="w-full">
              <Link 
                to={item.path} 
                className={cn(
                  "flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors",
                  location.pathname === item.path && "text-primary"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs">{item.label}</span>
                {item.path === "/profile" && (
                  <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                    Lvl {level}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Navigation;
