"use client";

import * as React from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, 
         AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, 
         AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, 
         SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { AlertTriangle, Bell, Info } from "lucide-react";
import { toast } from "sonner";
import axios from '@/lib/axios';

export function EmergencyAlert() {
  const [isActive, setIsActive] = React.useState(true);
  const [alertMessage, setAlertMessage] = React.useState("");

  const handleEmergencyAlert = async () => {
    try {
      // Validate message
      if (!alertMessage.trim()) {
        toast.error("Please provide emergency details");
        return;
      }
      
      // Send the emergency alert
      await axios.post("/emergency/alert", { message: alertMessage });
      
      // Show success message
      toast.success("Emergency alert triggered successfully");
      
      // Reset the form
      setAlertMessage("");
    } catch (error) {
      console.error("Emergency alert error:", error);
      toast.error("Failed to trigger alert: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
      {/* Status Badge */}
      <Badge 
        variant={isActive ? "default" : "destructive"}
        className="mb-8 text-base py-2"
      >
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isActive ? 'animate-pulse bg-green-500' : 'bg-red-500'}`} />
          System {isActive ? 'Active - Ready' : 'Inactive'}
        </div>
      </Badge>

      {/* Main Content */}
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Campus Emergency Alert</h1>
        <p className="text-muted-foreground text-lg">
          Press the button below to trigger an immediate campus-wide emergency alert
        </p>

        {/* Emergency Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="destructive"
                size="lg"
                className="w-64 h-64 rounded-full text-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
              >
                <div className="flex flex-col items-center gap-4">
                  <AlertTriangle className="h-16 w-16" />
                  EMERGENCY
                  <span className="text-base font-normal">Click to Activate</span>
                </div>
              </Button>
            </motion.div>
          </AlertDialogTrigger>

          <AlertDialogContent className="sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Confirm Emergency Alert
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action will trigger an immediate campus-wide emergency alert. 
                This cannot be undone. Are you sure you want to proceed?
              </AlertDialogDescription>
              <Textarea
                placeholder="Optional: Add emergency details (location, type of emergency, etc.)"
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                className="mt-4"
              />
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button 
                variant="destructive"
                onClick={handleEmergencyAlert}
              >
                Trigger Alert
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Footer */}
        <footer className="mt-12 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Info className="h-4 w-4" />
            Emergency Contact: Campus Security (123) 456-7890
          </div>
        </footer>
      </div>
    </div>
  );
}
