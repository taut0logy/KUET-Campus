"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function RouteBusesPage({ params }) {
  const router = useRouter();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBuses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/bus/buses/route/${params.id}`); // Call the API endpoint
        
        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setBuses(data.data); // Set the buses data
      } catch (err) {
        console.error("Error fetching buses:", err); // Log the error
        setError(err.message); // Set the error message
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    loadBuses(); // Call the function to load buses
  }, [params.id]); // Dependency array to re-run effect when route ID changes

  if (loading) {
    return <div>Loading buses...</div>; // Loading state
  }

  if (error) {
    return <div>Error: {error}</div>; // Error state
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Buses for Route ID: {params.id}</h2>
      <div className="grid gap-4">
        {buses.map((bus) => (
          <Card key={bus.id}>
            <CardContent>
              <h3 className="text-lg font-semibold">Bus {bus.busNumber}</h3>
              <p>Capacity: {bus.capacity} seats</p>
              <p>Status: {bus.isActive ? "Active" : "Inactive"}</p>
              <p>Description: {bus.description}</p>
            </CardContent>
          </Card>
        ))}
        {buses.length === 0 && (
          <Card>
            <CardContent>
              <p>No buses available for this route.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 