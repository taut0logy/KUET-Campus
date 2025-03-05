"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import useAuthStore from "@/stores/auth-store";
import useAssignmentStore from "@/stores/assignment-store";
import useRoutineStore from "@/stores/routine-store";
import { toast } from "sonner";
import { Calendar, Plus, Trash, X, ChevronRight, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import axios from '@/lib/axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function AssignmentsPage() {
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
  const [selectedStatus, setSelectedStatus] = useState("due");
  
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

  // Add this state for tracking solution generation
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);

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
      // Add status field explicitly
      const assignmentWithStatus = {
        ...newAssignment,
        status: "due"
      };
      
      const createdAssignment = await createAssignment(assignmentWithStatus);
      console.log("Created assignment:", createdAssignment); // Debug log
      
      toast.success("Assignment created successfully");
      setShowAssignmentModal(false);
      setNewAssignment({
        courseId: "",
        assignmentName: "",
        assignmentContent: "",
        deadline: "",
      });
      
      // Refresh assignments to ensure we have the latest data
      fetchAssignments();
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

// Add function to handle status card selection
const handleStatusSelect = (status) => {
  setSelectedStatus(status);
};

// Add function to handle assignment status update
const handleStatusUpdate = async (assignmentId, newStatus) => {
  try {
    await updateAssignment(assignmentId, { status: newStatus });
    toast.success(`Assignment marked as ${newStatus}`);
    setShowContentModal(false);
  } catch (error) {
    toast.error(error.message || "Failed to update assignment status");
  }
};

// Filter assignments based on selected status
const filteredAssignments = assignments.filter(assignment => {
  console.log("Assignment:", assignment.assignmentName, "Status:", assignment.status); // Debug log
  return assignment.status === selectedStatus;
});

// Count assignments by status with fallback to empty array
const assignmentCounts = {
  due: assignments.filter(a => (a.status || "due") === "due").length,
  submitted: assignments.filter(a => a.status === "submitted").length,
  overdued: assignments.filter(a => a.status === "overdued").length
};

// Add this debug log
useEffect(() => {
  console.log("All assignments:", assignments);
  console.log("Filtered assignments:", filteredAssignments);
  console.log("Counts:", assignmentCounts);
}, [assignments, filteredAssignments, assignmentCounts]);

