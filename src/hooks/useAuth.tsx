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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoggedIn(!!session);
        
        if (session?.user) {
          setVerifiedEmail(session.user.email || "");
          setIsEmailVerified(session.user.email_confirmed_at !== null);
        } else {
          setVerifiedEmail("");
          setIsEmailVerified(false);
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
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validateEmail = (email: string) => {
    if (!email.endsWith("@utdallas.edu")) {
      throw new Error("Only @utdallas.edu emails are allowed");
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      validateEmail(email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password");
        } else if (error.message.toLowerCase().includes("user not found")) {
          throw new Error("No account exists with this email");
        }
        throw error;
      }
      
      return { success: true, data };
    } catch (error: any) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: {
          message: error.message || "Login failed"
        }
      };
    }
  };
  
  const signup = async (email: string, password: string, metadata?: { name?: string }) => {
    try {
      validateEmail(email);
      validatePassword(password);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) {
        if (error.message.toLowerCase().includes("email already exists")) {
          throw new Error("Account with this email already exists");
        }
        throw error;
      }
      
      return { success: true, data };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { 
        success: false, 
        error: {
          message: error.message || "Registration failed"
        }
      };
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
