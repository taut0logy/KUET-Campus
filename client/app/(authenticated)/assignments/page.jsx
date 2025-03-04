"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import useAuthStore from "@/stores/auth-store";
import useAssignmentStore from "@/stores/assignment-store";
import useRoutineStore from "@/stores/routine-store";
import { toast } from "sonner";
import { Calendar, Plus, Trash, X, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import axios from '@/lib/axios';

export function AssignmentsPage() {
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [isContentEdited, setIsContentEdited] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    courseId: "",
    assignmentName: "",
    assignmentContent: "",
    deadline: ""
  });
  
  const { user } = useAuthStore();
  const { 
    assignments, 
    loading, 
    error,
    fetchAssignments,
    createAssignment,
    deleteAssignment,
    updateAssignment
  } = useAssignmentStore();
  
  const { courses, fetchCourses } = useRoutineStore();

  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchCourses();
    }
  }, [user, fetchAssignments, fetchCourses]);

  useEffect(() => {
    if (selectedAssignment) {
      setEditedContent(selectedAssignment.assignmentContent || "");
      setIsContentEdited(false);
    }
  }, [selectedAssignment]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setEditedContent(newContent);
    setIsContentEdited(newContent !== (selectedAssignment?.assignmentContent || ""));
  };

  const handleSaveContent = async () => {
    try {
      await updateAssignment(selectedAssignment.id, {
        assignmentContent: editedContent
      });
      
      // Update the selected assignment in state
      setSelectedAssignment({
        ...selectedAssignment,
        assignmentContent: editedContent
      });
      
      setIsContentEdited(false);
      toast.success("Assignment updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update assignment");
    }
  };


  const handleCreateAssignment = async () => {
    try {
      await createAssignment(newAssignment);
      toast.success("Assignment created successfully");
      setShowAssignmentModal(false);
      setNewAssignment({
        courseId: "",
        assignmentName: "",
        assignmentContent: "",
        deadline: ""
      });
    } catch (error) {
      toast.error(error.message || "Failed to create assignment");
    }
  };
  
  const handleDeleteAssignment = async (id) => {
    try {
      await deleteAssignment(id);
      toast.success("Assignment deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete assignment");
    }
  };
  
  const handleCardClick = (assignment) => {
    setSelectedAssignment(assignment);
    setShowContentModal(true);
  };
  
  // Function to format the deadline
  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    return format(date, "PPP 'at' p"); // e.g., "April 29th, 2023 at 2:30 PM"
  };
  
  // Function to check if deadline is approaching (within 2 days)
  const isDeadlineApproaching = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
  };
  
  // Function to check if deadline is passed
  const isDeadlinePassed = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < now;
  };

  // Find course ID from the course object
  const getCourseIdFromCourse = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.courseId : "Unknown";
  };

  // Add this function to check for approaching deadlines and send notifications
// In client/app/(authenticated)/assignments/page.jsx


// Inside your AssignmentsPage component:

//Simplified deadline check function
const checkAndNotifyDeadlines = () => {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  assignments.forEach(assignment => {
    const deadline = new Date(assignment.deadline);
    
    // Check if deadline is within 24 hours and in the future
    if (deadline <= in24Hours && deadline > now) {
      // Show a direct toast notification
      toast.warning(`Assignment Deadline Alert`, {
        description: `"${assignment.assignmentName}" is due within 24 hours`,
        duration: 10000, // 10 seconds
      });
      
      console.log("Deadline notification triggered for:", assignment.assignmentName);
    }
  });
};

// Add this useEffect to run the check when assignments change
useEffect(() => {
  if (assignments.length > 0) {
    console.log("Checking deadlines for", assignments.length, "assignments");
    checkAndNotifyDeadlines();
  }
}, [assignments]);

// Inside your AssignmentsPage component:

// // Add this useEffect for continuous deadline checking
// useEffect(() => {
//   // Check immediately when assignments load
//   if (assignments.length > 0) {
//     checkAndNotifyDeadlines();
//   }
  
