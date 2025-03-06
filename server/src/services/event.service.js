const { prisma } = require('./database.service');

// Follow an event
const followEvent = async (userId, eventId) => {
  // Check if the user is already following the event
  const existingFollow = await prisma.event.followers({
    where: { id: eventId }
  }).some(follower => follower.id === userId);
  if (existingFollow) {
    throw new Error('User is already following this event.');
  }
  await prisma.event.update({
    where: { id: eventId },
    data: {
      followers: {
        connect: { id: userId }
      }
    }
  });
  // Log the follow action
  await prisma.eventFollowUnfollowLog.create({
    data: {
      userId,
      eventId,
      action: 'follow'
    }
  });
};

// Unfollow an event
const unfollowEvent = async (userId, eventId) => {
  const existingFollow = await prisma.event.followers({
    where: { id: eventId }
  }).some(follower => follower.id === userId);
  if (!existingFollow) {
    throw new Error('User is not following this event.');
  }
  await prisma.event.update({
    where: { id: eventId },
    data: {
      followers: {
        disconnect: { id: userId }
      }
    }
  });
  // Log the unfollow action
  await prisma.eventFollowUnfollowLog.create({
    data: {
      userId,
      eventId,
      action: 'unfollow'
    }
  });
};

// Log a user's visit to an event page
const logUserVisit = async (userId, eventId) => {
  return await prisma.eventVisit.create({
    data: {
      userId,
      eventId
    }
  });
};

// Search for events
const searchEvents = async (searchParams) => {
  const { query, page = 1, limit = 10, sort } = searchParams;
  const where = {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { tags: { contains: query, mode: 'insensitive' } }
    ]
  };
  const events = await prisma.event.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sort === 'newest' ? { startTime: 'desc' } : { name: 'asc' }
  });
  const totalCount = await prisma.event.count({ where });
  return { events, totalCount };
};

module.exports = {
  followEvent,
  unfollowEvent,
  logUserVisit,
  searchEvents
}; 