// Add this function to generate a solution using Gemini API
const generateSolution = async () => {
  if (!selectedAssignment) return;
  
  try {
    setIsGeneratingSolution(true);
    
    // Initialize the Gemini API with your API key
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Create prompt from assignment details
    const prompt = `
      I need help solving this assignment:
      
      Assignment: ${selectedAssignment.assignmentName}
      
      Details: ${selectedAssignment.assignmentContent || "No details provided."}
      
      Please provide a detailed solution that I can use as a reference.
    `;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const solution = response.text();
    
    // Append solution to existing content
    const updatedContent = `${editedContent.trim()}
    
## Solution:
${solution}`;
    
    setEditedContent(updatedContent);
    setIsContentEdited(true);
    
    toast.success("Solution generated successfully");
  } catch (error) {
    console.error("Error generating solution:", error);
    toast.error("Failed to generate solution. Please try again.");
  } finally {
    setIsGeneratingSolution(false);
  }
};

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAssignmentModal(true)}
            className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Assignment
          </Button>
        </div>
      </div>

      {/* Status cards with improved styling */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { status: "due", icon: <Clock className="h-5 w-5 mr-2" />, color: "yellow" },
          { status: "submitted", icon: <CheckCircle className="h-5 w-5 mr-2" />, color: "green" },
          { status: "overdued", icon: <AlertTriangle className="h-5 w-5 mr-2" />, color: "red" }
        ].map(({ status, icon, color }) => (
          <Card 
            key={status}
            className={`cursor-pointer transition-all duration-300 border ${
              selectedStatus === status 
                ? status === "due" 
                  ? "border-yellow-500 shadow-md shadow-yellow-500/30 dark:shadow-yellow-400/20 bg-yellow-50/10 dark:bg-yellow-950/20 scale-105"
                  : status === "submitted"
                    ? "border-green-500 shadow-md shadow-green-500/30 dark:shadow-green-400/20 bg-green-50/10 dark:bg-green-950/20 scale-105"
                    : "border-red-500 shadow-md shadow-red-500/30 dark:shadow-red-400/20 bg-red-50/10 dark:bg-red-950/20 scale-105"
                : `border-muted hover:border-${color}-500/50 dark:hover:border-${color}-400/50 hover:shadow-${color}-500/20 dark:hover:shadow-${color}-400/10 hover:scale-105`
            }`}
            onClick={() => handleStatusSelect(status)}
          >
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg capitalize flex items-center ${
                selectedStatus === status 
                  ? status === "due" 
                    ? "text-yellow-600 dark:text-yellow-400"
                    : status === "submitted"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  : ""
              }`}>
                {icon}
                {status}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${
                selectedStatus === status 
                  ? status === "due" 
                    ? "text-yellow-600 dark:text-yellow-400"
                    : status === "submitted"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  : ""
              }`}>{assignmentCounts[status]}</p>
              <p className="text-sm text-muted-foreground">
                {status === "due" ? "Pending assignments" : 
                 status === "submitted" ? "Completed assignments" : 
                 "Missed deadlines"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-10">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-primary/30 rounded-full mb-4"></div>
              <p className="text-muted-foreground">Loading assignments...</p>
            </div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No {selectedStatus} assignments found.</p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <Card 
              key={assignment.id} 
              className={`
                transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer
                ${assignment.status === "submitted"
                  ? "border-green-500/50 dark:border-green-400/50 bg-green-50/10 dark:bg-green-950/20"
                  : assignment.status === "overdued" || isDeadlinePassed(assignment.deadline)
                    ? "border-red-500/50 dark:border-red-400/50 bg-red-50/10 dark:bg-red-950/20"
                    : isDeadlineApproaching(assignment.deadline)
                      ? "border-yellow-500/50 dark:border-yellow-400/50 bg-yellow-50/10 dark:bg-yellow-950/20"
                      : "border-muted hover:border-primary/50 dark:hover:border-primary/70"
                }
              `}
              onClick={() => handleCardClick(assignment)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{assignment.assignmentName}</CardTitle>
                <div className="text-sm font-medium px-2 py-1 rounded-full bg-primary/10 dark:bg-primary/20">
                  {getCourseIdFromCourse(assignment.courseId)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className={
                    assignment.status === "overdued" || isDeadlinePassed(assignment.deadline)
                      ? "text-red-500 dark:text-red-400"
                      : assignment.status === "submitted"
                        ? "text-green-500 dark:text-green-400"
                        : isDeadlineApproaching(assignment.deadline)
                          ? "text-yellow-600 dark:text-yellow-400"
                          : ""
                  }>
                    {formatDeadline(assignment.deadline)}
                    {assignment.status === "overdued" && " (Overdue)"}
                    {assignment.status === "submitted" && " (Completed)"}
                    {assignment.status === "due" && isDeadlineApproaching(assignment.deadline) && " (Soon)"}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" /> View details
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-all duration-300 hover:scale-110"
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

      {/* Add Assignment Modal with improved styling */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-background p-6 rounded-lg w-full max-w-md shadow-xl border border-border dark:border-primary/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Assignment</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full hover:bg-muted transition-all duration-300 hover:scale-110"
                onClick={() => setShowAssignmentModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Course</label>
                <select
                  className="w-full border border-input bg-background p-2.5 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
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
                <label className="block mb-2 text-sm font-medium">Assignment Name</label>
                <input
                  type="text"
                  className="w-full border border-input bg-background p-2.5 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={newAssignment.assignmentName}
                  onChange={(e) => setNewAssignment({...newAssignment, assignmentName: e.target.value})}
                  placeholder="E.g., Midterm Project"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Description (Optional)</label>
                <textarea
                  className="w-full border border-input bg-background p-2.5 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={newAssignment.assignmentContent}
                  onChange={(e) => setNewAssignment({...newAssignment, assignmentContent: e.target.value})}
                  placeholder="Add details about the assignment..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Deadline</label>
                <input
                  type="datetime-local"
                  className="w-full border border-input bg-background p-2.5 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button 
                onClick={handleCreateAssignment}
                className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              >
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAssignmentModal(false)}
                className="transition-all duration-300 hover:scale-105"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Content Modal with improved styling */}
      {showContentModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-background p-6 rounded-lg w-full max-w-2xl shadow-xl border border-border dark:border-primary/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedAssignment.assignmentName}</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full hover:bg-muted transition-all duration-300 hover:scale-110"
                onClick={() => setShowContentModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <span className="text-sm font-medium">Course ID:</span>
                  <span className="ml-2 text-sm">{getCourseIdFromCourse(selectedAssignment.courseId)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Deadline:</span>
                  <span className={`ml-2 text-sm ${
                    isDeadlinePassed(selectedAssignment.deadline) 
                      ? "text-red-500 dark:text-red-400" 
                      : isDeadlineApproaching(selectedAssignment.deadline) 
                        ? "text-yellow-600 dark:text-yellow-400" 
                        : ""
                  }`}>
                    {formatDeadline(selectedAssignment.deadline)}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium">Assignment Details</h3>
                  <Button
                    size="sm"
                    onClick={generateSolution}
                    disabled={isGeneratingSolution}
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 dark:from-indigo-600 dark:to-blue-700 dark:hover:from-indigo-700 dark:hover:to-blue-800 text-white font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20 border-0"
                  >
                    {isGeneratingSolution ? (
                      <span className="flex items-center">
                        <span className="h-3 w-3 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <span className="mr-1.5">✨</span> Quick Solution
                      </span>
                    )}
                  </Button>
                </div>
                <textarea
                  className="w-full bg-muted/30 dark:bg-muted/20 p-4 rounded-md min-h-[200px] border border-input focus:border-primary focus:ring-2 focus:ring-primary/50"
                  value={editedContent}
                  onChange={handleContentChange}
                  placeholder="No description provided for this assignment. Click to add details."
                />
              </div>
              
              {/* Status section with improved styling */}
              <div className="border-t pt-4">
                <h3 className="text-md font-medium mb-3">
                  Status: <span className="capitalize px-2 py-1 ml-2 text-sm rounded-full bg-primary/10 dark:bg-primary/20">{selectedAssignment.status}</span>
                </h3>
                {selectedAssignment.status === "due" && (
                  <Button 
                    onClick={() => handleStatusUpdate(selectedAssignment.id, "submitted")}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-green-500/20 dark:hover:shadow-green-400/20 border-0 flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Mark as Submitted
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <div className="space-x-2">
                {isContentEdited && (
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                    onClick={handleSaveContent}
                  >
                    Save Changes
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="transition-all duration-300 hover:scale-105"
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