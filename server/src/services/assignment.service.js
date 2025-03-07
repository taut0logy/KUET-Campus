const { prisma } = require('./database.service');

// ... existing code ...
// ... existing code ...
const createAssignment = async (userId, assignmentData) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Extract courseId from assignmentData and ensure it exists
    const { courseId, ...otherData } = assignmentData;
    
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    
    // Check if the course exists and belongs to the user
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        userId: userId
      }
    });
    
    if (!course) {
      throw new Error('Course not found or you do not have permission to add assignments to it');
    }
    
    // Ensure status is set to "due" by default
    const dataToCreate = {
      ...otherData,
      status: otherData.status || "due",
      user: {
        connect: {
          id: userId
        }
      },
      course: {
        connect: {
          id: courseId
        }
      }
    };
    
    console.log("Creating assignment with data:", dataToCreate); // Debug log
    
    return await prisma.assignment.create({
      data: dataToCreate,
      include: {
        course: true
      }
    });
  };
// ... existing code ...
  // ... existing code ...

const getAssignments = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  const assignments = await prisma.assignment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          courseId: true,
          courseName: true
        }
      }
    },
    orderBy: {
      deadline: 'asc'
    }
  });
  
  // Check for overdue assignments and update their status
  const now = new Date();
  const updatedAssignments = [];
  
  for (const assignment of assignments) {
    // Ensure status exists
    if (!assignment.status) {
      assignment.status = "due";
      await prisma.assignment.update({
        where: { id: assignment.id },
        data: { status: "due" }
      });
    }
    
    // If deadline has passed and status is still "due", update to "overdued"
    if (new Date(assignment.deadline) < now && assignment.status === "due") {
      const updated = await prisma.assignment.update({
        where: { id: assignment.id },
        data: { status: "overdued" },
        include: {
          course: {
            select: {
              courseId: true,
              courseName: true
            }
          }
        }
      });
      updatedAssignments.push(updated);
    } else {
      updatedAssignments.push(assignment);
    }
  }
  
  console.log("Returning assignments:", updatedAssignments); // Debug log
  return updatedAssignments;
};

const getAssignmentById = async (userId, assignmentId) => {
  if (!userId || !assignmentId) {
    throw new Error('User ID and Assignment ID are required');
  }
  
  return await prisma.assignment.findFirst({
    where: { 
      id: assignmentId,
      userId 
    },
    include: {
      course: {
        select: {
          courseId: true,
          courseName: true
        }
      }
    }
  });
};

const updateAssignment = async (userId, assignmentId, updateData) => {
  if (!userId || !assignmentId) {
    throw new Error('User ID and Assignment ID are required');
  }
  
  // First check if the assignment belongs to the user
  const assignment = await prisma.assignment.findFirst({
    where: { 
      id: assignmentId,
      userId 
    }
  });
  
  if (!assignment) {
    throw new Error('Assignment not found or you do not have permission to update it');
  }
  
  return await prisma.assignment.update({
    where: { id: assignmentId },
    data: updateData,
    include: {
      course: {
        select: {
          courseId: true,
          courseName: true
        }
      }
    }
  });
};

const deleteAssignment = async (userId, assignmentId) => {
  if (!userId || !assignmentId) {
    throw new Error('User ID and Assignment ID are required');
  }
  
  // First check if the assignment belongs to the user
  const assignment = await prisma.assignment.findFirst({
    where: { 
      id: assignmentId,
      userId 
    }
  });
  
  if (!assignment) {
    throw new Error('Assignment not found or you do not have permission to delete it');
  }
  
  return await prisma.assignment.delete({
    where: { id: assignmentId }
  });
};

// Add this new service method
const notifyDeadline = async (userId, assignmentId) => {
    if (!userId || !assignmentId) {
      throw new Error('User ID and Assignment ID are required');
    }
    
    // Get the assignment with course details
    const assignment = await prisma.assignment.findFirst({
      where: { 
        id: assignmentId,
        userId 
      },
      include: {
        course: true,
        user: true
      }
    });
    
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    // Get the email service
    const emailService = require('./email.service');
    
    // Get the notification service
    const realtimeService = require('./realtime.service');
    
    // Format the deadline
    const deadline = new Date(assignment.deadline);
    const formattedDeadline = deadline.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Send email notification
    const emailResult = await emailService.sendEmail({
      to: assignment.user.email,
      subject: `Deadline Reminder: ${assignment.assignmentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Assignment Deadline Reminder</h2>
          <p>This is a reminder that your assignment is due in 24 hours:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Assignment:</strong> ${assignment.assignmentName}</p>
            <p><strong>Course:</strong> ${assignment.course.courseName} (${assignment.course.courseId})</p>
            <p><strong>Deadline:</strong> ${formattedDeadline}</p>
          </div>
          
          <p>Please ensure you complete and submit your assignment before the deadline.</p>
          <p>You can view your assignment details by logging into your account.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>This is an automated reminder. Please do not reply to this email.</p>
          </div>
        </div>
      `
    });
    
    // Create in-app notification
    const notification = await realtimeService.createNotification({
      userId: assignment.userId,
      title: 'Assignment Deadline Approaching',
      message: `"${assignment.assignmentName}" is due within 24 hours (${formattedDeadline})`,
      type: 'WARNING',
      metadata: {
        assignmentId: assignment.id,
        courseId: assignment.courseId,
        deadline: assignment.deadline
      }
    });
    
    // Mark the assignment as notified
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { notifiedFor24HourDeadline: true }
    });
    
    return {
      emailSent: emailResult.success,
      notificationCreated: !!notification,
      assignment: {
        id: assignment.id,
        name: assignment.assignmentName,
        deadline: assignment.deadline
      }
    };
  };
  
module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  notifyDeadline
};