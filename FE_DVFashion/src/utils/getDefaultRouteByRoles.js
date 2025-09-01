export function getDefaultRouteByRoles(roles) {
  console.log("getDefaultRouteByRoles - Input roles:", roles);

  if (!roles || roles.length === 0) {
    console.log("No roles, returning home");
    return "/";
  }

  // Convert roles to strings nếu cần thiết
  const roleStrings = roles.map((role) =>
    typeof role === "string" ? role : role.roleName || role.name || role
  );

  console.log("getDefaultRouteByRoles - Processed roles:", roleStrings);

  // Priority in order: ADMIN > STAFF > CUSTOMER
  if (roleStrings.includes("ROLE_ADMIN")) {
    console.log("Found ROLE_ADMIN, returning /admin");
    return "/admin";
  }
  if (roleStrings.includes("ROLE_STAFF")) {
    console.log("Found ROLE_STAFF, returning /staff");
    return "/staff";
  }
  if (roleStrings.includes("ROLE_CUSTOMER")) {
    console.log("Found ROLE_CUSTOMER, returning /customer");
    return "/customer";
  }

  console.log("No matching roles, returning home");
  return "/";
}
