"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

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
      <div className="bg-card rounded-lg p-6 shadow-md">
        <h2 className="text-3xl font-bold text-card-foreground">Route Details</h2>
        <p className="text-muted-foreground mt-2">Route ID: {params.id}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-card-foreground">Total Buses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{buses.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-card-foreground">Active Buses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {buses.filter(bus => bus.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-card-foreground">Total Stops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{busStops.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Filter Buses</CardTitle>
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
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Available Buses</CardTitle>
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
                    onClick={() => handleBusClick(bus.id)} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-card"
                  >
                    <CardContent className="flex justify-between items-center p-4">
                      <div>
                        <h3 className="text-xl font-semibold text-card-foreground">Bus {bus.busNumber}</h3>
                        <p className="text-sm text-muted-foreground">Capacity: {bus.capacity} seats</p>
                        {bus.description && (
                          <p className="text-sm text-muted-foreground mt-1">{bus.description}</p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full ${
                        bus.isActive 
                          ? 'bg-green-500/20 text-green-500 dark:bg-green-500/30 dark:text-green-400' 
                          : 'bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-destructive-foreground'
                      }`}>
                        {bus.isActive ? "Active" : "Inactive"}
                      </div>
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
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Bus Stops</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {busStops.length > 0 ? (
                busStops.map((stop) => (
                  <Card key={stop.id} className="bg-muted">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-lg text-card-foreground">{stop.stopName}</h4>
                      <div className="mt-2 space-y-1 text-muted-foreground">
                        <p>Sequence: {stop.sequence}</p>
                        <p>Zone: {stop.campusZone}</p>
                        <p className="text-xs">
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
