
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, isLoading, verifyCurrentSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verify the current session when the component mounts
  useEffect(() => {
    const checkSession = async () => {
      if (!isLoading && isLoggedIn) {
        const isSessionValid = await verifyCurrentSession();
        if (!isSessionValid) {
          toast({
            title: "Session expired",
            description: "Your login session has expired. Please sign in again.",
            variant: "destructive",
          });
          navigate("/auth", { replace: true });
        }
      }
    };
    
    checkSession();
  }, [isLoggedIn, isLoading, navigate, toast, verifyCurrentSession]);

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth page if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
