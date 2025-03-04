"use client";

import { useEffect } from "react";
import { BusList } from "@/components/bus/BusList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useBusStore from "@/stores/bus-store";

export default function BusPage() {
  const { buses, routes, fetchBuses, fetchRoutes } = useBusStore();

  useEffect(() => {
    // Initial data fetch
    const fetchData = async () => {
      try {
        await Promise.all([fetchBuses(), fetchRoutes()]);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchData();
  }, []); // Remove dependencies to prevent multiple fetches

  const activeBuses = buses.filter(bus => bus.isActive);
  const totalCapacity = buses.reduce((sum, bus) => sum + bus.capacity, 0);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buses.length}</div>
              <p className="text-xs text-muted-foreground">
                Available in fleet
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBuses.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently in service
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCapacity}</div>
              <p className="text-xs text-muted-foreground">
                Total passenger seats
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bus Information Tabs */}
        <Tabs defaultValue="buses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="buses">Buses</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
          </TabsList>
          <TabsContent value="buses" className="space-y-4">
            <BusList />
          </TabsContent>
          <TabsContent value="routes">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Route information coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="schedules">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Schedule information coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
