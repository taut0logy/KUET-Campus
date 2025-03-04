"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function BusDetailsPage({ params }) {
  const router = useRouter();
  const [bus, setBus] = useState(null);
  const [schedules, setSchedules] = useState([]); // State for schedules
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [departureTimeFilter, setDepartureTimeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const loadBusDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/bus/buses/${params.id}`); // Call the API endpoint for bus details
        
        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setBus(data.data); // Set the bus data

        // Fetch schedules for the bus
        const schedulesResponse = await fetch(`http://localhost:8000/api/bus/buses/${params.id}/schedules`);
        if (!schedulesResponse.ok) {
          throw new Error(`HTTP error! status: ${schedulesResponse.status}`);
        }

        const schedulesData = await schedulesResponse.json();
        setSchedules(schedulesData.data); // Set the schedules data
      } catch (err) {
        console.error("Error fetching bus details:", err); // Log the error
        setError(err.message); // Set the error message
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    loadBusDetails(); // Call the function to load bus details
  }, [params.id]); // Dependency array to re-run effect when bus ID changes

  if (loading) {
    return <div className="text-center">Loading bus details...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // Filter schedules based on criteria
  const filteredSchedules = schedules.filter(schedule => {
    const matchesDepartureTime = departureTimeFilter ? new Date(schedule.departureTime).toLocaleDateString() === new Date(departureTimeFilter).toLocaleDateString() : true;
    const matchesStatus = statusFilter ? (statusFilter === "active" ? schedule.isActive : !schedule.isActive) : true;
    return matchesDepartureTime && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-4xl font-bold mb-4 text-center">Bus Details for ID: {params.id}</h2>
      {bus && (
        <Card className="mb-6">
          <CardContent>
            <h3 className="text-xl font-semibold">Bus Number: {bus.busNumber}</h3>
            <p>Capacity: {bus.capacity} seats</p>
            <p>Status: {bus.isActive ? "Active" : "Inactive"}</p>
            <p>Description: {bus.description}</p>
            <p>Created At: {new Date(bus.createdAt).toLocaleString()}</p>
            <p>Updated At: {new Date(bus.updatedAt).toLocaleString()}</p>
          </CardContent>
        </Card>
      )}

      {/* Filter Section for Schedules */}
      <h3 className="text-2xl font-bold mt-6">Schedules</h3>
      <div className="mb-4">
        <input
          type="date"
          placeholder="Filter by Departure Date"
          value={departureTimeFilter}
          onChange={(e) => setDepartureTimeFilter(e.target.value)}
          className="border rounded p-2 mr-2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {filteredSchedules.length > 0 ? (
        filteredSchedules.map((schedule) => (
          <Card key={schedule.id} className="mt-2">
            <CardContent>
              <h4 className="text-lg font-semibold">Schedule ID: {schedule.id}</h4>
              <p>Departure Time: {new Date(schedule.departureTime).toLocaleString()}</p>
              <p>Arrival Time: {new Date(schedule.arrivalTime).toLocaleString()}</p>
              <p>Status: {schedule.status}</p>
              <p>Route: {schedule.route.routeName}</p>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No schedules available for this bus.</p>
      )}
    </div>
  );
}