"use client";

import { useEffect, useState } from "react";
import { BusList } from "@/components/bus/BusList";
import { BusRoutes } from "@/components/bus/BusRoutes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useBusStore from "@/stores/bus-store";
import Link from "next/link";

export default function BusPage() {
  const { buses, fetchBuses, fetchRoutes } = useBusStore();
  const [schedules, setSchedules] = useState([]);
  const [routeDetails, setRouteDetails] = useState({});

  useEffect(() => {
    // Initial data fetch
    const fetchData = async () => {
      try {
        await Promise.all([fetchBuses(), fetchRoutes(), fetchSchedules()]);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
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
            <BusRoutes />
          </TabsContent>
          <TabsContent value="schedules">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold">Bus Schedules</h2>
                <ul className="space-y-2">
                  {schedules
                    .sort((a, b) => {
                      return new Date(`1970-01-01T${a.departureTime}:00`) - new Date(`1970-01-01T${b.departureTime}:00`);
                    })
                    .map(schedule => (
                      <li key={schedule.id} className="border p-4 rounded">
                        <p><strong>Bus Number:</strong> {schedule.bus.busNumber}</p>
                        <p><strong>Driver:</strong> {schedule.driver.firstName} {schedule.driver.lastName}</p>
                        <p><strong>Departure Time:</strong> {schedule.departureTime}</p>
                        <p><strong>Arrival Time:</strong> {schedule.arrivalTime}</p>
                        <p><strong>Available Seats:</strong> {schedule.availableSeats}</p>
                        {routeDetails[schedule.routeId] && (
                          <>
                            <p><strong>Route Name:</strong> {routeDetails[schedule.routeId].routeName}</p>
                            <p><strong>Start Point:</strong> {routeDetails[schedule.routeId].startPoint}</p>
                            <p><strong>End Point:</strong> {routeDetails[schedule.routeId].endPoint}</p>
                          </>
                        )}
                        <Link href={`/bus/${schedule.bus.id}`}>
                          <button className="mt-2 bg-blue-500 text-white rounded px-2 py-1">
                            View Bus Details
                          </button>
                        </Link>
                        <Link href={`/bus/routes/${schedule.routeId}`}>
                          <button className="mt-2 bg-green-500 text-white rounded px-2 py-1">
                            View Route Details
                          </button>
                        </Link>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
