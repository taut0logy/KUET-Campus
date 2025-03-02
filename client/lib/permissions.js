'use client';

// Define role-based permissions for the frontend
export const PERMISSIONS = {
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

// Check if the user has a specific permission
export const hasPermission = (userRole, requiredPermission) => {
  if (!userRole) return false;
  
  const userPermissions = PERMISSIONS[userRole] || [];
  return userPermissions.includes(requiredPermission);
};

// Check if the user has any of the required permissions
export const hasAnyPermission = (userRole, requiredPermissions = []) => {
  if (!userRole) return false;
  
  const userPermissions = PERMISSIONS[userRole] || [];
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

// Check if the user has all of the required permissions
export const hasAllPermissions = (userRole, requiredPermissions = []) => {
  if (!userRole) return false;
  
  const userPermissions = PERMISSIONS[userRole] || [];
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

// Check if the user has a specific role
export const hasRole = (userRole, requiredRole) => {
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
}; 