"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
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
import { useAuth } from "@/components/providers/auth-provider";
import { CaptchaField } from "@/components/ui/hcaptcha";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  //captchaToken: z.string().min(1, "Please complete the captcha verification")
});

function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [captchaError, setCaptchaError] = useState("");

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      captchaToken: ""
    },
  });

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);

      // if (!values.captchaToken) {
      //   setCaptchaError("Please complete the captcha verification");
      //   setIsLoading(false);
      //   return;
      // }

      await requestPasswordReset(values.email, values.captchaToken);
      setEmailSent(true);
      toast.success("If an account with that email exists, we've sent password reset instructions.");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaVerify = (token) => {
    form.setValue("captchaToken", token || "");
    setCaptchaError(token ? "" : "Please complete the captcha verification");
  };

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a password reset link
        </p>
      </div>

      {emailSent ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Icons.mailCheck className="h-12 w-12 text-primary" />
          <p className="text-center text-sm">
            We've sent you an email with instructions to reset your password.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      ) : (
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

            {/* <CaptchaField 
              onVerify={handleCaptchaVerify} 
              error={captchaError}
            /> */}

            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Reset Instructions
            </Button>
          </form>
        </Form>
      )}
      <div className="px-8 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="underline underline-offset-4 hover:text-primary"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Suspense fallback={<Icons.spinner className="h-8 w-8 animate-spin" />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
} 