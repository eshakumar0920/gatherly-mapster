
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, isLoading, accessToken, needsRefresh, refreshSession, verifyToken } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Extra verification step for token validity when component mounts
    const verifyTokenValidity = async () => {
      if (accessToken && !isVerifying) {
        setIsVerifying(true);
        
        try {
          // First check if we need to refresh the token
          if (needsRefresh()) {
            console.log("Token needs refresh, attempting to refresh...");
            const refreshed = await refreshSession();
            if (!refreshed) {
              console.warn("Token refresh failed");
              setIsValid(false);
              return;
            }
          }
          
          // Verify current token
          const valid = await verifyToken(accessToken);
          console.log("Token verification result:", valid);
          setIsValid(valid);
          
          if (!valid) {
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Token verification error:", error);
          setIsValid(false);
        } finally {
          setIsVerifying(false);
        }
      } else if (!accessToken) {
        setIsValid(false);
      }
    };
    
    verifyTokenValidity();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Show loading indicator while checking auth status
  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">
          {isVerifying ? "Verifying your session..." : "Loading..."}
        </p>
      </div>
    );
  }

  // If we explicitly know the token is invalid, redirect to auth
  if (isValid === false) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Redirect to auth page if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
