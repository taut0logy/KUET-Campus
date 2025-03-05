"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useBusStore from "@/stores/bus-store";
import { Badge } from "@/components/ui/badge";

export function BusRoutes() {
  const { routes } = useBusStore();
  const router = useRouter();

  const handleRouteClick = (routeId) => {
    router.push(`/bus/routes/${routeId}`);
  };

  return (
    <div className="p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map(route => (
          <Card 
            key={route.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 border-primary/10"
            onClick={() => handleRouteClick(route.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold">
                  {route.routeName} ({route.routeCode})
                </CardTitle>
                <Badge variant={route.isActive ? "default" : "secondary"}>
                  {route.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="bg-black/5 p-3 rounded-lg space-y-2">
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Start Point:</span>
                  <span className="font-medium">{route.startPoint}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">End Point:</span>
                  <span className="font-medium">{route.endPoint}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="font-medium">{route.distance.toFixed(2)} km</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{route.duration} mins</span>
                </p>
              </div>
              
              <div className="bg-black/5 p-3 rounded-lg space-y-2">
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bus Number:</span>
                  <span className="font-medium">{route.bus.busNumber}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">License Plate:</span>
                  <span className="font-medium">{route.bus.licensePlate}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-medium">{route.bus.capacity} seats</span>
                </p>
              </div>

              <div className="bg-black/5 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">{route.bus.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
