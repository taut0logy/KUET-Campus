"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function BusDetailsPage({ params }) {
  const router = useRouter();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    return <div>Loading bus details...</div>; // Loading state
  }

  if (error) {
    return <div>Error: {error}</div>; // Error state
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Bus Details for ID: {params.id}</h2>
      {bus && (
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Bus Number: {bus.busNumber}</h3>
            <p>Capacity: {bus.capacity} seats</p>
            <p>Status: {bus.isActive ? "Active" : "Inactive"}</p>
            <p>Description: {bus.description}</p>
            <p>Created At: {new Date(bus.createdAt).toLocaleString()}</p>
            <p>Updated At: {new Date(bus.updatedAt).toLocaleString()}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}