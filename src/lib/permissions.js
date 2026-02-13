// lib/permissions.js

export const hasPermission = (user, permission) =>
  user?.permissions?.includes(permission);