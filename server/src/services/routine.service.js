const { prisma } = require('./database.service');

const setWeeklySchedule = async (userId, weekday, periods) => {
  return await prisma.routine.upsert({
    where: { userId_weekday: { userId, weekday } },
    update: { ...periods },
    create: { userId, weekday, ...periods },
  });
};

const addCourse = async (userId, courseId, courseName, classTest) => {
  return await prisma.course.create({
    data: { userId, courseId, courseName, classTest },
  });
};

const getWeeklySchedule = async (userId) => {
  return await prisma.routine.findMany({
    where: { userId },
  });
};

const getCourses = async (userId) => {
  return await prisma.course.findMany({
    where: { userId },
  });
};

module.exports = {
  setWeeklySchedule,
  addCourse,
  getWeeklySchedule,
  getCourses,
};
