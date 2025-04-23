
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Adjust the auth base URL
const AUTH_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [lastTokenRefresh, setLastTokenRefresh] = useState<number>(Date.now());

  const { toast } = useToast();

  // Function to check if token needs refresh (less than 5 minutes until expiry)
  const needsRefresh = useCallback(() => {
    if (!sessionExpiresAt) return false;
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    return sessionExpiresAt < fiveMinutesFromNow;
  }, [sessionExpiresAt]);

  // Helper to store session data consistently
  const storeSessionData = useCallback((token: string, email: string, expiresAt: number) => {
    window.localStorage.setItem("impulse_access_token", token);
    window.localStorage.setItem("impulse_user_email", email);
    window.localStorage.setItem("impulse_session_expires_at", expiresAt.toString());
    setLastTokenRefresh(Date.now());
  }, []);

  // Helper to clear session data consistently
  const clearSessionData = useCallback(() => {
    window.localStorage.removeItem("impulse_access_token");
    window.localStorage.removeItem("impulse_user_email");
    window.localStorage.removeItem("impulse_session_expires_at");
    setIsLoggedIn(false);
    setIsEmailVerified(false);
    setVerifiedEmail("");
    setUser(null);
    setAccessToken(null);
    setSessionExpiresAt(null);
  }, []);

  // Restore session from localStorage on mount and set up listener
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session");
      
      if (session) {
        setIsLoggedIn(true);
        setAccessToken(session.access_token);
        setUser(session.user);
        setVerifiedEmail(session.user.email || "");
        setIsEmailVerified(true);
        
        // Calculate proper expiry time
        const expiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + (60 * 60 * 1000);
        setSessionExpiresAt(expiresAt);
        
        // Store in localStorage as backup
        storeSessionData(session.access_token, session.user.email || "", expiresAt);
      } else if (event === 'SIGNED_OUT') {
        clearSessionData();
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
          
          // Calculate proper expiry time
          const expiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + (60 * 60 * 1000);
          setSessionExpiresAt(expiresAt);
          
          // Store in localStorage with fresh token
          storeSessionData(session.access_token, session.user.email || "", expiresAt);
        } else {
          // Fall back to localStorage tokens
          console.log("No Supabase session, checking localStorage");
          const token = window.localStorage.getItem("impulse_access_token");
          const email = window.localStorage.getItem("impulse_user_email");
          const expiresAt = window.localStorage.getItem("impulse_session_expires_at");
          
          if (token && email) {
            console.log("Found token in localStorage, verifying");
            
            // Check if token is expired based on stored expiry time
            if (expiresAt && parseInt(expiresAt) < Date.now()) {
              console.log("Token expired based on stored expiration time, clearing");
              clearSessionData();
            } else {
              // Verify with backend if not obviously expired
              try {
                const isValid = await verifyToken(token);
                
                if (isValid) {
                  setIsLoggedIn(true);
                  setAccessToken(token);
                  setVerifiedEmail(email);
                  setUser({ email });
                  setIsEmailVerified(true);
                  if (expiresAt) {
                    setSessionExpiresAt(parseInt(expiresAt));
                  }
                  console.log("Local token verified successfully");
                } else {
                  console.log("Local token invalid, clearing");
                  clearSessionData();
                }
              } catch (verifyError) {
                console.error("Error verifying token:", verifyError);
                clearSessionData();
              }
            }
          } else {
            console.log("No auth tokens found");
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        console.error("Error initializing auth state:", error);
        clearSessionData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuthState();

    // Set up interval to check token expiration and refresh if needed
    const checkTokenInterval = setInterval(() => {
      if (isLoggedIn && needsRefresh()) {
        // Prevent excessive refresh attempts
        if (Date.now() - lastTokenRefresh > 60000) { // Only try refresh once per minute
          console.log("Token nearing expiration, attempting refresh");
          refreshSession().then(success => {
            if (success) {
              console.log("Session refreshed successfully");
              setLastTokenRefresh(Date.now());
            } else {
              console.warn("Session refresh failed");
            }
          });
        }
      }
    }, 30000); // Check every 30 seconds

    return () => {
      subscription.unsubscribe();
      clearInterval(checkTokenInterval);
    };
  }, [clearSessionData, needsRefresh, storeSessionData, lastTokenRefresh]);

  // Verify user token
  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      console.log("Verifying token with backend...");
      const resp = await fetch(`${AUTH_BASE_URL}/auth/verify`, {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + token
        },
        credentials: 'include'
      });
      
      if (!resp.ok) {
        console.warn(`Token verification failed with status: ${resp.status}`);
        return false;
      }
      
      const data = await resp.json();
      return !!data.email;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  };

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
          body: JSON.stringify({ email, password }),
          credentials: 'include'
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

        // Calculate expiration time (default to 1 hour from now if not provided)
        const expiresAt = data.expires_at ? 
          data.expires_at * 1000 : // Convert seconds to milliseconds
          Date.now() + (60 * 60 * 1000); // Default: 1 hour from now

        // Store session data
        storeSessionData(data.access_token, data.email, expiresAt);

        setIsLoggedIn(true);
        setVerifiedEmail(data.email);
        setIsEmailVerified(true); // Assume email is verified after login
        setUser({ email: data.email });
        setAccessToken(data.access_token);
        setSessionExpiresAt(expiresAt);

        toast({
          title: "Login successful",
          description: `Welcome back, ${data.email}!`,
        });

        return { success: true, data };
      } catch (error: any) {
        console.error("Flask login failed:", error);
        
        // If server is unreachable (404, network error), fallback to Supabase
        if (error.message.includes("404") || error.message.includes("Failed to fetch")) {
          console.log("Backend server unreachable, falling back to Supabase");
          toast({
            title: "Backend server unreachable",
            description: "Falling back to Supabase authentication",
            variant: "destructive",
          });
          
          try {
            // Fallback to Supabase
            const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (supabaseError) throw supabaseError;
            
            if (data.user && data.session) {
              // Calculate expiration time
              const expiresAt = data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + (60 * 60 * 1000);

              // Store session data
              storeSessionData(data.session.access_token, data.user.email || "", expiresAt);
              
              setIsLoggedIn(true);
              setVerifiedEmail(data.user.email || "");
              setIsEmailVerified(true);
              setUser(data.user);
              setAccessToken(data.session.access_token);
              setSessionExpiresAt(expiresAt);
              
              toast({
                title: "Login successful",
                description: `Welcome back, ${data.user.email}!`,
              });
              
              return { success: true, data };
            }
          } catch (supabaseError: any) {
            console.error("Supabase fallback failed:", supabaseError);
            toast({
              title: "Login failed",
              description: supabaseError.message || "Authentication failed with both backends",
              variant: "destructive",
            });
            throw new Error(supabaseError.message || "Login failed with both backends");
          }
        }
        
        // If not a server unavailable error, show toast and rethrow original error
        toast({
          title: "Login failed",
          description: error.message || "Authentication failed",
          variant: "destructive",
        });
        
        throw error;
      }
    } catch (error: any) {
      clearSessionData();
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
          body: JSON.stringify({ email, password, ...metadata }),
          credentials: 'include'
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
        toast({
          title: "Signup successful",
          description: "Your account has been created. Please log in.",
        });
        return { success: true, data };
        
      } catch (error: any) {
        console.error("Flask signup failed:", error);
        
        // If server is unreachable (404, network error), fallback to Supabase
        if (error.message.includes("404") || error.message.includes("Failed to fetch")) {
          toast({
            title: "Backend server unreachable",
            description: "Falling back to Supabase authentication",
            variant: "destructive",
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
            
            toast({
              title: "Signup successful",
              description: "Your account has been created. Please log in.",
            });
            
            return { success: true, data };
          } catch (supabaseError: any) {
            console.error("Supabase fallback failed:", supabaseError);
            toast({
              title: "Signup failed",
              description: supabaseError.message || "Registration failed with both backends",
              variant: "destructive",
            });
            throw new Error(supabaseError.message || "Signup failed with both backends");
          }
        }
        
        // If not a server unavailable error, show toast and rethrow original error
        toast({
          title: "Signup failed",
          description: error.message || "Registration failed",
          variant: "destructive",
        });
        
        throw error;
      }
    } catch (error: any) {
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      console.log("Attempting to refresh session");
      
      // First try to refresh with Supabase
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Error refreshing session with Supabase:", error);
        
        // Fall back to token verification with backend if we have a token
        if (accessToken) {
          const isValid = await verifyToken(accessToken);
          if (isValid) {
            console.log("Backend token still valid");
            return true;
          }
        }
        
        return false;
      }
      
      if (data.session) {
        console.log("Session refreshed successfully with Supabase");
        // The onAuthStateChange listener will update our state
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in refreshSession:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Try to logout from Supabase if it was used
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to sign out from Supabase:", error);
    } finally {
      // Clear local session data regardless of Supabase success
      clearSessionData();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  };

  return {
    isLoggedIn,
    isEmailVerified,
    verifiedEmail,
    isLoading,
    user,
    accessToken,
    sessionExpiresAt,
    login,
    signup,
    logout,
    refreshSession,
    needsRefresh,
    verifyToken
  };
};

export const useRequireAuth = () => {
  const { isLoggedIn, isLoading, refreshSession, needsRefresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // First check if needs refresh
    if (isLoggedIn && needsRefresh()) {
      refreshSession();
    }
    
    // Then handle redirection for unauthenticated users
    if (!isLoading && !isLoggedIn) {
      navigate("/auth", { state: { from: location.pathname } });
    }
  }, [isLoggedIn, isLoading, navigate, location, needsRefresh, refreshSession]);

  return { isLoggedIn, isLoading };
};