//   // Set up an interval to check every minute
//   const intervalId = setInterval(() => {
//     if (assignments.length > 0) {
//       checkAndNotifyDeadlines();
//     }
//   }, 60000); // Check every minute
  
//   // Clean up the interval when component unmounts
//   return () => clearInterval(intervalId);
// }, [assignments]); // Re-establish interval when assignments change

// // Improved deadline check function
// const checkAndNotifyDeadlines = () => {
//   const now = new Date();
//   const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
//   // Keep track of notified assignments to prevent duplicate notifications
//   const notifiedAssignments = new Set(
//     JSON.parse(localStorage.getItem('notifiedAssignments') || '[]')
//   );
  
//   assignments.forEach(assignment => {
//     const deadline = new Date(assignment.deadline);
    
//     // Check if deadline is within 24 hours and in the future
//     if (deadline <= in24Hours && deadline > now) {
//       // Check if we've already notified for this assignment
//       if (!notifiedAssignments.has(assignment.id)) {
//         // Show toast notification
//         toast.warning(`Assignment Deadline Alert`, {
//           description: `"${assignment.assignmentName}" is due within 24 hours`,
//           duration: 10000, // 10 seconds
//         });
        
//         // Add to notified set and save to localStorage
//         notifiedAssignments.add(assignment.id);
//         localStorage.setItem(
//           'notifiedAssignments', 
//           JSON.stringify(Array.from(notifiedAssignments))
//         );
//       }
//     }
//   });
// };
 
// Inside your AssignmentsPage component:

// Add state to track timers and notified assignments
const [deadlineTimers, setDeadlineTimers] = useState({});
const [notifiedAssignments, setNotifiedAssignments] = useState(
  new Set(JSON.parse(localStorage.getItem('notifiedAssignments') || '[]'))
);

// Function to send notification and email for an assignment
const notifyAssignmentDeadline = async (assignment) => {
  try {
    // Call the API to send notification and email
    await axios.post('/assignments/notify-deadline', {
      assignmentId: assignment.id
    });
    
    // Show toast notification in the UI
    toast.warning(`Assignment Deadline Alert`, {
      description: `"${assignment.assignmentName}" is due within 24 hours`,
      duration: 10000,
    });
    
    // Update local storage to prevent duplicate notifications
    const updatedNotified = new Set(notifiedAssignments);
    updatedNotified.add(assignment.id);
    setNotifiedAssignments(updatedNotified);
    localStorage.setItem(
      'notifiedAssignments', 
      JSON.stringify(Array.from(updatedNotified))
    );
    
    console.log(`Notification sent for "${assignment.assignmentName}"`);
  } catch (error) {
    console.error('Failed to send deadline notification:', error);
    toast.error('Failed to send deadline notification');
  }
};

// Function to schedule notifications at exactly the right time
const scheduleDeadlineNotifications = () => {
  // Clear any existing timers
  Object.values(deadlineTimers).forEach(timer => clearTimeout(timer));
  const newTimers = {};
  
  assignments.forEach(assignment => {
    // Skip if already notified
    if (notifiedAssignments.has(assignment.id) || assignment.notifiedFor24HourDeadline) {
      return;
    }
    
    const deadline = new Date(assignment.deadline);
    const notificationTime = new Date(deadline.getTime() - 24 * 60 * 60 * 1000); // 24 hours before deadline
    const now = new Date();
    
    // Only schedule if the notification time is in the future
    if (notificationTime > now) {
      const timeUntilNotification = notificationTime.getTime() - now.getTime();
      
      console.log(`Scheduling notification for "${assignment.assignmentName}" in ${Math.round(timeUntilNotification/1000/60)} minutes`);
      
      // Schedule the notification
      newTimers[assignment.id] = setTimeout(() => {
        notifyAssignmentDeadline(assignment);
      }, timeUntilNotification);
    } 
    // If the deadline is within 24 hours but we haven't notified yet
    else if (deadline > now && notificationTime <= now) {
      // Notify immediately
      notifyAssignmentDeadline(assignment);
    }
  });
  
  setDeadlineTimers(newTimers);
};

