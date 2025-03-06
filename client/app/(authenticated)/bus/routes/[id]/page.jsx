"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RouteBusesPage({ params }) {
  const router = useRouter();
  const [buses, setBuses] = useState([]);
  const [busStops, setBusStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [busNumberFilter, setBusNumberFilter] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const loadBuses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/bus/buses/route/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setBuses(data.data);

        // Fetch bus stops for the route
        const stopsResponse = await fetch(`http://localhost:8000/api/bus/routes/${params.id}/stops`);
        if (!stopsResponse.ok) {
          throw new Error(`HTTP error! status: ${stopsResponse.status}`);
        }

        const stopsData = await stopsResponse.json();
        setBusStops(stopsData.data);
      } catch (err) {
        console.error("Error fetching buses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBuses();
  }, [params.id]);

  const handleBusClick = (busId) => {
    router.push(`/bus/${busId}`);
  };

  // Filter buses based on criteria
  const filteredBuses = buses.filter(bus => {
    const matchesBusNumber = busNumberFilter ? bus.busNumber.includes(busNumberFilter) : true;
    const matchesCapacity = capacityFilter ? bus.capacity >= Number(capacityFilter) : true;
    const matchesStatus = statusFilter ? (statusFilter === "active" ? bus.isActive : !bus.isActive) : true;
    return matchesBusNumber && matchesCapacity && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-card/40 to-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Route Details
        </h2>
        <p className="text-muted-foreground/80 mt-2 font-mono">Route ID: {params.id}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card/40 to-card hover:from-card/50 hover:to-card/80 transition-all duration-300 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-primary/80">Total Buses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{buses.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card/40 to-card hover:from-card/50 hover:to-card/80 transition-all duration-300 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-primary/80">Active Buses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {buses.filter(bus => bus.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card/40 to-card hover:from-card/50 hover:to-card/80 transition-all duration-300 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-primary/80">Total Stops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{busStops.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className="bg-gradient-to-br from-card/40 to-card hover:from-card/50 hover:to-card/80 transition-all duration-300 border-border/50">
        <CardHeader>
          <CardTitle className="text-primary/80">Filter Buses</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="text"
            placeholder="Filter by Bus Number"
            value={busNumberFilter}
            onChange={(e) => setBusNumberFilter(e.target.value)}
            className="w-full bg-background text-foreground"
          />
          <Input
            type="number"
            placeholder="Minimum Capacity"
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
            className="w-full bg-background text-foreground"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border rounded-md p-2 bg-background text-foreground border-input"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Buses Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-card/40 to-card hover:from-card/50 hover:to-card/80 transition-all duration-300 border-border/50">
            <CardHeader>
              <CardTitle className="text-primary/80">Available Buses</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading buses...</div>
              ) : error ? (
                <div className="text-destructive text-center py-8">Error: {error}</div>
              ) : filteredBuses.length > 0 ? (
                filteredBuses.map((bus) => (
                  <Card 
                    key={bus.id} 
                    className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-background to-card/50 hover:from-card/60 hover:to-card/80 border-border/50 group rounded-xl overflow-hidden"
                    onClick={() => handleBusClick(bus.id)}
                  >
                    <CardContent className="flex justify-between items-center p-4">
                      <div>
                        <h3 className="text-xl font-semibold text-primary/90 group-hover:text-primary transition-colors">
                          Bus {bus.busNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground/80">Capacity: {bus.capacity} seats</p>
                        {bus.description && (
                          <p className="text-sm text-muted-foreground/60 mt-1">{bus.description}</p>
                        )}
                      </div>
                      <Button 
                        variant="outline"
                        className="bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/80 transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/bus/${bus.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No buses available for this route.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bus Stops Section */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-card/40 to-card hover:from-card/50 hover:to-card/80 transition-all duration-300 border-border/50">
            <CardHeader>
              <CardTitle className="text-primary/80">Bus Stops</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {busStops.length > 0 ? (
                busStops.map((stop) => (
                  <Card 
                    key={stop.id} 
                    className="bg-muted/20 hover:bg-muted/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden"
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-lg text-primary/80">{stop.stopName}</h4>
                      <div className="mt-2 space-y-1 text-muted-foreground/80">
                        <div className="flex items-center space-x-2">
                          <span className="text-primary/60">Sequence:</span>
                          <span>{stop.sequence}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-primary/60">Zone:</span>
                          <span>{stop.campusZone}</span>
                        </div>
                        <p className="text-xs bg-muted/30 p-2 rounded-md">
                          Location: {stop.latitude}, {stop.longitude}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No bus stops available for this route.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
