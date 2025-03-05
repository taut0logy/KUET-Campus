"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function RouteBusesPage({ params }) {
  const router = useRouter();
  const [buses, setBuses] = useState([]);
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

  if (loading) {
    return <div className="text-center">Loading buses...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-4xl font-bold mb-6 text-center text-gray-800">Buses for Route ID: {params.id}</h2>
      
      {/* Filter Section */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by Bus Number"
          value={busNumberFilter}
          onChange={(e) => setBusNumberFilter(e.target.value)}
          className="border rounded p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Minimum Capacity"
          value={capacityFilter}
          onChange={(e) => setCapacityFilter(e.target.value)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuses.map((bus) => (
          <Card key={bus.id} onClick={() => handleBusClick(bus.id)} className="cursor-pointer hover:shadow-lg transition-shadow duration-300 transform hover:scale-105">
            <CardContent className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">Bus {bus.busNumber}</h3>
              <p className="text-sm text-gray-600">Capacity: {bus.capacity} seats</p>
              <p className={`text-sm ${bus.isActive ? 'text-green-500' : 'text-red-500'}`}>{bus.isActive ? "Active" : "Inactive"}</p>
              <p className="text-sm text-gray-500">{bus.description}</p>
            </CardContent>
          </Card>
        ))}
        {filteredBuses.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <Card>
              <CardContent>
                <p className="text-center text-gray-500">No buses available for this route.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 
