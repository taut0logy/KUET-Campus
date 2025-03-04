"use client";

import { Card, CardContent } from "@/components/ui/card";
import useBusStore from "@/stores/bus-store";

export function BusRoutes() {
  const { routes } = useBusStore();

  return (
    <div className="grid gap-4">
      {routes.map((route) => (
        <Card key={route.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{route.name}</h3>
                <p className="text-sm text-muted-foreground">
                  From: {route.startPoint} - To: {route.endPoint}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  Distance: {route.distance} km
                </p>
                <p className="text-sm text-muted-foreground">
                  Duration: {route.duration} mins
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {routes.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No routes available
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}