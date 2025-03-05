const { prisma } = require('./database.service');

const setWeeklySchedule = async (userId, weekday, periods) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  return await prisma.routine.upsert({
    where: { 
      weekday_userId: { 
        userId: userId, 
        weekday: weekday 
      } 
    },
    update: { ...periods },
    create: { userId, weekday, ...periods },
  });
};

const addCourse = async (userId, courseId, courseName, classTest) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return await prisma.course.create({
    data: {
      courseId,
      courseName,
      classTest,
      user: {
        connect: {
          id: userId
        }
      }
    },
  });
};

const getWeeklySchedule = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  return await prisma.routine.findMany({
    where: { userId } ,
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