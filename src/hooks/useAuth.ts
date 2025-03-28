
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Check if user is logged in from localStorage
    const authStatus = localStorage.getItem("isLoggedIn") === "true";
    const emailVerifiedStatus = localStorage.getItem("isEmailVerified") === "true";
    const storedEmail = localStorage.getItem("verifiedEmail") || "";
    
    setIsLoggedIn(authStatus);
    setIsEmailVerified(emailVerifiedStatus);
    setVerifiedEmail(storedEmail);
    setIsLoading(false);
  }, []);
  
  const login = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };
  
  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isEmailVerified");
    localStorage.removeItem("verifiedEmail");
    setIsLoggedIn(false);
    setIsEmailVerified(false);
    setVerifiedEmail("");
  };
  
  return { 
    isLoggedIn, 
    isEmailVerified, 
    verifiedEmail, 
    isLoading, 
    login, 
    logout 
  };
};

export const useRequireAuth = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      // Redirect to auth page if not logged in
      navigate("/auth", { state: { from: location.pathname } });
    }
  }, [isLoggedIn, isLoading, navigate, location]);
  
  return { isLoggedIn, isLoading };
};
