const { prisma } = require('./database.service');
const storageService = require('./storage.service');

// Create a new club
const createClub = async (data) => {
  return await prisma.club.create({
    data
  });
};

// Update an existing club
const updateClub = async (id, data) => {
  return await prisma.club.update({
    where: { id: parseInt(id) },
    data
  });
};

// Delete a club
const deleteClub = async (id) => {
  return await prisma.club.delete({
    where: { id: parseInt(id) }
  });
};

// Follow a club
const followClub = async (userId, clubId) => {
  // Check if the user is already following the club
  const existingFollow = await prisma.club.followers({
    where: { id: clubId }
  }).some(follower => follower.id === userId);
  if (existingFollow) {
    throw new Error('User is already following this club.');
  }
  await prisma.club.update({
    where: { id: clubId },
    data: {
      followers: {
        connect: { id: userId }
      }
    }
  });
  // Log the follow action
  await prisma.followUnfollowLog.create({
    data: {
      userId,
      clubId,
      action: 'follow'
    }
  });
};

// Unfollow a club
const unfollowClub = async (userId, clubId) => {
  const existingFollow = await prisma.club.followers({
    where: { id: clubId }
  }).some(follower => follower.id === userId);
  if (!existingFollow) {
    throw new Error('User is not following this club.');
  }
  await prisma.club.update({
    where: { id: clubId },
    data: {
      followers: {
        disconnect: { id: userId }
      }
    }
  });
  // Log the unfollow action
  await prisma.followUnfollowLog.create({
    data: {
      userId,
      clubId,
      action: 'unfollow'
    }
  });
};

// Add album photo
const addAlbumPhoto = async (clubId, photo) => {
  const photoUrl = await storageService.uploadPhoto(photo);
  return await prisma.clubAlbumPhoto.create({
    data: {
      clubId,
      photoUrl
    }
  });
};

// Remove album photo
const removeAlbumPhoto = async (photoId) => {
  const photo = await prisma.clubAlbumPhoto.findUnique({
    where: { id: parseInt(photoId) }
  });
  if (!photo) {
    throw new Error('Photo not found');
  }
  await storageService.deletePhoto(photo.photoUrl);
  return await prisma.clubAlbumPhoto.delete({
    where: { id: parseInt(photoId) }
  });
};

// Add a user to a club
const addUserToClub = async (userId, clubId, role) => {
  return await prisma.userClub.create({
    data: {
      userId,
      clubId,
      role
    }
  });
};

// Remove a user from a club
const removeUserFromClub = async (userId, clubId) => {
  return await prisma.userClub.delete({
    where: {
      userId,
      clubId
    }
  });
};

// Change a user's role/status in a club
const changeUserRoleInClub = async (userId, clubId, newRole) => {
  return await prisma.userClub.update({
    where: {
      userId,
      clubId
    },
    data: {
      role: newRole
    }
  });
};

// Log a user's visit to a club page
const logUserVisit = async (userId, clubId) => {
  return await prisma.userVisit.create({
    data: {
      userId,
      clubId
    }
  });
};

// Search for clubs
const searchClubs = async (searchParams) => {
  const { query, page = 1, limit = 10, sort } = searchParams;
  const where = {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { tags: { contains: query, mode: 'insensitive' } }
    ]
  };
  const clubs = await prisma.club.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sort === 'newest' ? { foundingDate: 'desc' } : { name: 'asc' }
  });
  const totalCount = await prisma.club.count({ where });
  return { clubs, totalCount };
};

module.exports = {
  createClub,
  updateClub,
  deleteClub,
  followClub,
  unfollowClub,
  addAlbumPhoto,
  removeAlbumPhoto,
  addUserToClub,
  removeUserFromClub,
  changeUserRoleInClub,
  logUserVisit,
  searchClubs
}; 