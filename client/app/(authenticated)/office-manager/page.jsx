"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2, Bus, Plus, Route, Clock } from "lucide-react";
import useBusStore from "@/stores/bus-store";

export default function OfficeManagerPage() {
  const { buses, loading: loadingBuses, error: errorBuses, fetchBuses, drivers, fetchDrivers, createDriver, updateDriver, deleteDriver } = useBusStore();
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [showEditBusModal, setShowEditBusModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [busFormData, setBusFormData] = useState({
    busNumber: "",
    licensePlate: "",
    capacity: "",
    type: "SHUTTLE",
    isActive: true,
    description: ""
  });

  // Driver state
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverFormData, setDriverFormData] = useState({
    firstName: "",
    lastName: "",
    licenseNumber: "",
    phone: "",
    isAvailable: true,
    description: ""
  });

  // New state for routes and schedules
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showEditRouteModal, setShowEditRouteModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [routeFormData, setRouteFormData] = useState({
    routeName: "",
    routeCode: "",
    startPoint: "",
    endPoint: "",
    distance: "",
    duration: "",
    direction: "CLOCKWISE",
    isActive: true,
    busId: "",
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    busId: "",
    routeId: "",
    driverId: "",
    departureTime: "",
    arrivalTime: "",
    isRecurring: false,
    frequency: "DAILY",
    status: "SCHEDULED",
    totalCapacity: 50,
    availableSeats: 50,
  });

  // Add new states for active view and pagination
  const [activeView, setActiveView] = useState('bus'); // 'bus', 'driver', 'route', 'schedule'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  useEffect(() => {
    fetchBuses();
    fetchDrivers();
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/bus/routes');
      if (!response.ok) throw new Error('Failed to fetch routes');
      const data = await response.json();
      setRoutes(data.data);
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleBusSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/v1/bus/buses' + (showEditBusModal ? `/${selectedBus.id}` : ''), {
        method: showEditBusModal ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(showEditBusModal ? 
          { ...busFormData } : 
          busFormData
        ),
      });

      if (!response.ok) throw new Error('Failed to save bus');

      toast.success(`Bus ${showEditBusModal ? 'updated' : 'added'} successfully`);
      fetchBuses();
      handleCloseBusModal();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showEditDriverModal) {
        await updateDriver(selectedDriver.id, driverFormData);
        toast.success('Driver updated successfully');
      } else {
        await createDriver(driverFormData);
        toast.success('Driver added successfully');
      }
      fetchDrivers(); // Refresh the driver list
      handleCloseDriverModal();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteBus = async (busId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/bus/buses/${busId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete bus');

      toast.success('Bus deleted successfully');
      fetchBuses();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteDriver = async (driverId) => {
    try {
      await deleteDriver(driverId);
      toast.success('Driver deleted successfully');
      fetchDrivers(); // Refresh the driver list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditBus = (bus) => {
    setSelectedBus(bus);
    setBusFormData({
      busNumber: bus.busNumber,
      licensePlate: bus.licensePlate,
      capacity: bus.capacity,
      type: bus.type,
      isActive: bus.isActive,
      description: bus.description
    });
    setShowEditBusModal(true);
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setDriverFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      licenseNumber: driver.licenseNumber,
      phone: driver.phone,
      isAvailable: driver.isAvailable,
      description: driver.description
    });
    setShowEditDriverModal(true);
  };

  const handleCloseBusModal = () => {
    setShowAddBusModal(false);
    setShowEditBusModal(false);
    setSelectedBus(null);
    setBusFormData({
      busNumber: "",
      licensePlate: "",
      capacity: "",
      type: "SHUTTLE",
      isActive: true,
      description: ""
    });
  };

  const handleCloseDriverModal = () => {
    setShowAddDriverModal(false);
    setShowEditDriverModal(false);
    setSelectedDriver(null);
    setDriverFormData({
      firstName: "",
      lastName: "",
      licenseNumber: "",
      phone: "",
      isAvailable: true,
      description: ""
    });
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/v1/bus/routes' + (showEditRouteModal ? `/${selectedRoute.id}` : ''), {
        method: showEditRouteModal ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeFormData),
      });

      if (!response.ok) throw new Error('Failed to save route');

      toast.success(`Route ${showEditRouteModal ? 'updated' : 'added'} successfully`);
      fetchRoutes();
      handleCloseRouteModal();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/v1/bus/schedules' + (showEditScheduleModal ? `/${selectedSchedule.id}` : ''), {
        method: showEditScheduleModal ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleFormData),
      });

      if (!response.ok) throw new Error('Failed to save schedule');

      toast.success(`Schedule ${showEditScheduleModal ? 'updated' : 'added'} successfully`);
      fetchRoutes();
      handleCloseScheduleModal();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteRoute = async (routeId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/bus/routes/${routeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete route');

      toast.success('Route deleted successfully');
      fetchRoutes();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/bus/schedules/${scheduleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete schedule');

      toast.success('Schedule deleted successfully');
      fetchRoutes();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditRoute = (route) => {
    setSelectedRoute(route);
    setRouteFormData({
      routeName: route.routeName,
      routeCode: route.routeCode,
      startPoint: route.startPoint,
      endPoint: route.endPoint,
      distance: route.distance,
      duration: route.duration,
      direction: route.direction,
      isActive: route.isActive,
      busId: route.busId,
    });
    setShowEditRouteModal(true);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleFormData({
      busId: schedule.busId,
      routeId: schedule.routeId,
      driverId: schedule.driverId,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      isRecurring: schedule.isRecurring,
      frequency: schedule.frequency,
      status: schedule.status,
      totalCapacity: schedule.totalCapacity,
      availableSeats: schedule.availableSeats,
    });
    setShowEditScheduleModal(true);
  };

  const handleCloseRouteModal = () => {
    setShowAddRouteModal(false);
    setShowEditRouteModal(false);
    setSelectedRoute(null);
    setRouteFormData({
      routeName: "",
      routeCode: "",
      startPoint: "",
      endPoint: "",
      distance: "",
      duration: "",
      direction: "CLOCKWISE",
      isActive: true,
      busId: "",
    });
  };

  const handleCloseScheduleModal = () => {
    setShowAddScheduleModal(false);
    setShowEditScheduleModal(false);
    setSelectedSchedule(null);
    setScheduleFormData({
      busId: "",
      routeId: "",
      driverId: "",
      departureTime: "",
      arrivalTime: "",
      isRecurring: false,
      frequency: "DAILY",
      status: "SCHEDULED",
      totalCapacity: 50,
      availableSeats: 50,
    });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Management Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-transform duration-200 hover:scale-105 ${activeView === 'bus' ? 'border-primary' : ''}`}
          onClick={() => setActiveView('bus')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bus Management</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buses.length}</div>
            <p className="text-xs text-muted-foreground">Total Buses</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-transform duration-200 hover:scale-105 ${activeView === 'driver' ? 'border-primary' : ''}`}
          onClick={() => setActiveView('driver')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver Management</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">Total Drivers</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-transform duration-200 hover:scale-105 ${activeView === 'route' ? 'border-primary' : ''}`}
          onClick={() => setActiveView('route')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Route Management</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
            <p className="text-xs text-muted-foreground">Total Routes</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-transform duration-200 hover:scale-105 ${activeView === 'schedule' ? 'border-primary' : ''}`}
          onClick={() => setActiveView('schedule')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule Management</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.flatMap(route => route.schedules).length}</div>
            <p className="text-xs text-muted-foreground">Total Schedules</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold tracking-tight">
            {activeView === 'bus' && 'Bus List'}
            {activeView === 'driver' && 'Driver List'}
            {activeView === 'route' && 'Route List'}
            {activeView === 'schedule' && 'Schedule List'}
          </h2>
          <Button onClick={() => {
            if (activeView === 'bus') setShowAddBusModal(true);
            if (activeView === 'driver') setShowAddDriverModal(true);
            if (activeView === 'route') setShowAddRouteModal(true);
            if (activeView === 'schedule') setShowAddScheduleModal(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {activeView === 'bus' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bus Number</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData(buses).map((bus) => (
                    <TableRow key={bus.id}>
                      <TableCell>{bus.busNumber}</TableCell>
                      <TableCell>{bus.licensePlate}</TableCell>
                      <TableCell>{bus.capacity}</TableCell>
                      <TableCell>{bus.type}</TableCell>
                      <TableCell>{bus.isActive ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{bus.description}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditBus(bus)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteBus(bus.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeView === 'driver' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData(drivers).map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>{driver.firstName}</TableCell>
                      <TableCell>{driver.lastName}</TableCell>
                      <TableCell>{driver.licenseNumber}</TableCell>
                      <TableCell>{driver.phone}</TableCell>
                      <TableCell>{driver.isAvailable ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditDriver(driver)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteDriver(driver.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeView === 'route' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route Name</TableHead>
                    <TableHead>Route Code</TableHead>
                    <TableHead>Start Point</TableHead>
                    <TableHead>End Point</TableHead>
                    <TableHead>Distance (km)</TableHead>
                    <TableHead>Duration (min)</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData(routes).map((route) => (
                    <TableRow key={route.id}>
                      <TableCell>{route.routeName}</TableCell>
                      <TableCell>{route.routeCode}</TableCell>
                      <TableCell>{route.startPoint}</TableCell>
                      <TableCell>{route.endPoint}</TableCell>
                      <TableCell>{route.distance}</TableCell>
                      <TableCell>{route.duration}</TableCell>
                      <TableCell>{route.direction}</TableCell>
                      <TableCell>{route.isActive ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditRoute(route)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteRoute(route.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeView === 'schedule' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Bus</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData(routes.flatMap(route => route.schedules)).map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>{routes.find(r => r.id === schedule.routeId)?.routeName}</TableCell>
                      <TableCell>{buses.find(b => b.id === schedule.busId)?.busNumber}</TableCell>
                      <TableCell>{drivers.find(d => d.id === schedule.driverId)?.firstName}</TableCell>
                      <TableCell>{schedule.departureTime}</TableCell>
                      <TableCell>{schedule.arrivalTime}</TableCell>
                      <TableCell>{schedule.status}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditSchedule(schedule)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteSchedule(schedule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {getTotalPages(
              activeView === 'bus' ? buses :
              activeView === 'driver' ? drivers :
              activeView === 'route' ? routes :
              routes.flatMap(route => route.schedules)
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === getTotalPages(
              activeView === 'bus' ? buses :
              activeView === 'driver' ? drivers :
              activeView === 'route' ? routes :
              routes.flatMap(route => route.schedules)
            )}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={showAddBusModal || showEditBusModal} onOpenChange={handleCloseBusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showEditBusModal ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBusSubmit} className="space-y-4">
            <div className="space-y-2">
              <label>Bus Number</label>
              <Input
                value={busFormData.busNumber}
                onChange={(e) => setBusFormData({ ...busFormData, busNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>License Plate</label>
              <Input
                value={busFormData.licensePlate}
                onChange={(e) => setBusFormData({ ...busFormData, licensePlate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label>Capacity</label>
              <Input
                type="number"
                value={busFormData.capacity}
                onChange={(e) => setBusFormData({ ...busFormData, capacity: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>Type</label>
              <Select
                value={busFormData.type}
                onValueChange={(value) => setBusFormData({ ...busFormData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bus type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHUTTLE">Shuttle</SelectItem>
                  <SelectItem value="MINIBUS">Minibus</SelectItem>
                  <SelectItem value="ARTICULATED">Articulated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>
                <input
                  type="checkbox"
                  checked={busFormData.isActive}
                  onChange={(e) => setBusFormData({ ...busFormData, isActive: e.target.checked })}
                />
                Is Active
              </label>
            </div>
            <div className="space-y-2">
              <label>Description</label>
              <Input
                value={busFormData.description}
                onChange={(e) => setBusFormData({ ...busFormData, description: e.target.value })}
                placeholder="Enter bus description"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseBusModal}>
                Cancel
              </Button>
              <Button type="submit">
                {showEditBusModal ? 'Update' : 'Add'} Bus
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDriverModal || showEditDriverModal} onOpenChange={handleCloseDriverModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showEditDriverModal ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDriverSubmit} className="space-y-4">
            <div className="space-y-2">
              <label>First Name</label>
              <Input
                value={driverFormData.firstName}
                onChange={(e) => setDriverFormData({ ...driverFormData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>Last Name</label>
              <Input
                value={driverFormData.lastName}
                onChange={(e) => setDriverFormData({ ...driverFormData, lastName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>License Number</label>
              <Input
                value={driverFormData.licenseNumber}
                onChange={(e) => setDriverFormData({ ...driverFormData, licenseNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>Phone</label>
              <Input
                value={driverFormData.phone}
                onChange={(e) => setDriverFormData({ ...driverFormData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label>
                <input
                  type="checkbox"
                  checked={driverFormData.isAvailable}
                  onChange={(e) => setDriverFormData({ ...driverFormData, isAvailable: e.target.checked })}
                />
                Is Available
              </label>
            </div>
            <div className="space-y-2">
              <label>Description</label>
              <Input
                value={driverFormData.description}
                onChange={(e) => setDriverFormData({ ...driverFormData, description: e.target.value })}
                placeholder="Enter driver description"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDriverModal}>
                Cancel
              </Button>
              <Button type="submit">
                {showEditDriverModal ? 'Update' : 'Add'} Driver
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddRouteModal || showEditRouteModal} onOpenChange={handleCloseRouteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showEditRouteModal ? 'Edit Route' : 'Add New Route'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRouteSubmit} className="space-y-4">
            <div className="space-y-2">
              <label>Route Name</label>
              <Input
                value={routeFormData.routeName}
                onChange={(e) => setRouteFormData({ ...routeFormData, routeName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>Route Code</label>
              <Input
                value={routeFormData.routeCode}
                onChange={(e) => setRouteFormData({ ...routeFormData, routeCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label>Start Point</label>
              <Input
                value={routeFormData.startPoint}
                onChange={(e) => setRouteFormData({ ...routeFormData, startPoint: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>End Point</label>
              <Input
                value={routeFormData.endPoint}
                onChange={(e) => setRouteFormData({ ...routeFormData, endPoint: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>Distance (km)</label>
              <Input
                type="number"
                step="0.1"
                value={routeFormData.distance}
                onChange={(e) => setRouteFormData({ ...routeFormData, distance: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>Duration (minutes)</label>
              <Input
                type="number"
                value={routeFormData.duration}
                onChange={(e) => setRouteFormData({ ...routeFormData, duration: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>Direction</label>
              <Select
                value={routeFormData.direction}
                onValueChange={(value) => setRouteFormData({ ...routeFormData, direction: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLOCKWISE">Clockwise</SelectItem>
                  <SelectItem value="COUNTER_CLOCKWISE">Counter Clockwise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Bus</label>
              <Select
                value={routeFormData.busId}
                onValueChange={(value) => setRouteFormData({ ...routeFormData, busId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bus" />
                </SelectTrigger>
                <SelectContent>
                  {buses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.busNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>
                <input
                  type="checkbox"
                  checked={routeFormData.isActive}
                  onChange={(e) => setRouteFormData({ ...routeFormData, isActive: e.target.checked })}
                />
                Is Active
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseRouteModal}>
                Cancel
              </Button>
              <Button type="submit">
                {showEditRouteModal ? 'Update' : 'Add'} Route
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddScheduleModal || showEditScheduleModal} onOpenChange={handleCloseScheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showEditScheduleModal ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label>Route</label>
              <Select
                value={scheduleFormData.routeId}
                onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, routeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.routeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Bus</label>
              <Select
                value={scheduleFormData.busId}
                onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, busId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bus" />
                </SelectTrigger>
                <SelectContent>
                  {buses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.busNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Driver</label>
              <Select
                value={scheduleFormData.driverId}
                onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, driverId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {`${driver.firstName} ${driver.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Departure Time</label>
              <Input
                type="time"
                value={scheduleFormData.departureTime}
                onChange={(e) => setScheduleFormData({ ...scheduleFormData, departureTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>Arrival Time</label>
              <Input
                type="time"
                value={scheduleFormData.arrivalTime}
                onChange={(e) => setScheduleFormData({ ...scheduleFormData, arrivalTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>Status</label>
              <Select
                value={scheduleFormData.status}
                onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="DELAYED">Delayed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>
                <input
                  type="checkbox"
                  checked={scheduleFormData.isRecurring}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, isRecurring: e.target.checked })}
                />
                Is Recurring
              </label>
            </div>
            {scheduleFormData.isRecurring && (
              <div className="space-y-2">
                <label>Frequency</label>
                <Select
                  value={scheduleFormData.frequency}
                  onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKDAYS">Weekdays</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseScheduleModal}>
                Cancel
              </Button>
              <Button type="submit">
                {showEditScheduleModal ? 'Update' : 'Add'} Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