// Set up the notification schedule when assignments change
useEffect(() => {
  if (assignments.length > 0) {
    scheduleDeadlineNotifications();
  }
  
  // Clean up timers when component unmounts
  return () => {
    Object.values(deadlineTimers).forEach(timer => clearTimeout(timer));
  };
}, [assignments, notifiedAssignments]);


  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowAssignmentModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Assignment
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No assignments yet. Click "Add Assignment" to create one.</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <Card 
              key={assignment.id} 
              className={`
                ${isDeadlinePassed(assignment.deadline) ? "border-red-300" : 
                  isDeadlineApproaching(assignment.deadline) ? "border-yellow-300" : ""}
                cursor-pointer hover:shadow-md transition-shadow
              `}
              onClick={() => handleCardClick(assignment)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{assignment.assignmentName}</CardTitle>
                <div className="text-sm font-medium text-muted-foreground">
                  {getCourseIdFromCourse(assignment.courseId)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className={
                    isDeadlinePassed(assignment.deadline) 
                      ? "text-red-500" 
                      : isDeadlineApproaching(assignment.deadline) 
                        ? "text-yellow-600" 
                        : ""
                  }>
                    {formatDeadline(assignment.deadline)}
                    {isDeadlinePassed(assignment.deadline) && " (Overdue)"}
                    {!isDeadlinePassed(assignment.deadline) && isDeadlineApproaching(assignment.deadline) && " (Soon)"}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <ChevronRight className="h-4 w-4 inline" /> Click to view details
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAssignment(assignment.id);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Add Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add New Assignment</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAssignmentModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Course</label>
                <select
                  className="w-full border p-2 rounded"
                  value={newAssignment.courseId}
                  onChange={(e) => setNewAssignment({...newAssignment, courseId: e.target.value})}
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.courseId} - {course.courseName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Assignment Name</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={newAssignment.assignmentName}
                  onChange={(e) => setNewAssignment({...newAssignment, assignmentName: e.target.value})}
                  placeholder="E.g., Midterm Project"
                />
              </div>
              <div>
                <label className="block mb-1">Description (Optional)</label>
                <textarea
                  className="w-full border p-2 rounded"
                  value={newAssignment.assignmentContent}
                  onChange={(e) => setNewAssignment({...newAssignment, assignmentContent: e.target.value})}
                  placeholder="Add details about the assignment..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block mb-1">Deadline</label>
                <input
                  type="datetime-local"
                  className="w-full border p-2 rounded"
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={handleCreateAssignment}>Save</Button>
              <Button variant="ghost" onClick={() => setShowAssignmentModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Content Modal */}
      {showContentModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{selectedAssignment.assignmentName}</h2>
              
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <span className="text-sm font-medium">Course ID:</span>
                  <span className="ml-2 text-sm">{getCourseIdFromCourse(selectedAssignment.courseId)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Deadline:</span>
                  <span className={`ml-2 text-sm ${
                    isDeadlinePassed(selectedAssignment.deadline) 
                      ? "text-red-500" 
                      : isDeadlineApproaching(selectedAssignment.deadline) 
                        ? "text-yellow-600" 
                        : ""
                  }`}>
               {formatDeadline(selectedAssignment.deadline)}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-md font-medium mb-2">Assignment Details</h3>
                <textarea
                  className="w-full bg-muted p-4 rounded-md min-h-[150px] border border-transparent focus:border-primary"
                  value={editedContent}
                  onChange={handleContentChange}
                  placeholder="No description provided for this assignment. Click to add details."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <div className="space-x-2">
                {isContentEdited && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleSaveContent}
                  >
                    Save Changes
                  </Button>
                )}
             <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowContentModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentsPage;