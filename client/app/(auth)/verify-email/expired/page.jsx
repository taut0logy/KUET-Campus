"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Expired() {
  const router = useRouter();

  const handleBack = async () => {
    router.push("/verify-email");
  };

  return (
    <div className="mx-auto flex w-full flex-col justify-center items-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Verification link expired
        </h1>
        <p className="text-sm text-muted-foreground">
          Please request a new verification link.
        </p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    </div>
  );
}
