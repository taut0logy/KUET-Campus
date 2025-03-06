"use client";

import { useEffect, useState } from "react";
import { BusList } from "@/components/bus/BusList";
import { BusRoutes } from "@/components/bus/BusRoutes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useBusStore from "@/stores/bus-store";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight, Bus, Users, Clock, AlertCircle, Route, Info } from "lucide-react";

export default function BusPage() {
  const { buses, fetchBuses, fetchRoutes } = useBusStore();
  const [schedules, setSchedules] = useState([]);
  const [routeDetails, setRouteDetails] = useState({});
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchBuses(), fetchRoutes(), fetchSchedules()]);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/bus/schedules");
      const data = await response.json();
      if (data.success) {
        setSchedules(data.data);
        await fetchRouteDetails(data.data);
      } else {
        console.error("Failed to fetch schedules:", data.message);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const fetchRouteDetails = async (schedules) => {
    const routePromises = schedules.map(async (schedule) => {
      try {
        const response = await fetch(`http://localhost:8000/api/bus/routes/${schedule.routeId}`);
        const data = await response.json();
        if (data.success) {
          setRouteDetails((prev) => ({
            ...prev,
            [schedule.routeId]: data.data,
          }));
        }
      } catch (error) {
        console.error(`Error fetching route details for ${schedule.routeId}:`, error);
      }
    });
    await Promise.all(routePromises);
  };

  // Ensure buses is an array before using filter
  const activeBuses = Array.isArray(buses) ? buses.filter(bus => bus.isActive) : [];
  const totalCapacity = buses.reduce((sum, bus) => sum + bus.capacity, 0);

  return (
    <div className="h-full">
      {/* Header Section */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">Bus Management System</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card/40 to-card hover:from-card/50 hover:to-card/80 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Total Fleet</CardTitle>
              <Bus className="h-4 w-4 text-primary/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{buses.length}</div>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Buses in fleet
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card/40 to-card hover:from-card/50 hover:to-card/80 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Active Buses</CardTitle>
              <Users className="h-4 w-4 text-primary/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeBuses.length}</div>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Currently in service
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card/40 to-card hover:from-card/50 hover:to-card/80 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Total Capacity</CardTitle>
              <Users className="h-4 w-4 text-primary/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalCapacity}</div>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Passenger seats
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Active Fleet Status</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <BusList />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Important Announcement </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add quick stats content */}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Bus Schedules
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage and monitor all bus schedules
                </p>
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.map(schedule => (
                <Card 
                  key={schedule.id} 
                  className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-background to-card/50 hover:from-card/60 hover:to-card/80 border-border/50 rounded-xl overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      {/* Status and Bus Number Header */}
                      <div className="flex justify-between items-start">
                        <Badge 
                          className={cn(
                            "transition-colors duration-300 font-medium",
                            schedule.status === "SCHEDULED" && "bg-blue-500/20 text-blue-400 dark:text-blue-300",
                            schedule.status === "IN_PROGRESS" && "bg-amber-500/20 text-amber-500 dark:text-amber-300",
                            schedule.status === "COMPLETED" && "bg-green-500/20 text-green-500 dark:text-green-300"
                          )}
                        >
                          {schedule.status}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-muted-foreground" />
                          <Link 
                            href={`/bus/${schedule.bus.id}`}
                            className="text-sm font-medium hover:text-primary transition-colors"
                          >
                            #{schedule.bus.busNumber}
                          </Link>
                        </div>
                      </div>

                      {/* Route Information */}
                      {routeDetails[schedule.routeId] && (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Route Details</div>
                          <Link 
                            href={`/bus/routes/${schedule.routeId}`}
                            className="block bg-muted/30 p-3 rounded-lg hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">From</span>
                                <span className="text-sm font-medium">{routeDetails[schedule.routeId].startPoint}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">To</span>
                                <span className="text-sm font-medium">{routeDetails[schedule.routeId].endPoint}</span>
                              </div>
                              {routeDetails[schedule.routeId].distance && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Route className="h-4 w-4" />
                                  <span>{routeDetails[schedule.routeId].distance} km</span>
                                </div>
                              )}
                            </div>
                          </Link>
                        </div>
                      )}

                      {/* Schedule Times */}
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Schedule Times</div>
                        <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">Departure</span>
                          </div>
                          <span className="font-medium">{schedule.departureTime}</span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">Arrival</span>
                          </div>
                          <span className="font-medium">{schedule.arrivalTime}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          className="w-1/2 hover:bg-primary/10 transition-colors duration-300"
                          asChild
                        >
                          <Link href={`/bus/${schedule.bus.id}`}>
                            <Bus className="h-4 w-4 mr-2" />
                            Bus Details
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-1/2" asChild>
                          <Link href={`/bus/routes/${schedule.routeId}`}>
                            <Route className="h-4 w-4 mr-2" />
                            Route Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {schedules.length === 0 && (
                <Card className="col-span-full p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-muted-foreground" />
                    <CardTitle>No Schedules Found</CardTitle>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      There are currently no schedules matching your filters.
                      Try adjusting your search criteria or check back later.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes">
            <Card>
              <CardHeader>
                <CardTitle>Bus Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <BusRoutes />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
