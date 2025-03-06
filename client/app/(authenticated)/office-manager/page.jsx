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
  const { buses, loading, error, fetchBuses } = useBusStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [formData, setFormData] = useState({
    busNumber: "",
    licensePlate: "",
    capacity: "",
    type: "SHUTTLE"
  });

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/v1/bus/buses', {
        method: showEditModal ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(showEditModal ? 
          { ...formData, id: selectedBus.id } : 
          formData
        ),
      });

      if (!response.ok) throw new Error('Failed to save bus');

      toast.success(`Bus ${showEditModal ? 'updated' : 'added'} successfully`);
      fetchBuses();
      handleCloseModal();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (busId) => {
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

  const handleEdit = (bus) => {
    setSelectedBus(bus);
    setFormData({
      busNumber: bus.busNumber,
      licensePlate: bus.licensePlate,
      capacity: bus.capacity,
      type: bus.type
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedBus(null);
    setFormData({
      busNumber: "",
      licensePlate: "",
      capacity: "",
      type: "SHUTTLE"
    });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Bus Management</h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Bus
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bus List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus Number</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Type</TableHead>
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
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(bus)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(bus.id)}>
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

      <Dialog open={showAddModal || showEditModal} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showEditModal ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label>Bus Number</label>
              <Input
                value={formData.busNumber}
                onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>License Plate</label>
              <Input
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label>Capacity</label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <label>Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {showEditModal ? 'Update' : 'Add'} Bus
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
