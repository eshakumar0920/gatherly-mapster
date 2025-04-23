
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const { toast } = useToast();

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = window.localStorage.getItem("impulse_access_token");
    const email = window.localStorage.getItem("impulse_user_email");
    if (token && email) {
      setIsLoggedIn(true);
      setAccessToken(token);
      setVerifiedEmail(email);
      setUser({ email });
      setIsEmailVerified(true); // No email_confirmed_at in custom backend, assume true after login
    }
    setIsLoading(false);
  }, []);

  // Verify user token if needed
  const verify = async (token: string) => {
    try {
      const resp = await fetch("/auth/verify", {
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

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Login failed");
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
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...metadata })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Signup failed");
      }
      return { success: true, data };
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
    logout
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
