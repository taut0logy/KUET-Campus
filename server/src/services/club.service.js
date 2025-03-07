const { prisma } = require("./database.service");
const {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require("../middleware/error.middleware");
const { logger } = require("../utils/logger.util");
const slugify = require("../utils/slugify.util");

/**
 * Create a new club
 */
const createClub = async (clubData) => {
  try {
    const slug = clubData.slug || slugify(clubData.name);

    // Check if club with this slug already exists
    const existing = await prisma.club.findFirst({
      where: {
        OR: [{ slug }, { name: clubData.name }],
      },
    });

    if (existing) {
      throw new ConflictError("A club with this name already exists");
    }

    // Create club with all related data
    const club = await prisma.club.create({
      data: {
        name: clubData.name,
        slug,
        description: clubData.description,
        foundingDate: clubData.foundingDate
          ? new Date(clubData.foundingDate)
          : new Date(),
        coverPhoto: clubData.coverPhoto,
        moderatorId: clubData.moderatorId,
        clubTagId: clubData.clubTagId,
      },
    });

    // Handle tags if provided
    if (
      clubData.tags &&
      Array.isArray(clubData.tags) &&
      clubData.tags.length > 0
    ) {
      // Add tags to club
      await prisma.club.update({
        where: { id: club.id },
        data: {
          tags: {
            connect: clubData.tags.map((tagId) => ({ id: parseInt(tagId) })),
          },
        },
      });
    }

    // Make the moderator a member and manager
    await prisma.userClub.create({
      data: {
        userId: clubData.moderatorId,
        clubId: club.id,
        role: "MODERATOR",
        status: "ACTIVE",
      },
    });

    return club;
  } catch (error) {
    logger.error("Error creating club:", error);
    throw error;
  }
};

/**
 * Get a club by ID with optional inclusion of count information
 */
const getClubById = async (clubId, includeCounts = false) => {
  try {
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) },
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        managers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        members: {
          where: { status: "ACTIVE" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        followers: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
        clubTag: true,
        ...(includeCounts && {
          _count: {
            select: {
              followers: true,
              members: true,
              events: true,
              userVisits: true,
            },
          },
        }),
      },
    });

    if (!club) {
      throw new NotFoundError(`Club with ID ${clubId} not found`);
    }

    // Transform managers data to be more API-friendly
    const transformedClub = {
      ...club,
      managers: club.managers.map((manager) => ({
        id: manager.user.id,
        name: manager.user.name,
        email: manager.user.email,
      })),
      members: club.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        status: member.status,
      })),
    };

    return transformedClub;
  } catch (error) {
    logger.error(`Error getting club by ID ${clubId}:`, error);
    throw error;
  }
};

/**
 * Get a club by slug with optional inclusion of count information
 */
const getClubBySlug = async (slug, includeCounts = false) => {
  try {
    const club = await prisma.club.findUnique({
      where: { slug },
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        managers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        members: {
          where: { status: "ACTIVE" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        followers: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
        clubTag: true,
        ...(includeCounts && {
          _count: {
            select: {
              followers: true,
              members: true,
              events: true,
              userVisits: true,
            },
          },
        }),
      },
    });

    if (!club) {
      throw new NotFoundError(`Club with slug ${slug} not found`);
    }

    // Transform managers data to be more API-friendly
    const transformedClub = {
      ...club,
      managers: club.managers.map((manager) => ({
        id: manager.user.id,
        name: manager.user.name,
        email: manager.user.email,
      })),
      members: club.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        status: member.status,
      })),
    };

    return transformedClub;
  } catch (error) {
    logger.error(`Error getting club by slug ${slug}:`, error);
    throw error;
  }
};

/**
 * Update a club by ID
 */
const updateClub = async (clubId, clubData) => {
  try {
    const club = await prisma.club.findUnique({
      where: { id: parseInt(id) },
    });

    logger.info(`Club deleted: ${id} - ${existingClub.name}`);

    return true;
  } catch (error) {
    logger.error(`Error deleting club ${id}:`, error);
    throw error;
  }
};

