"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useAuthStore from "@/stores/auth-store";
import useAnnouncementStore from "@/stores/announcement-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Trash2, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboardPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { announcements, loading, error, fetchAnnouncements, createAnnouncement, deleteAnnouncement } = useAnnouncementStore();
  
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: ""
  });
  
  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!user || !user.roles?.includes("ADMIN")) {
      router.push("/dashboard");
    }
  }, [user, router]);
  
  // Fetch announcements when component mounts
  useEffect(() => {
    if (user?.roles?.includes("ADMIN")) {
      fetchAnnouncements().catch(err => {
        console.error("Failed to fetch announcements:", err);
        toast.error("Failed to fetch announcements");
      });
    }
  }, [user, fetchAnnouncements]);
  
  // If no user or not admin, show nothing while redirecting
  if (!user || !user.roles?.includes("ADMIN")) {
    return null;
  }
  
  const handleCreateAnnouncement = async () => {
    try {
      if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
        toast.error("Please fill in all fields");
        return;
      }
      
      const result = await createAnnouncement(newAnnouncement);
      toast.success(`Announcement created and sent to ${result.notificationsSent} users`);
      setShowAnnouncementModal(false);
      setNewAnnouncement({ title: "", message: "" });
    } catch (error) {
      console.error("Failed to create announcement:", error);
      toast.error(error.message || "Failed to create announcement");
    }
  };
  
  const handleDeleteAnnouncement = async (id) => {
    try {
      await deleteAnnouncement(id);
      toast.success("Announcement deleted successfully");
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      toast.error(error.message || "Failed to delete announcement");
    }
  };
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        
        <Dialog open={showAnnouncementModal} onOpenChange={setShowAnnouncementModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              <span>Add Announcement</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                This announcement will be sent to all users as a notification and email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  placeholder="Announcement title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea
                  id="message"
                  placeholder="Announcement message"
                  rows={5}
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAnnouncementModal(false)}>Cancel</Button>
              <Button onClick={handleCreateAnnouncement} disabled={loading}>
                {loading ? "Creating..." : "Create & Send"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Announcements
            </CardTitle>
            <CardDescription>
              Manage announcements that will be sent to all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading announcements...</div>
            ) : error ? (
              <div className="text-center py-4 text-destructive">{error}</div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No announcements yet</p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAnnouncementModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create your first announcement
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* <CardDescription>
                        {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                        {announcement.user && ` • By ${announcement.user.firstName} ${announcement.user.lastName}`}
                      </CardDescription> */}
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line">{announcement.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Announcements are sent as notifications and emails to all users
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}