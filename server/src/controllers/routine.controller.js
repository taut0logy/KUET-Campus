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
    const { courseId, courseName, courseType } = req.body;
    
    if (!userId) {
      throw new Error('User ID is missing from request');
    }

    const course = await routineService.addCourse(userId, courseId, courseName, courseType);

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
    const userId = req.user.id;

    const courses = await routineService.getCourses(userId);

    sendSuccess(res, courses, 'Courses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const addExam = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId, examType, syllabus, examDate } = req.body;
    
    const exam = await routineService.addExam(userId, courseId, examType, syllabus, new Date(examDate));

    sendSuccess(res, exam, 'Exam added successfully');
  } catch (error) {
    next(error);
  }
};

const updateExam = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const examId = req.params.id;
    const { courseId, examType, syllabus, examDate } = req.body;
    
    const exam = await routineService.updateExam(userId, examId, courseId, examType, syllabus, new Date(examDate));

    sendSuccess(res, exam, 'Exam updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteExam = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const examId = req.params.id;
    
    await routineService.deleteExam(userId, examId);

    sendSuccess(res, null, 'Exam deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getExams = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const exams = await routineService.getExams(userId);

    sendSuccess(res, exams, 'Exams retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setWeeklySchedule,
  addCourse,
  getWeeklySchedule,
  getCourses,
  addExam,
  updateExam,
  deleteExam,
  getExams,
};