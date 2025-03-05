"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar } from "lucide-react";
import Image from "next/image";

export default function SchedulesPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Academic Schedules</h1>
      <p className="text-muted-foreground mb-8">
        Manage your academic schedules, class routines, and assignments.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative group">
          <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-20 transition-opacity">

          </div>
          <div className="relative z-10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Class and Exam Schedules
              </CardTitle>
              <CardDescription>
                View and manage your class and exam schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Access your weekly class schedule, check upcoming classes, and stay organized with your exam timetable.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => router.push("/schedules/routine")}
                className="transition-all duration-300 hover:scale-105"
              >
                View Routine
              </Button>
            </CardFooter>
          </div>
        </Card>

        <Card className="shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative group">
          <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-20 transition-opacity">
           
          </div>
          <div className="relative z-10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                Assignments
              </CardTitle>
              <CardDescription>
                Track and manage your academic assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Keep track of all your assignments, submission deadlines, and progress to ensure you never miss an important deadline.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => router.push("/schedules/assignments")}
                className="transition-all duration-300 hover:scale-105"
              >
                View Assignments
              </Button>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  );
} 