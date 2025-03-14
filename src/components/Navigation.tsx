
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, User, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/events", icon: Calendar, label: "Events" },
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
                  "nav-link",
                  location.pathname === item.path && "active"
                )}
              >
                <item.icon className="h-6 w-6 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Navigation;
