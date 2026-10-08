"use client";

import { useAuth } from "@/contexts/AuthContext";

/**
 * Custom hook to check if the current logged-in user has specific permission(s).
 * @param {string|string[]} permissions Single permission string or array of permission strings
 * @param {boolean} requireAll If true, user must have all permissions in array. Default false (any match).
 * @returns {boolean} True if user has required permission(s)
 */
export function usePermission(permissions, requireAll = false) {
  const { user } = useAuth();

  if (!user) return false;

  // Super Admin and Admin users have full permissions
  if (user.roles && (user.roles.includes("Admin") || user.roles.includes("Super Admin"))) return true;

  const userPermissions = user.permissions || [];

  if (!permissions) return true;

  if (Array.isArray(permissions)) {
    if (requireAll) {
      return permissions.every((p) => userPermissions.includes(p));
    }
    return permissions.some((p) => userPermissions.includes(p));
  }

  return userPermissions.includes(permissions);
}

export default usePermission;
