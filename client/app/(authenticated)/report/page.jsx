
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    batch: '',
    roll: '',
    title: '',
    reportType: '',
    description: ''
  });

  const fetchReports = async () => {
    try {
      const response = await axios.get('/reports');
      setReports(response.data.data.reports);
    } catch (error) {
      toast.error('Failed to fetch reports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert batch and roll to numbers
      const reportData = {
        ...formData,
        batch: parseInt(formData.batch),
        roll: parseInt(formData.roll)
      };

      await axios.post('/reports', reportData);
      toast.success('Report created successfully');
      setIsDialogOpen(false);
      // Reset form
      setFormData({
        name: '',
        department: '',
        batch: '',
        roll: '',
        title: '',
        reportType: '',
        description: ''
      });
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create report');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Report</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="batch">Batch</Label>
                <Input
                  id="batch"
                  name="batch"
                  type="number"
                  value={formData.batch}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="roll">Roll</Label>
                <Input
                  id="roll"
                  name="roll"
                  type="number"
                  value={formData.roll}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Input
                  id="reportType"
                  name="reportType"
                  value={formData.reportType}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Submit</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Roll</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Report Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.name}</TableCell>
              <TableCell>{report.department}</TableCell>
              <TableCell>{report.batch}</TableCell>
              <TableCell>{report.roll}</TableCell>
              <TableCell>{report.title}</TableCell>
              <TableCell>{report.reportType}</TableCell>
              <TableCell>{report.description}</TableCell>
              <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