/**
 * Follow a club
 */
const followClub = async (userId, clubId) => {
  try {
    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) },
    });

    if (!club) {
      throw new NotFoundError(`Club with ID ${clubId} not found`);
    }

    // Check if already following
    const existingFollow = await prisma.club.findFirst({
      where: {
        id: parseInt(clubId),
        followers: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (existingFollow) {
      throw new ConflictError("User is already following this club");
    }

    // Add user as follower
    await prisma.club.update({
      where: { id: parseInt(clubId) },
      data: {
        followers: {
          connect: { id: userId },
        },
      },
    });

    // Log the follow action
    await prisma.followUnfollowLog.create({
      data: {
        userId,
        clubId: parseInt(clubId),
        action: "follow",
      },
    });

    logger.info(`User ${userId} followed club ${clubId}`);

    return { userId, clubId: parseInt(clubId), followed: true };
  } catch (error) {
    logger.error(`Error following club ${clubId} by user ${userId}:`, error);
    throw error;
  }
};

/**
 * Unfollow a club
 */
const unfollowClub = async (userId, clubId) => {
  try {
    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) },
    });

    if (!club) {
      throw new NotFoundError(`Club with ID ${clubId} not found`);
    }

    // Check if actually following
    const existingFollow = await prisma.club.findFirst({
      where: {
        id: parseInt(clubId),
        followers: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!existingFollow) {
      throw new ConflictError("User is not following this club");
    }

    // Remove user as follower
    await prisma.club.update({
      where: { id: parseInt(clubId) },
      data: {
        followers: {
          disconnect: { id: userId },
        },
      },
    });

    // Log the unfollow action
    await prisma.followUnfollowLog.create({
      data: {
        userId,
        clubId: parseInt(clubId),
        action: "unfollow",
      },
    });

    logger.info(`User ${userId} unfollowed club ${clubId}`);

    return true;
  } catch (error) {
    logger.error(`Error unfollowing club ${clubId} by user ${userId}:`, error);
    throw error;
  }
};

/**
 * Add user to club
 */
const addUserToClub = async (userId, clubId, role = "MEMBER") => {
  try {
    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) },
    });

    if (!club) {
      throw new NotFoundError(`Club with ID ${clubId} not found`);
    }

    // Check if user is already a member
    const existingMembership = await prisma.userClub.findFirst({
      where: {
        userId,
        clubId: parseInt(clubId),
      },
    });

    if (existingMembership) {
      throw new ConflictError("User is already a member of this club");
    }

    // Add user as member
    const userClub = await prisma.userClub.create({
      data: {
        userId,
        clubId: parseInt(clubId),
        role: role,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Also add as follower if not already following
    const isFollowing = await prisma.club.findFirst({
      where: {
        id: parseInt(clubId),
        followers: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!isFollowing) {
      await followClub(userId, clubId);
    }

    logger.info(`User ${userId} added to club ${clubId} with role ${role}`);

    return userClub;
  } catch (error) {
    logger.error(`Error adding user ${userId} to club ${clubId}:`, error);
    throw error;
  }
};

/**
 * Remove user from club
 */
const removeUserFromClub = async (userId, clubId) => {
  try {
    // Check if user is a member
    const existingMembership = await prisma.userClub.findFirst({
      where: {
        userId,
        clubId: parseInt(clubId),
      },
    });

    if (!existingMembership) {
      throw new NotFoundError("User is not a member of this club");
    }

    // Check if user is the moderator
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) },
    });

    if (club.moderatorId === userId) {
      throw new ForbiddenError("Cannot remove the moderator from the club");
    }

    // Remove user from club
    await prisma.userClub.delete({
      where: {
        id: existingMembership.id,
      },
    });

    logger.info(`User ${userId} removed from club ${clubId}`);

    return true;
  } catch (error) {
    logger.error(`Error removing user ${userId} from club ${clubId}:`, error);
    throw error;
  }
};

