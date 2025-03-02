"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";
import { CaptchaField } from "@/components/ui/hcaptcha";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  //captchaToken: z.string().min(1, "Please complete the captcha verification")
});

function LoginForm() {
  const login = useAuthStore(state => state.login);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaError, setCaptchaError] = useState("");

  // Initialize form
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      captchaToken: ""
    },
  });

  // Handle form submission
  const onSubmit = async (values) => {
    try {
      setIsLoading(true);

      // if (!values.captchaToken) {
      //   setCaptchaError("Please complete the captcha verification");
      //   setIsLoading(false);
      //   return;
      // }

      // Call login from auth store
      const user = await login(
        values.email, 
        values.password, 
        values.captchaToken || "test-token"
      );
      
      // Show success message
      toast.success("Logged in successfully");
      
      // Redirect based on email verification status
      if (user.emailVerified === false) {
        router.push("/verify-email");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      // Handle different error types
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to log in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle captcha verification
  const handleCaptchaVerify = (token) => {
    form.setValue("captchaToken", token || "");
    setCaptchaError(token ? "" : "Please complete the captcha verification");
  };

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to sign in to your account
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      disabled={isLoading}
                      placeholder="********"
                      type={showPassword ? "text" : "password"}
                      autoCapitalize="none"
                      autoComplete="current-password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <Icons.eyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Icons.eye className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          
          {/* <CaptchaField 
            onVerify={handleCaptchaVerify} 
            error={captchaError}
          /> */}

          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
          </Button>
        </form>
      </Form>
      <div className="px-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="underline underline-offset-4 hover:text-primary"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Suspense fallback={<Icons.spinner className="h-8 w-8 animate-spin" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}