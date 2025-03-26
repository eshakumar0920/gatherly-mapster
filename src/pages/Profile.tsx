
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };
  
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
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </header>

      {/* Profile Content */}
      <div className="p-4">
        <div className="bg-card border rounded-lg p-6 space-y-8">
          <div className="flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-xl font-semibold">UTD Student</h2>
            <p className="text-muted-foreground">student@utdallas.edu</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Account Settings</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" disabled>
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Notification Settings
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Privacy Settings
              </Button>
            </div>
          </div>
          
          <Button 
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Profile;
