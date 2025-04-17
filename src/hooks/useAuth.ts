
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoggedIn(!!session);
        
        if (session?.user) {
          setVerifiedEmail(session.user.email || "");
          setIsEmailVerified(session.user.email_confirmed_at !== null);
          
          // Get JWT token for API authentication
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          setToken(currentSession?.access_token ?? null);
        } else {
          setVerifiedEmail("");
          setIsEmailVerified(false);
          setToken(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
      
      if (session?.user) {
        setVerifiedEmail(session.user.email || "");
        setIsEmailVerified(session.user.email_confirmed_at !== null);
        setToken(session.access_token);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error };
    }
  };
  
  const signup = async (email: string, password: string, metadata?: { name?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error };
    }
  };
  
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  return { 
    isLoggedIn, 
    isEmailVerified, 
    verifiedEmail, 
    isLoading, 
    user,
    token,  // New property to access JWT token
    login, 
    signup,
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
