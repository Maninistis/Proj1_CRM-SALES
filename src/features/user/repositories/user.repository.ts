import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * User repository — all Prisma queries for the User model.
 * The service layer calls these methods; it never touches Prisma directly.
 */

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      },
    },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      },
    },
  });
}

export async function createUser(data: {
  email: string;
  name: string;
  passwordHash: string;
  roleRoleId: string;
}) {
  return prisma.user.create({
    data,
  });
}

export async function updateLastLogin(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}

export type UserWithPermissions = Prisma.UserGetPayload<{
  include: {
    role: {
      include: {
        rolePermissions: {
          include: { permission: true };
        };
      };
    };
  };
}>;
