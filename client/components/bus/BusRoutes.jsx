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
    <div className="bg-black p-4 min-h-screen">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map(route => (
          <Card 
            key={route.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-green-500 to-green-300 rounded-lg transform hover:scale-105"
            onClick={() => handleRouteClick(route.id)}
          >
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">{route.routeName} ({route.routeCode})</CardTitle>
              <Badge variant={route.isActive ? "default" : "secondary"} className="animate-pulse">
                {route.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardHeader>
            <CardContent className="text-gray-200">
              <p><strong>Start Point:</strong> {route.startPoint}</p>
              <p><strong>End Point:</strong> {route.endPoint}</p>
              <p><strong>Distance:</strong> {route.distance.toFixed(2)} km</p>
              <p><strong>Duration:</strong> {route.duration} mins</p>
              <p><strong>Bus Number:</strong> {route.bus.busNumber}</p>
              <p><strong>License Plate:</strong> {route.bus.licensePlate}</p>
              <p><strong>Capacity:</strong> {route.bus.capacity} seats</p>
              <p><strong>Description:</strong> {route.bus.description}</p>
            </CardContent>
          </Card>
        ))}
        {routes.length === 0 && (
          <Card className="flex items-center justify-center p-6">
            <CardContent>
              <p className="text-center text-gray-500">No routes available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}