/**
 * Change user role in club
 */
const changeUserRoleInClub = async (userId, clubId, newRole) => {
  try {
    // Check if user is a member
    const existingMembership = await prisma.userClub.findFirst({
      where: {
        userId,
        clubId: parseInt(clubId),
      },
    });

    if (!existingMembership) {
      throw new NotFoundError("User is not a member of this club");
    }

    // Check if user is the moderator
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) },
    });

    if (club.moderatorId === userId) {
      throw new ForbiddenError("Cannot change the role of the club moderator");
    }

    // Update user role
    const updatedMembership = await prisma.userClub.update({
      where: {
        id: existingMembership.id,
      },
      data: {
        role: newRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info(`User ${userId} role in club ${clubId} changed to ${newRole}`);

    return updatedMembership;
  } catch (error) {
    logger.error(
      `Error changing user ${userId} role in club ${clubId}:`,
      error
    );
    throw error;
  }
};

/**
 * Change user status in club
 */
const changeUserStatusInClub = async (userId, clubId, newStatus) => {
  try {
    // Check if user is a member
    const existingMembership = await prisma.userClub.findFirst({
      where: {
        userId,
        clubId: parseInt(clubId),
      },
    });

    if (!existingMembership) {
      throw new NotFoundError("User is not a member of this club");
    }

    // Check if user is the moderator
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) },
    });

    if (club.moderatorId === userId) {
      throw new ForbiddenError(
        "Cannot change the status of the club moderator"
      );
    }

    // Update user status
    const updatedMembership = await prisma.userClub.update({
      where: {
        id: existingMembership.id,
      },
      data: {
        status: newStatus,
      },
    });

    logger.info(
      `User ${userId} status in club ${clubId} changed to ${newStatus}`
    );

    return updatedMembership;
  } catch (error) {
    logger.error(
      `Error changing user ${userId} status in club ${clubId}:`,
      error
    );
    throw error;
  }
};

/**
 * Get all clubs with filters and pagination
 */
const getAllClubs = async ({
  page = 1,
  limit = 10,
  search,
  tag,
  sort = "recent",
}) => {
  try {
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      where.clubTagId = parseInt(tag);
    }

    // Determine sort order
    let orderBy = {};
    switch (sort) {
      case "alphabetical":
        orderBy = { name: "asc" };
        break;
      case "followers":
        // This is a complex sort that might need a raw query or a post-fetch sort
        orderBy = { id: "asc" };
        break;
      case "recent":
      default:
        orderBy = { foundingDate: "desc" };
        break;
    }

    // Get clubs
    const clubs = await prisma.club.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
          },
        },
        clubTag: true,
        _count: {
          select: {
            followers: true,
            members: true,
            events: true,
          },
        },
      },
    });

    // Get total count
    const totalCount = await prisma.club.count({ where });

    // Post-process to handle 'followers' sorting if needed
    if (sort === "followers") {
      clubs.sort((a, b) => b._count.followers - a._count.followers);
    }

    return {
      clubs,
      meta: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    logger.error("Error getting clubs:", error);
    throw error;
  }
};

/**
 * Get clubs by tags
 */
const getClubsByTag = async (tagId, { page = 1, limit = 10 }) => {
  try {
    const skip = (page - 1) * limit;

    const clubs = await prisma.club.findMany({
      where: {
        clubTagId: parseInt(tagId),
      },
      skip,
      take: limit,
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
          },
        },
        clubTag: true,
        _count: {
          select: {
            followers: true,
            members: true,
          },
        },
      },
    });

    const totalCount = await prisma.club.count({
      where: {
        clubTagId: parseInt(tagId),
      },
    });

    return {
      clubs,
      meta: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    logger.error(`Error getting clubs by tag ${tagId}:`, error);
    throw error;
  }
};

/**
 * Get clubs followed by a user
 */
