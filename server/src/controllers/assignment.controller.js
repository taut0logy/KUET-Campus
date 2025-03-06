const assignmentService = require('../services/assignment.service');
const { sendSuccess, sendError } = require('../utils/response.util');

const createAssignment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId, assignmentName, assignmentContent, deadline } = req.body;
    
    const assignment = await assignmentService.createAssignment(userId, {
      courseId,
      assignmentName,
      assignmentContent,
      deadline: new Date(deadline)
    });

    sendSuccess(res, assignment, 'Assignment created successfully');
  } catch (error) {
    next(error);
  }
};

const getAssignments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const assignments = await assignmentService.getAssignments(userId);
    
    sendSuccess(res, assignments, 'Assignments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getAssignmentById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const assignment = await assignmentService.getAssignmentById(userId, id);
    
    if (!assignment) {
      return sendError(res, 'Assignment not found', 404);
    }
    
    sendSuccess(res, assignment, 'Assignment retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }
    
    const assignment = await assignmentService.updateAssignment(userId, id, updateData);
    
    sendSuccess(res, assignment, 'Assignment updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    await assignmentService.deleteAssignment(userId, id);
    
    sendSuccess(res, { id }, 'Assignment deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Add this new controller method
const notifyDeadline = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { assignmentId } = req.body;
      
      const result = await assignmentService.notifyDeadline(userId, assignmentId);
      
      sendSuccess(res, result, 'Deadline notification sent successfully');
    } catch (error) {
      next(error);
    }
  };
  
  // Add this to your module.exports
module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  notifyDeadline
};