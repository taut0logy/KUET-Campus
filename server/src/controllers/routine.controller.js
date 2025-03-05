const routineService = require('../services/routine.service');
const { sendSuccess, sendError } = require('../utils/response.util');

const setWeeklySchedule = async (req, res, next) => {
  try {
    const  userId = req.user.id;
    const { weekday, period1, period2, period3, period4, period5, period6, period7, period8, period9 } = req.body;

    const routine = await routineService.setWeeklySchedule(userId, weekday, {
      period1, period2, period3, period4, period5, period6, period7, period8, period9,
    });

    sendSuccess(res, routine, 'Weekly schedule set successfully');
  } catch (error) {
    next(error);
  }
};

const addCourse = async (req, res, next) => {
  try {
    console.log('User from request:', req.user);
    const userId  = req.user.id;
    const { courseId, courseName, classTest } = req.body;
    
    if (!userId) {
      throw new Error('User ID is missing from request');
    }

    const course = await routineService.addCourse(userId, courseId, courseName, classTest);

    sendSuccess(res, course, 'Course added successfully');
  } catch (error) {
    next(error);
  }
};

const getWeeklySchedule = async (req, res, next) => {
  try {
    const  userId  = req.user.id;

    const schedule = await routineService.getWeeklySchedule(userId);

    sendSuccess(res, schedule, 'Weekly schedule retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const courses = await routineService.getCourses(userId);

    sendSuccess(res, courses, 'Courses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setWeeklySchedule,
  addCourse,
  getWeeklySchedule,
  getCourses,
};