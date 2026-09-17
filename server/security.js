import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { z } from 'zod';
const scrypt = promisify(scryptCallback);
export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(12, 'Use at least 12 characters').max(128);
export const hash = value => createHash('sha256').update(value).digest('hex');
export const token = () => randomBytes(32).toString('hex');
export async function passwordHash(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(passwordSchema.parse(password), salt, 64);
  return `${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 128) return false;
  const [salt, digest] = stored.split(':');
  const key = await scrypt(password, salt, 64);
  const expected = Buffer.from(digest, 'hex');
  return key.length === expected.length && timingSafeEqual(key, expected);
}
