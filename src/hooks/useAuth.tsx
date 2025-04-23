import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Adjust the auth base URL
const AUTH_BASE_URL = 'http://localhost:5000'; 

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [lastVerified, setLastVerified] = useState<number>(0);

  const { toast } = useToast();

  // Restore session from localStorage on mount and set up listener
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session");
      
      if (session) {
        setIsLoggedIn(true);
        setAccessToken(session.access_token);
        setUser(session.user);
        setVerifiedEmail(session.user.email || "");
        setIsEmailVerified(true);
        setLastVerified(Date.now());
        
        // Store in localStorage as backup
        window.localStorage.setItem("impulse_access_token", session.access_token);
        window.localStorage.setItem("impulse_user_email", session.user.email || "");
        window.localStorage.setItem("impulse_last_verified", Date.now().toString());
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setIsEmailVerified(false);
        setVerifiedEmail("");
        setUser(null);
        setAccessToken(null);
        setLastVerified(0);
        window.localStorage.removeItem("impulse_access_token");
        window.localStorage.removeItem("impulse_user_email");
        window.localStorage.removeItem("impulse_last_verified");
      }
    });

    // Then check for existing session
    const initializeAuthState = async () => {
      try {
        // First try to get active Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Found existing Supabase session");
          setIsLoggedIn(true);
          setAccessToken(session.access_token);
          setUser(session.user);
          setVerifiedEmail(session.user.email || "");
          setIsEmailVerified(true);
          setLastVerified(Date.now());
          window.localStorage.setItem("impulse_last_verified", Date.now().toString());
        } else {
          // Fall back to localStorage tokens
          console.log("No Supabase session, checking localStorage");
          const token = window.localStorage.getItem("impulse_access_token");
          const email = window.localStorage.getItem("impulse_user_email");
          const storedLastVerified = window.localStorage.getItem("impulse_last_verified");
          
          if (token && email) {
            console.log("Found token in localStorage, verifying");
            // Check if the token was recently verified (within the last 5 minutes)
            const tokenRecentlyVerified = storedLastVerified && 
              (Date.now() - Number(storedLastVerified)) < 5 * 60 * 1000;
            
            if (tokenRecentlyVerified) {
              console.log("Token was recently verified, skipping verification");
              setIsLoggedIn(true);
              setAccessToken(token);
              setVerifiedEmail(email);
              setUser({ email });
              setIsEmailVerified(true);
              setLastVerified(Number(storedLastVerified));
            } else {
              const isValid = await verify(token);
              
              if (isValid) {
                setIsLoggedIn(true);
                setAccessToken(token);
                setVerifiedEmail(email);
                setUser({ email });
                setIsEmailVerified(true);
                setLastVerified(Date.now());
                window.localStorage.setItem("impulse_last_verified", Date.now().toString());
                console.log("Local token verified successfully");
              } else {
                console.log("Local token invalid, clearing");
                window.localStorage.removeItem("impulse_access_token");
                window.localStorage.removeItem("impulse_user_email");
                window.localStorage.removeItem("impulse_last_verified");
              }
            }
          } else {
            console.log("No auth tokens found");
          }
        }
      } catch (error) {
        console.error("Error initializing auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuthState();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Verify user token if needed
  const verify = async (token: string) => {
    try {
      const resp = await fetch(`${AUTH_BASE_URL}/auth/verify`, {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + token
        }
      });
      if (!resp.ok) return false;
      const data = await resp.json();
      return !!data.email;
    } catch {
      return false;
    }
  };

  // New method to verify the current session
  const verifyCurrentSession = useCallback(async () => {
    // If we verified the token recently (within the last minute), skip verification
    if (Date.now() - lastVerified < 60 * 1000) {
      console.log("Session was recently verified, skipping verification");
      return true;
    }

    console.log("Verifying current session...");
    
    try {
      // First try Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log("Current Supabase session is valid");
        setLastVerified(Date.now());
        window.localStorage.setItem("impulse_last_verified", Date.now().toString());
        return true;
      }
      
      // If no Supabase session, check localStorage token
      const token = window.localStorage.getItem("impulse_access_token");
      if (token) {
        const isValid = await verify(token);
        if (isValid) {
          console.log("Local token is valid");
          setLastVerified(Date.now());
          window.localStorage.setItem("impulse_last_verified", Date.now().toString());
          return true;
        }
      }
      
      console.log("Session verification failed");
      return false;
    } catch (error) {
      console.error("Error verifying session:", error);
      return false;
    }
  }, [lastVerified]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // First try Flask backend
      try {
        console.log("Attempting to login with Flask backend");
        const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        console.log("Login response status:", response.status);
        
        // Check if response is valid
        if (!response.ok) {
          let errorMessage = "Login failed";
          // Try to parse error message from response
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
            console.error("Login error:", errorData);
          } catch (jsonError) {
            console.error("Failed to parse error response:", jsonError);
            // If JSON parsing fails, use status text
            errorMessage = `${response.status}: ${response.statusText || errorMessage}`;
          }
          throw new Error(errorMessage);
        }

        // Parse successful response
        let data;
        try {
          data = await response.json();
          console.log("Login successful:", data);
        } catch (jsonError) {
          console.error("Failed to parse login response:", jsonError);
          throw new Error("Unexpected response from server");
        }

        // Store access token and email in localStorage
        window.localStorage.setItem("impulse_access_token", data.access_token);
        window.localStorage.setItem("impulse_user_email", data.email);

        setIsLoggedIn(true);
        setVerifiedEmail(data.email);
        setIsEmailVerified(true); // Assume email is verified after login
        setUser({ email: data.email });
        setAccessToken(data.access_token);

        return { success: true, data };
      } catch (error: any) {
        console.error("Flask login failed:", error);
        
        // If server is unreachable (404, network error), fallback to Supabase
        if (error.message.includes("404") || error.message.includes("Failed to fetch")) {
          console.log("Backend server unreachable, falling back to Supabase");
          toast({
            title: "Backend server unreachable",
            description: "Falling back to Supabase authentication",
            variant: "destructive", // Changed from "warning" to "destructive"
          });
          
          try {
            // Fallback to Supabase
            const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (supabaseError) throw supabaseError;
            
            if (data.user && data.session) {
              // Store access token and email in localStorage
              window.localStorage.setItem("impulse_access_token", data.session.access_token);
              window.localStorage.setItem("impulse_user_email", data.user.email || "");
              
              setIsLoggedIn(true);
              setVerifiedEmail(data.user.email || "");
              setIsEmailVerified(true);
              setUser(data.user);
              setAccessToken(data.session.access_token);
              
              return { success: true, data };
            }
          } catch (supabaseError: any) {
            console.error("Supabase fallback failed:", supabaseError);
            throw new Error(supabaseError.message || "Login failed with both backends");
          }
        }
        
        // If not a server unavailable error, rethrow original error
        throw error;
      }
    } catch (error: any) {
      setIsLoggedIn(false);
      setVerifiedEmail("");
      setUser(null);
      setAccessToken(null);
      window.localStorage.removeItem("impulse_access_token");
      window.localStorage.removeItem("impulse_user_email");
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, metadata?: { name?: string }) => {
    try {
      setIsLoading(true);
      
      // First try Flask backend
      try {
        const response = await fetch(`${AUTH_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, ...metadata })
        });

        // Check if response is valid
        if (!response.ok) {
          let errorMessage = "Signup failed";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            errorMessage = `${response.status}: ${response.statusText || errorMessage}`;
          }
          throw new Error(errorMessage);
        }

        // Parse successful response
        const data = await response.json();
        return { success: true, data };
        
      } catch (error: any) {
        console.error("Flask signup failed:", error);
        
        // If server is unreachable (404, network error), fallback to Supabase
        if (error.message.includes("404") || error.message.includes("Failed to fetch")) {
          toast({
            title: "Backend server unreachable",
            description: "Falling back to Supabase authentication",
            variant: "destructive", // Changed from "warning" to "destructive"
          });
          
          try {
            // Fallback to Supabase
            let supabaseOptions = { email, password };
            const { data, error: supabaseError } = await supabase.auth.signUp(supabaseOptions);
            
            if (supabaseError) throw supabaseError;
            
            // Handle metadata separately if needed
            if (metadata && metadata.name && data.user) {
              try {
                await supabase
                  .from('user_roles') // Changed from 'profiles' to 'user_roles' which exists in the DB
                  .upsert({ 
                    user_id: data.user.id,
                    role: 'user' // Assuming a default role
                  });
              } catch (profileError) {
                console.error("Failed to save user role data:", profileError);
              }
            }
            
            return { success: true, data };
          } catch (supabaseError: any) {
            console.error("Supabase fallback failed:", supabaseError);
            throw new Error(supabaseError.message || "Signup failed with both backends");
          }
        }
        
        // If not a server unavailable error, rethrow original error
        throw error;
      }
    } catch (error: any) {
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setIsEmailVerified(false);
    setVerifiedEmail("");
    setUser(null);
    setAccessToken(null);
    window.localStorage.removeItem("impulse_access_token");
    window.localStorage.removeItem("impulse_user_email");
    
    // Try to logout from Supabase if it was used
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to sign out from Supabase:", error);
    }
  };

  return {
    isLoggedIn,
    isEmailVerified,
    verifiedEmail,
    isLoading,
    user,
    accessToken,
    login,
    signup,
    logout,
    verifyCurrentSession
  };
};

export const useRequireAuth = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth", { state: { from: location.pathname } });
    }
  }, [isLoggedIn, isLoading, navigate, location]);

  return { isLoggedIn, isLoading };
};
