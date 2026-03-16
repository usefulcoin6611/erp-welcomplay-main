import { prisma } from "./prisma";

export async function getTenantFilter(sessionUser: any) {
  if (!sessionUser) return null;

  const role = sessionUser.role;

  // Super admin can see everything
  if (role === "super admin") {
    return {};
  }

  // Company owner is a tenant root
  if (role === "company") {
    return { ownerId: sessionUser.id };
  }

  // Employees belong to a company through ownerId
  if (role === "employee") {
    if (sessionUser.ownerId) {
      return { ownerId: sessionUser.ownerId };
    }
    
    // Fallback: If ownerId is missing in session, try fetching from user
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { ownerId: true }
    });
    
    if (user?.ownerId) {
      return { ownerId: user.ownerId };
    }
  }

  // Default to isolated (return a filter that matches nothing if not authorized)
  return { ownerId: "none" };
}

export function getTenantId(sessionUser: any) {
  if (!sessionUser) return null;
  if (sessionUser.role === "company") return sessionUser.id;
  return sessionUser.ownerId || null;
}
