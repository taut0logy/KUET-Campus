"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useBusStore from "@/stores/bus-store";

export default function BusDetailsPage({ params }) {
  const router = useRouter();
  const { buses, fetchBuses } = useBusStore();
  const [bus, setBus] = useState(null);

  useEffect(() => {
    const loadBus = async () => {
      if (buses.length === 0) {
        await fetchBuses();
      }
      const foundBus = buses.find(b => b.id === params.id);
      setBus(foundBus);
    };
    loadBus();
  }, [params.id, buses, fetchBuses]);

  if (!bus) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading bus details...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => router.back()}
      >
        ← Back to Buses
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bus {bus.busNumber}</span>
            <Badge variant={bus.isActive ? "success" : "secondary"}>
              {bus.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Capacity</h3>
              <p className="text-lg">{bus.capacity} seats</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
              <p className="text-lg">{bus.isActive ? "In Service" : "Out of Service"}</p>
            </div>
          </div>

          {bus.description && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Description</h3>
              <p className="text-gray-700">{bus.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}