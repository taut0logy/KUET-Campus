"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar } from "lucide-react";

export default function SchedulesPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Academic Schedules</h1>
      <p className="text-muted-foreground mb-8">
        Manage your academic schedules, class routines, and assignments.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Class Routine
            </CardTitle>
            <CardDescription>
              View and manage your class schedules and routines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Access your weekly class schedule, check upcoming classes, and stay organized with your academic timetable.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/schedules/routine")}>
              View Routine
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
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
            <Button onClick={() => router.push("/schedules/assignments")}>
              View Assignments
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 