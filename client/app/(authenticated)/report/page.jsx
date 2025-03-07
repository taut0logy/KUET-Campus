
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from '@/lib/axios';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Calendar, User, BookOpen, School, Hash, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function ReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
    setIsSubmitting(true);
    try {
      const reportData = {
        ...formData,
        batch: parseInt(formData.batch),
        roll: parseInt(formData.roll)
      };

      await axios.post('/reports', reportData);
      toast.success('Report created successfully');
      setIsDialogOpen(false);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Reports
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-9 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
              </DialogHeader>
              
              <ScrollArea className="h-[60vh] w-full pr-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter report title"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                        <Input
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          placeholder="e.g., CSE"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="batch">Batch <span className="text-red-500">*</span></Label>
                        <Input
                          id="batch"
                          name="batch"
                          type="number"
                          value={formData.batch}
                          onChange={handleInputChange}
                          placeholder="e.g., 19"
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="roll">Roll <span className="text-red-500">*</span></Label>
                        <Input
                          id="roll"
                          name="roll"
                          type="number"
                          value={formData.roll}
                          onChange={handleInputChange}
                          placeholder="e.g., 1234"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="reportType">Report Type <span className="text-red-500">*</span></Label>
                      <Input
                        id="reportType"
                        name="reportType"
                        value={formData.reportType}
                        onChange={handleInputChange}
                        placeholder="e.g., Lab Report"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Write your report description here..."
                        className="min-h-[150px] resize-none"
                        required
                      />
                    </div>
                  </div>
                </form>
              </ScrollArea>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Reports Found</h2>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No reports match your search criteria.' : 'Start by creating your first report.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Report
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl line-clamp-1">{report.title}</CardTitle>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="px-2 py-1 bg-primary/10 rounded-md font-medium text-primary">
                    {report.reportType}
                  </span>
                  <span className="px-2 py-1 bg-secondary/10 rounded-md font-medium text-secondary">
                    {report.department}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground line-clamp-3">{report.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{report.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <School className="h-4 w-4" />
                    <span>Batch {report.batch}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    <span>Roll {report.roll}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={report.createdAt}>
                    {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </time>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
