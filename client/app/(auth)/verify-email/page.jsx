"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/stores/auth-store";
import { toast } from "sonner";

/**
 * Email Verification Page
 * This page handles two scenarios:
 * 1. User arrives with a token in URL -> Automatically verify email
 * 2. User arrives without token -> Show instructions to check email
 */
export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const logout = useAuthStore(state => state.logout);
  
  // Verification states
  const [status, setStatus] = useState(token ? "VERIFYING" : "INSTRUCTIONS");
  const [error, setError] = useState(null);
  
  // Auth store - use individual selectors to prevent infinite loops
  const user = useAuthStore(state => state.user);
  const verifyEmail = useAuthStore(state => state.verifyEmail);
  const refreshUser = useAuthStore(state => state.refreshUser);
  
  // Automatically verify when token is present
  useEffect(() => {
    let isMounted = true;
    
    // Only run verification if we have a token and are in VERIFYING state
    if (token && status === "VERIFYING") {
      console.log("🔍 [VERIFY] Starting verification with token");
      
      const verifyToken = async () => {
        try {
          // Call the verification API
          await verifyEmail(token);
          
          if (isMounted) {
            toast.success("Email verified successfully!");
            setStatus("SUCCESS");
          
            // Refresh user data to update verification status
            try {
              await refreshUser();
              console.log("🔍 [VERIFY] User data refreshed after verification");
            } catch (refreshError) {
              console.error("🔍 [VERIFY] Error refreshing user:", refreshError);
              // Still consider verification successful even if refresh fails
            }
            
            // Redirect to dashboard after success - use a shorter delay and ensure it works
            window.location.href = "/dashboard";
          }
        } catch (error) {
          console.error("🔍 [VERIFY] Verification error:", error);
          
          if (isMounted) {
            if (error.response?.status === 410) {
              setError("This verification link has expired. Please request a new one.");
              setStatus("EXPIRED");
            } else if (error.response?.data?.message) {
              setError(error.response.data.message);
              setStatus("ERROR");
            } else {
              setError("Email verification failed. Please try again or request a new link.");
              setStatus("ERROR");
            }
            
            toast.error(error.response?.data?.message || "Email verification failed");
          }
        }
      };
      
      verifyToken();
    }
    
    return () => {
      isMounted = false;
    };
  }, [token, verifyEmail, refreshUser, router, status]);
  
  // Handle manual verification attempt
  const handleVerify = async () => {
    if (!token) {
      toast.error("No verification token found");
      return;
    }
    
    setStatus("VERIFYING");
  };
  
  // Handle requesting a new verification link
  const handleRequestNewLink = () => {
    router.push("/resend-verification");
  };
  
  // =============== RENDER UI BASED ON STATUS ===============
  
  // VERIFYING: Show spinner while verification is in progress
  if (status === "VERIFYING") {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center items-center space-y-4 sm:w-[350px]">
          <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying your email...</p>
        </div>
      </div>
    );
  }
  
  // SUCCESS: Show success message before redirecting
  if (status === "SUCCESS") {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Icons.mailCheck className="mx-auto h-10 w-10 text-green-500" />
            <h1 className="text-2xl font-semibold tracking-tight">Email verified!</h1>
            <p className="text-sm text-muted-foreground">
              Your email has been successfully verified. You'll be redirected to the dashboard.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Icons.spinner className="h-5 w-5 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }
  
  // ERROR: Show error with retry option
  if (status === "ERROR") {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Icons.alertCircle className="mx-auto h-10 w-10 text-red-500" />
            <h1 className="text-2xl font-semibold tracking-tight">Verification failed</h1>
            <p className="text-sm text-muted-foreground">
              {error || "We couldn't verify your email. Please try again."}
            </p>
          </div>
          <Button
            onClick={handleVerify}
            className="w-full mb-2"
          >
            Try again
          </Button>
          <Button
            onClick={handleRequestNewLink}
            variant="outline" 
            className="w-full mb-2"
          >
            Request a new link
          </Button>
          <Button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            variant="ghost"
            className="w-full"
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }
  
  // EXPIRED: Show expired message with new link request
  if (status === "EXPIRED") {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Icons.clock className="mx-auto h-10 w-10 text-orange-500" />
            <h1 className="text-2xl font-semibold tracking-tight">Link expired</h1>
            <p className="text-sm text-muted-foreground">
              This verification link has expired. Please request a new one.
            </p>
          </div>
          <Button
            onClick={handleRequestNewLink}
            className="w-full"
          >
            Request a new link
          </Button>
          <Button
            onClick={() => router.push("/login")}
            variant="outline"
            className="w-full"
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }
  
  // INSTRUCTIONS: Show instructions for checking email (default state without token)
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.mail className="mx-auto h-10 w-10 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We've sent a verification link to your email address. Please check your inbox.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleRequestNewLink} 
            variant="outline" 
            className="w-full"
          >
            Didn't receive an email? Request a new link
          </Button>
          
          <Button
            onClick={() => logout()}
            variant="ghost"
            className="w-full"
          >
            Back to login
          </Button>
        </div>
      </div>
    </div>
  );
}
