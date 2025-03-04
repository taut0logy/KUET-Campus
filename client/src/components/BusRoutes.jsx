"use client";

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Clock, DollarSign, Bus, Route } from "lucide-react";
import useBusStore from "@/stores/bus-store";

const BusRoutes = () => {
  const { routes, loading, error } = useBusStore();

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container space-y-3 py-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container py-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Bus Routes</h2>
        <Badge variant="outline" className="text-sm">
          {routes.length} Routes Available
        </Badge>
      </div>
      
      {routes.map((route) => (
        <Card key={route.id} className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  {route.routeName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  {route.bus.busNumber} - {route.bus.description} 
                  <span className="text-muted-foreground">
                    (Capacity: {route.bus.capacity} seats)
                  </span>
                </CardDescription>
              </div>
              <Badge variant={route.isActive ? "default" : "destructive"}>
                {route.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-medium">{route.startPoint}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-medium">{route.endPoint}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-muted-foreground" />
                  <p><span className="text-muted-foreground">Distance:</span> {route.distance} km</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p><span className="text-muted-foreground">Duration:</span> {route.duration} minutes</p>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p><span className="text-muted-foreground">Fare:</span> ${route.fare}</p>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="stops">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Bus Stops ({route.stops.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Stop No.</TableHead>
                        <TableHead>Stop Name</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {route.stops
                        .sort((a, b) => a.sequence - b.sequence)
                        .map((stop) => (
                          <TableRow key={stop.id}>
                            <TableCell className="font-medium">{stop.sequence}</TableCell>
                            <TableCell>{stop.stopName}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schedule">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Daily Schedule ({route.schedules.length} trips)
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Departure</TableHead>
                        <TableHead>Arrival</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {route.schedules
                        .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime))
                        .map((schedule) => (
                          <TableRow key={schedule.id}>
                            <TableCell>{formatTime(schedule.departureTime)}</TableCell>
                            <TableCell>{formatTime(schedule.arrivalTime)}</TableCell>
                            <TableCell>
                              <Badge variant={schedule.isActive ? "default" : "secondary"}>
                                {schedule.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BusRoutes;
