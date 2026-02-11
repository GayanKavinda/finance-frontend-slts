export const hasPermission = (user, permission) =>
  user?.permissions?.includes(permission);
