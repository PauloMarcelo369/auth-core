import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASS,
});

export async function storeRefreshToken(userId: string, token: string) {
  await redis.set(`refresh:${userId}`, token, "EX", 7 * 24 * 60 * 60);
}

export async function storeResetToken(userId: string, token: string) {
  await redis.set(`reset:${token}`, userId, "EX", 15 * 60);
}

export async function removeRefreshToken(userId: string) {
  await redis.del(`refresh:${userId}`);
}

export async function removeResetToken(token: string) {
  await redis.del(`reset:${token}`);
}

export async function validateRefreshToken(userId: string, token: string) {
  const stored = await redis.get(`refresh:${userId}`);
  return stored === token;
}

export async function getUserIdByResetToken(token: string) {
  const userId = await redis.get(`reset:${token}`);
  return userId;
}
