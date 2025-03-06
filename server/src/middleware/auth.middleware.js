const jwt = require('jsonwebtoken');
const { prisma } = require('../services/database.service');
require('dotenv').config();

// Middleware to verify JWT token and attach user to request
const authenticate = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        status: true,
        emailVerified: true,
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found or token invalid.' });
    }

    // Check if user is active
    if (user.status === 'INACTIVE') {
      return res.status(401).json({ message: 'Account is not active. Please contact the admin to activate your account.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(401).json({ message: 'Account is suspended. Please contact the admin to activate your account.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

// Define role-based permissions
const PERMISSIONS = {
  ADMIN: [
    'manage_users', 'view_users', 'delete_users',
    'manage_content', 'view_content', 'delete_content',
    'manage_settings', 'view_settings',
    'manage_roles', 'view_roles',
    'manage_faculty', 'view_faculty',
    'manage_students', 'view_students',
    'manage_office', 'view_office',
    'manage_cafe', 'view_cafe',
    'manage_clubs', 'view_clubs',
  ],
  STUDENT: [
    'view_content',
    'view_clubs',
    'join_clubs',
    'view_cafe',
    'place_cafe_orders',
  ],
  FACULTY: [
    'view_content',
    'manage_content',
    'view_students',
    'view_clubs',
    'view_cafe',
    'place_cafe_orders',
  ],
  OFFICE_MANAGER: [
    'view_content',
    'manage_content',
    'view_students',
    'view_faculty',
    'manage_office',
    'view_office',
  ],
  CAFE_MANAGER: [
    'view_content',
    'manage_cafe',
    'view_cafe',
    'manage_cafe_items',
    'view_cafe_orders',
    'manage_cafe_orders',
  ],
  CLUB_MODERATOR: [
    'view_content',
    'manage_content',
    'view_clubs',
    'manage_clubs',
    'view_club_members',
    'manage_club_members',
  ],
};

// Get all permissions for a user based on their roles
const getUserPermissions = (roles) => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return [];
  }
  
  // Combine permissions from all roles
  const permissions = new Set();
  
  roles.forEach(role => {
    const rolePermissions = PERMISSIONS[role] || [];
    rolePermissions.forEach(permission => permissions.add(permission));
  });
  
  return Array.from(permissions);
};

// Middleware to check if user has at least one of the required roles
const authorize = (requiredRoles = []) => {
  if (typeof requiredRoles === 'string') {
    requiredRoles = [requiredRoles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required before authorization.' });
    }
    
    // Get user roles (use roles array)
    const userRoles = req.user.roles;
    
    // Check if user has any of the required roles
    const hasRole = requiredRoles.length === 0 || requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        message: 'Forbidden: You do not have the required permission to access this resource.'
      });
    }
    
    next();
  };
};

// Middleware to check if user has specific permission
const hasPermission = (requiredPermissions = []) => {
  if (typeof requiredPermissions === 'string') {
    requiredPermissions = [requiredPermissions];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required before authorization.' });
    }
    
    // Get user roles (use roles array if available, fallback to single role)
    const userRoles = req.user.roles || [req.user.role];
    
    // Get all permissions for the user
    const userPermissions = getUserPermissions(userRoles);
    
    const hasRequiredPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasRequiredPermission) {
      return res.status(403).json({
        message: 'Forbidden: You do not have the required permission to access this resource.'
      });
    }
    
    next();
  };
};

// Middleware to verify email is confirmed
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  
  if (!req.user.emailVerified) {
    return res.status(403).json({ 
      message: 'Email verification required. Please verify your email address before proceeding.' 
    });
  }
  
  next();
};

async function checkClubRole(req, res, next) {
  const { userId } = req.user; // Assuming userId is available in req.user
  const { clubId } = req.params; // Assuming clubId is passed in the request parameters

  const userClub = await prisma.userClub.findFirst({
    where: {
      userId: userId,
      clubId: parseInt(clubId),
      status: 'ACTIVE'
    }
  });

  if (!userClub) {
    return res.status(403).json({ message: 'Access denied: You are not a member of this club.' });
  }

  // Check if the user is a moderator or manager
  if (userClub.role === 'MODERATOR' || userClub.role === 'MANAGER') {
    return next(); // User has the required role
  }

  return res.status(403).json({ message: 'Access denied: You do not have the required role for this club.' });
}

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied: Admins only.' });
  }
  next();
};

const authorizeModeratorOrManager = async (req, res, next) => {
  const { userId } = req.user;
  const { clubId } = req.params;
  // Check if the user is a moderator or manager of the club
  const userClub = await prisma.userClub.findFirst({
    where: {
      userId,
      clubId: parseInt(clubId),
      status: 'ACTIVE'
    }
  });
  if (!userClub || (userClub.role !== 'MODERATOR' && userClub.role !== 'MANAGER')) {
    return res.status(403).json({ message: 'Access denied: You do not have the required role.' });
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  authorizeAdmin,
  authorizeModeratorOrManager,
  hasPermission,
  getUserPermissions,
  requireEmailVerified,
  PERMISSIONS,
  checkClubRole
}; 