const getUserFollowedClubs = async (userId, { page = 1, limit = 10 }) => {
  try {
    const skip = (page - 1) * limit;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clubFollowers: {
          skip,
          take: limit,
          include: {
            moderator: {
              select: {
                id: true,
                name: true,
              },
            },
            clubTag: true,
            _count: {
              select: {
                followers: true,
                members: true,
                events: true,
              },
            },
          },
        },
        _count: {
          select: {
            clubFollowers: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    return {
      clubs: user.clubFollowers,
      meta: {
        total: user._count.clubFollowers,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(user._count.clubFollowers / limit),
      },
    };
  } catch (error) {
    logger.error(`Error getting clubs followed by user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get clubs where user is a member
 */
const getUserMemberClubs = async (userId, { page = 1, limit = 10 }) => {
  try {
    const skip = (page - 1) * limit;

    // Get memberships
    const memberships = await prisma.userClub.findMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      skip,
      take: limit,
      include: {
        club: {
          include: {
            moderator: {
              select: {
                id: true,
                name: true,
              },
            },
            clubTag: true,
            _count: {
              select: {
                followers: true,
                members: true,
                events: true,
              },
            },
          },
        },
      },
    });

    // Get total count
    const totalCount = await prisma.userClub.count({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

    // Extract clubs from memberships
    const clubs = memberships.map((membership) => ({
      ...membership.club,
      userRole: membership.role,
    }));

    return {
      clubs,
      meta: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    logger.error(
      `Error getting clubs where user ${userId} is a member:`,
      error
    );
    throw error;
  }
};

/**
 * Get clubs where user is a manager
 */
const getUserManagedClubs = async (userId) => {
  try {
    // Get clubs where user is moderator
    const moderatedClubs = await prisma.club.findMany({
      where: {
        moderatorId: userId,
      },
      include: {
        _count: {
          select: {
            followers: true,
            members: true,
            events: true,
          },
        },
      },
    });

    // Get clubs where user is a manager
    const managedClubRoles = await prisma.userClubManager.findMany({
      where: {
        userId,
      },
      include: {
        club: {
          include: {
            moderator: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                followers: true,
                members: true,
                events: true,
              },
            },
          },
        },
      },
    });

    const managedClubs = managedClubRoles.map((role) => ({
      ...role.club,
      userRole: "MANAGER",
    }));

    // Combine and mark the role
    const clubs = [
      ...moderatedClubs.map((club) => ({ ...club, userRole: "MODERATOR" })),
      ...managedClubs,
    ];

    return { clubs };
  } catch (error) {
    logger.error(`Error getting clubs managed by user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get all club tags
 */
const getAllClubTags = async () => {
  try {
    const tags = await prisma.clubTag.findMany();
    return tags;
  } catch (error) {
    logger.error("Error getting club tags:", error);
    throw error;
  }
};

/**
 * Log user visit to a club
 */
const logUserVisit = async (userId, clubId) => {
  try {
    await prisma.userVisit.create({
      data: {
        userId,
        clubId: parseInt(clubId),
        visitedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    logger.error(
      `Error logging user ${userId} visit to club ${clubId}:`,
      error
    );
    // Do not throw error - just log and continue
    return false;
  }
};

/**
 * Get club analytics
 */
const getClubAnalytics = async (clubId, { startDate, endDate }) => {
  try {
    // Parse date filters
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const visitDateFilter = Object.keys(dateFilter).length
      ? { visitedAt: dateFilter }
      : {};
    const actionDateFilter = Object.keys(dateFilter).length
      ? { actionAt: dateFilter }
      : {};

    // Get club with basic stats
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) },
      include: {
        _count: {
          select: {
            followers: true,
            members: true,
            events: true,
          },
        },
      },
    });

    if (!club) {
      throw new NotFoundError(`Club with ID ${clubId} not found`);
    }

    // Get visit analytics
    const visitCount = await prisma.userVisit.count({
      where: {
        clubId: parseInt(clubId),
        ...visitDateFilter,
      },
    });

    // Get unique visitors
    const uniqueVisitors = await prisma.userVisit.groupBy({
      by: ["userId"],
      where: {
        clubId: parseInt(clubId),
        ...visitDateFilter,
      },
    });

    // Get follow/unfollow activity
    const followUnfollowLogs = await prisma.followUnfollowLog.findMany({
      where: {
        clubId: parseInt(clubId),
        ...actionDateFilter,
      },
      orderBy: { actionAt: "desc" },
      take: 100,
    });

    const follows = followUnfollowLogs.filter(
      (log) => log.action === "follow"
    ).length;
    const unfollows = followUnfollowLogs.filter(
      (log) => log.action === "unfollow"
    ).length;

    // Get member role distribution
    const memberRoles = await prisma.userClub.groupBy({
      by: ["role"],
      where: { clubId: parseInt(clubId) },
      _count: true,
    });

    // Get recent events
    const recentEvents = await prisma.event.findMany({
      where: { clubId: parseInt(clubId) },
      orderBy: { startTime: "desc" },
      take: 5,
    });

    return {
      basicStats: {
        followers: club._count.followers,
        members: club._count.members,
        events: club._count.events,
      },
      visitAnalytics: {
        totalVisits: visitCount,
        uniqueVisitors: uniqueVisitors.length,
      },
      followActivity: {
        follows,
        unfollows,
        netGrowth: follows - unfollows,
      },
      memberRoles,
      recentEvents,
    };
  } catch (error) {
    logger.error(`Error getting analytics for club ${clubId}:`, error);
    throw error;
  }
};

/**
 * Search clubs
 */
const searchClubs = async ({
  query,
  page = 1,
  limit = 10,
  sort = "relevance",
}) => {
  try {
    if (!query || query.trim() === "") {
      return await getAllClubs({ page, limit, sort });
    }

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    };

    // Determine sort order
    let orderBy = {};
    switch (sort) {
      case "alphabetical":
        orderBy = { name: "asc" };
        break;
      case "recent":
        orderBy = { foundingDate: "desc" };
        break;
      case "relevance":
      default:
        // For relevance, we might need to do some post-processing
        orderBy = { name: "asc" };
        break;
    }

    // Get clubs
    const clubs = await prisma.club.findMany({
      where: searchQuery,
      skip,
      take: limit,
      orderBy,
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
          },
        },
        clubTag: true,
        _count: {
          select: {
            followers: true,
            members: true,
          },
        },
      },
    });

    // Get total count
    const totalCount = await prisma.club.count({ where: searchQuery });

    // For 'relevance' sorting, we might want to post-process results
    if (sort === "relevance") {
      // Simple relevance algorithm: exact name match > name contains > description contains
      clubs.sort((a, b) => {
        const aNameExact = a.name.toLowerCase() === query.toLowerCase();
        const bNameExact = b.name.toLowerCase() === query.toLowerCase();

        if (aNameExact && !bNameExact) return -1;
        if (!aNameExact && bNameExact) return 1;

        const aNameContains = a.name
          .toLowerCase()
          .includes(query.toLowerCase());
        const bNameContains = b.name
          .toLowerCase()
          .includes(query.toLowerCase());

        if (aNameContains && !bNameContains) return -1;
        if (!aNameContains && bNameContains) return 1;

        return 0;
      });
    }

    return {
      clubs,
      meta: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit),
        query,
      },
    };
  } catch (error) {
    logger.error(`Error searching clubs with query '${query}':`, error);
    throw error;
  }
};

module.exports = {
  createClub,
  getClubById,
  getClubBySlug,
  updateClub,
  followClub,
  unfollowClub,
  addUserToClub,
  removeUserFromClub,
  changeUserRoleInClub,
  changeUserStatusInClub,
  getAllClubs,
  getClubsByTag,
  getUserFollowedClubs,
  getUserMemberClubs,
  getUserManagedClubs,
  getAllClubTags,
  logUserVisit,
  getClubAnalytics,
  searchClubs,
};
