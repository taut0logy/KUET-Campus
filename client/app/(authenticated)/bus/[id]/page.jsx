"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Loader,
  AlertTriangle,
  Bus,
  Calendar,
  Clock,
  MapPin,
  Users,
  RefreshCw,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";

// Skeleton loader component for bus details
const BusDetailsSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <Card>
      <CardContent className="space-y-4 p-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </CardContent>
    </Card>
  </div>
);

export default function BusDetailsPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [bus, setBus] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departureTimeFilter, setDepartureTimeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [driverInfo, setDriverInfo] = useState({});

  useEffect(() => {
    const loadBusDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/bus/buses/${resolvedParams.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setBus(data.data.bus);

        const schedulesResponse = await fetch(`http://localhost:8000/api/bus/buses/${resolvedParams.id}/schedules`);
        if (!schedulesResponse.ok) {
          throw new Error(`HTTP error! status: ${schedulesResponse.status}`);
        }

        const schedulesData = await schedulesResponse.json();
        setSchedules(schedulesData.data);

        // Fetch driver information for each schedule
        const driverPromises = schedulesData.data.map(async (schedule) => {
          const driverResponse = await fetch(`http://localhost:8000/api/bus/schedules/${schedule.id}/driver`);
          if (driverResponse.ok) {
            const driverData = await driverResponse.json();
            return { ...schedule, driver: driverData.data };
          }
          return schedule;
        });

        const schedulesWithDrivers = await Promise.all(driverPromises);
        setSchedules(schedulesWithDrivers);
      } catch (err) {
        console.error("Error fetching bus details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBusDetails();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="relative min-h-[600px]">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <BusDetailsSkeleton />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Loader className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Fetching bus details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="animate-in fade-in-50 duration-500">
        <motion.div 
          className="flex flex-col items-center gap-4 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="h-12 w-12 text-destructive animate-pulse" />
          <AlertDescription className="text-lg font-semibold text-destructive">
            {error}
          </AlertDescription>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-2 bg-background/5 backdrop-blur-sm hover:bg-destructive hover:text-white transition-all duration-300"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </motion.div>
      </Alert>
    );
  }

  const filteredSchedules = schedules.filter(schedule => {
    const matchesDepartureTime = departureTimeFilter ? 
      new Date(`1970-01-01T${schedule.departureTime}`).getTime() >= 
      new Date(`1970-01-01T${departureTimeFilter}:00`).getTime() : true;
    const matchesStatus = statusFilter && statusFilter !== "ALL" ? 
      schedule.status === statusFilter : true;
    return matchesDepartureTime && matchesStatus;
  });

  const clearFilters = () => {
    setDepartureTimeFilter("");
    setStatusFilter("ALL");
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="container mx-auto p-6 space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Bus Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden bg-gradient-to-br from-card to-card/50 border-primary/10">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">
                  Bus {bus?.busNumber}
                </CardTitle>
                <Badge 
                  variant={bus?.isActive ? "default" : "secondary"}
                  className={cn(
                    "transition-all duration-500",
                    bus?.isActive && "animate-pulse"
                  )}
                >
                  {bus?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Bus className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">License Plate:</span>
                  <span>{bus?.licensePlate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Capacity:</span>
                  <span>{bus?.capacity} seats</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Type:</span>
                  <span>{bus?.type}</span>
                </div>
                {bus?.description && (
                  <p className="text-sm text-muted-foreground">
                    {bus.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="departureTime">Departure Time</Label>
            <Input
              id="departureTime"
              type="time"
              value={departureTimeFilter}
              onChange={(e) => setDepartureTimeFilter(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Schedules Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Schedules</h3>
          {filteredSchedules.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSchedules.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-card/50 hover:from-card/60 hover:to-card/80 border-border/50">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge 
                          className={cn(
                            "transition-colors duration-300",
                            schedule.status === "SCHEDULED" && "bg-blue-500/20 text-blue-400 dark:text-blue-300",
                            schedule.status === "IN_PROGRESS" && "bg-amber-500/20 text-amber-500 dark:text-amber-300",
                            schedule.status === "COMPLETED" && "bg-green-500/20 text-green-500 dark:text-green-300"
                          )}
                        >
                          {schedule.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground/80 font-mono">
                          #{schedule.id.slice(0, 8)}
                        </span>
                      </div>
                      
                      {/* Schedule details with improved styling */}
                      <div className="space-y-3 divide-y divide-border/30">
                        <div className="grid gap-2 py-2">
                          <div className="flex items-center space-x-2 text-primary/80">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">Schedule Times</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-muted/30 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                              <span className="text-xs text-muted-foreground">Departure</span>
                              <p className="font-medium">{schedule.departureTime}</p>
                            </div>
                            <div className="bg-muted/30 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                              <span className="text-xs text-muted-foreground">Arrival</span>
                              <p className="font-medium">{schedule.arrivalTime}</p>
                            </div>
                          </div>
                        </div>

                        {/* Driver info with improved styling */}
                        <div className="py-2">
                          <div className="bg-muted/20 rounded-lg p-3 hover:bg-muted/30 transition-all">
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="h-4 w-4 text-primary/60" />
                              <span className="text-sm font-medium text-primary/80">Driver Information</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-muted-foreground">Name: {schedule.driver?.driverName}</p>
                              <p className="text-muted-foreground">Contact: {schedule.driver?.driverContact}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <Calendar className="h-12 w-12 text-muted-foreground" />
                <CardTitle>No Schedules Available</CardTitle>
                <p className="text-sm text-muted-foreground max-w-sm">
                  There are currently no schedules matching your filters.
                  Try adjusting your search criteria or check back later.
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            </Card>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
