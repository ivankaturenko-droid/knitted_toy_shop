import { promisify } from 'node:util';
import {
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import users from '../data/users.js';

const scrypt = promisify(scryptCallback);
const sessions = new Map();

export async function createUser({ name, email, password }) {
  const salt = randomBytes(16).toString('hex');
  const passwordHash = (await scrypt(password, salt, 64)).toString('hex');
  const user = { id: randomUUID(), name, email, salt, passwordHash };
  users.push(user);
  return user;
}

export function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

export function getPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export async function verifyPassword(user, password) {
  const candidate = await scrypt(password, user.salt, 64);
  const savedHash = Buffer.from(user.passwordHash, 'hex');
  return timingSafeEqual(candidate, savedHash);
}

export function createSession(user) {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, user.id);
  return token;
}

export function findUserByToken(token) {
  const userId = sessions.get(token);
  return users.find((user) => user.id === userId);
}

export function deleteSession(token) {
  sessions.delete(token);
}
