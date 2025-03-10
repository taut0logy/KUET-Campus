"use client";

import { useState } from "react";
import { Protected } from "@/components/ui/protected";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChatRequestsTable from "@/components/faculty/chat-requests-table";
import { Separator } from "@/components/ui/separator";

export default function FacultyDashboardPage() {
  return (
    <Protected requiredRole="FACULTY">
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your courses, students, and communication.
          </p>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="chat-requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chat-requests">Chat Requests</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat-requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Chat Requests</CardTitle>
                <CardDescription>
                  View and manage student chat requests. Approve or reject requests as needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatRequestsTable />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Courses</CardTitle>
                <CardDescription>
                  Manage your courses and course materials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Course management functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>
                  View and manage students in your courses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Student management functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>
                  View and manage your teaching schedule.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Schedule management functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Protected>
  );
} 