import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, LogIn, UserPlus, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (loginEmail.endsWith("@utdallas.edu")) {
      // For UTD email domains, show verification step
      setVerifiedEmail(loginEmail);
      setShowVerification(true);
      setIsLoading(false);
      
      // In a real app, this would trigger an email with verification code
      toast({
        title: "Verification code sent",
        description: "Please check your UTD email for the verification code.",
      });
    } else {
      // Non-UTD emails can bypass verification for this demo
      proceedWithLogin();
    }
  };

  const handleVerifyCode = () => {
    setIsLoading(true);
    
    // This is a mock implementation - in a real app, you'd validate the code with a backend
    setTimeout(() => {
      if (verificationCode.length === 6) {
        // Store verified status in localStorage
        localStorage.setItem("isEmailVerified", "true");
        localStorage.setItem("verifiedEmail", verifiedEmail);
        
        toast({
          title: "Email verified!",
          description: "Your UTD email has been verified.",
        });
        
        proceedWithLogin();
      } else {
        toast({
          title: "Invalid verification code",
          description: "Please enter the 6-digit code sent to your email.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }, 1000);
  };
  
  const proceedWithLogin = () => {
    // Store a simple flag in localStorage to indicate user is logged in
    localStorage.setItem("isLoggedIn", "true");
    
    toast({
      title: "Login successful!",
      description: "Welcome back to UTD Events.",
    });
    
    setIsLoading(false);
    navigate("/events");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (signupEmail.endsWith("@utdallas.edu")) {
      // For UTD email domains, show verification step
      setVerifiedEmail(signupEmail);
      setShowVerification(true);
      setIsLoading(false);
      
      // In a real app, this would trigger an email with verification code
      toast({
        title: "Verification code sent",
        description: "Please check your UTD email for the verification code.",
      });
    } else {
      // For non-UTD emails, proceed with signup directly
      completeSignup();
    }
  };
  
  const completeSignup = () => {
    // This is a mock implementation - in a real app, you'd create an account with a backend
    setTimeout(() => {
      // Store a simple flag in localStorage to indicate user is logged in
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isEmailVerified", "true");
      localStorage.setItem("verifiedEmail", verifiedEmail);
      
      toast({
        title: "Account created!",
        description: "Welcome to UTD Events.",
      });
      
      setIsLoading(false);
      navigate("/events");
    }, 1000);
  };

  // Return to login form
  const handleBackToLogin = () => {
    setShowVerification(false);
    setVerificationCode("");
    setIsLoading(false);
  };

  if (showVerification) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-background to-muted">
        {/* App Logo/Name */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-medium mb-2">
            <span className="font-bold">i</span>mpulse
          </h1>
          <p className="text-muted-foreground">UTD Student-Led Events Platform</p>
        </div>

        {/* Verification Container */}
        <div className="w-full max-w-md bg-card rounded-lg shadow-lg border border-border p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 text-primary mb-3">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Verify Your Email</h2>
            <p className="text-muted-foreground mt-2">
              We've sent a verification code to {verifiedEmail}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleVerifyCode}
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
            
            <div className="text-center">
              <button 
                type="button" 
                className="text-sm text-primary hover:underline" 
                onClick={handleBackToLogin}
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-background to-muted">
      {/* App Logo/Name */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-medium mb-2">
          <span className="font-bold">i</span>mpulse
        </h1>
        <p className="text-muted-foreground">UTD Student-Led Events Platform</p>
      </div>

      {/* Auth Container */}
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg border border-border p-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@utdallas.edu" 
                    className="pl-10"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "Logging in..."
                ) : (
                  <>
                    Login <LogIn className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Signup Form */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="name"
                    type="text" 
                    placeholder="John Doe" 
                    className="pl-10"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="signup-email"
                    type="email" 
                    placeholder="name@utdallas.edu" 
                    className="pl-10"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="signup-password"
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="confirm-password"
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "Creating account..."
                ) : (
                  <>
                    Create Account <UserPlus className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>

      {/* Guest Entry */}
      <div className="mt-6">
        <Button 
          variant="outline" 
          onClick={() => {
            localStorage.setItem("isLoggedIn", "true");
            navigate("/events");
          }}
          className="flex items-center gap-2"
        >
          Continue as Guest <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AuthPage;
