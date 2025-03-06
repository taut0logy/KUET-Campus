"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2, Bus, Plus } from "lucide-react";
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

  useEffect(() => {
    fetchBuses();
    fetchDrivers(); // Fetch drivers when the component mounts
  }, []);

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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Bus Management</h2>
        <Button onClick={() => setShowAddBusModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Bus
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bus List</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingBuses ? (
            <div>Loading...</div>
          ) : errorBuses ? (
            <div className="text-red-500">{errorBuses}</div>
          ) : (
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
                {buses.map((bus) => (
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
        </CardContent>
      </Card>

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

      {/* Driver Management Section */}
      <div className="flex items-center justify-between space-y-2 mt-8">
        <h2 className="text-3xl font-bold tracking-tight">Driver Management</h2>
        <Button onClick={() => setShowAddDriverModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Driver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Driver List</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingBuses ? (
            <div>Loading...</div>
          ) : errorBuses ? (
            <div className="text-red-500">{errorBuses}</div>
          ) : (
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
                {drivers.map((driver) => (
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
        </CardContent>
      </Card>

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
    </div>
  );
}
