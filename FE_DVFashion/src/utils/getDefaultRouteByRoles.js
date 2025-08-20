// Get the default route based on user roles
export function getDefaultRouteByRoles(roles) {
  if (!roles || roles.length === 0) return "/";

  // Priority in order: ADMIN > STAFF > CUSTOMER
  if (roles.includes("ROLE_ADMIN")) return "/admin";
  if (roles.includes("ROLE_STAFF")) return "/staff";
  if (roles.includes("ROLE_CUSTOMER")) return "/customer";

  return "/";
}
