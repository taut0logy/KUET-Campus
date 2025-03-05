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

const addCourse = async (userId, courseId, courseName, courseType) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return await prisma.course.create({
    data: {
      courseId,
      courseName,
      courseType,
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

const addExam = async (userId, courseId, examType, syllabus, examDate) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  // First check if the course exists and belongs to the user
  const course = await prisma.course.findFirst({
    where: {
      courseId: courseId,
      userId: userId
    }
  });

  if (!course) {
    throw new Error('Course not found or you do not have permission to add an exam for this course');
  }

  return await prisma.exam.create({
    data: {
      examType,
      syllabus,
      examDate,
      user: {
        connect: {
          id: userId
        }
      },
      course: {
        connect: {
          id: course.id
        }
      }
    },
  });
};

const updateExam = async (userId, examId, courseId, examType, syllabus, examDate) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  // First check if the exam belongs to the user
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      userId
    },
    include: {
      course: true
    }
  });

  if (!exam) {
    throw new Error('Exam not found or you do not have permission to update it');
  }

  // Find the course by courseId
  const course = await prisma.course.findFirst({
    where: {
      courseId: courseId.id,
      userId: userId
    }
  });

  if (!course) {
    throw new Error(`Course with ID ${courseId} not found or you do not have permission to use it`);
  }

  return await prisma.exam.update({
    where: { id: examId },
    data: {
      examType,
      syllabus,
      examDate,
      course: {
        connect: {
          id: course.id
        }
      }
    },
    include: {
      course: true
    }
  });
};

const deleteExam = async (userId, examId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  // First check if the exam belongs to the user
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      userId
    }
  });

  if (!exam) {
    throw new Error('Exam not found or you do not have permission to delete it');
  }

  return await prisma.exam.delete({
    where: { id: examId }
  });
};

const getExams = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  return await prisma.exam.findMany({
    where: { userId },
    orderBy: { examDate: 'asc' }
  });
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