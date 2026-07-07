import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionCookie, decrypt } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { Role } from "@/generated/prisma/enums";

export const verifySession = cache(async () => {
  const cookie = await getSessionCookie();
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
  }

  return { isAuth: true, userId: session.userId, role: session.role };
});

export function requireRole(role: Role | Role[]) {
  const allowed = Array.isArray(role) ? role : [role];
  return async () => {
    const session = await verifySession();
    if (!session) redirect("/connexion");
    if (!allowed.includes(session.role)) redirect("/");
    return session;
  };
}

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, nom: true, email: true, role: true, telephone: true },
  });
});
