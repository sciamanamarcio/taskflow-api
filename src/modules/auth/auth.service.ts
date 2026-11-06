import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import type { LoginInput, RegisterInput } from "./auth.schemas";

const publicUserSelect = { id: true, name: true, email: true, createdAt: true } as const;

function signToken(userId: string) {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export async function register({ name, email, password }: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, "EMAIL_IN_USE", "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: publicUserSelect,
  });

  return { user, token: signToken(user.id) };
}

export async function login({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Mensagem genérica: não revela se o e-mail existe
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !valid) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    token: signToken(user.id),
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "User not found");
  return user;
}
