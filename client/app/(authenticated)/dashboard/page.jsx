"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/auth-store";
import { BarChart, Bell, BookOpen, Bus, Calendar, Coffee, GraduationCap } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const quickLinks = [
    {
      title: "Academic Schedules",
      description: "View class routines and assignments",
      icon: GraduationCap,
      href: "/schedules",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Notices & Announcements",
      description: "Stay updated with latest announcements",
      icon: Bell,
      href: "/notices",
      color: "bg-amber-100 text-amber-700"
    },
    {
      title: "Bus Schedule",
      description: "Check bus timings and routes",
      icon: Bus,
      href: "/bus",
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Cafeteria",
      description: "View menu and meal options",
      icon: Coffee,
      href: "/cafeteria",
      color: "bg-purple-100 text-purple-700"
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName || 'User'}!</h1>
      <p className="text-muted-foreground mb-8">
        Here's an overview of your campus resources and activities.
      </p>

      <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(link.href)}>
            <CardHeader className="pb-2">
              <div className={`w-10 h-10 rounded-full ${link.color} flex items-center justify-center mb-2`}>
                <link.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{link.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{link.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent announcements.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push('/notices')}>View All Announcements</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No upcoming deadlines.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push('/schedules/assignments')}>View All Assignments</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
