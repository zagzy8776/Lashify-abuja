import { jwtVerify, type JWTPayload } from 'jose';

export const ADMIN_COOKIE_NAME = 'admin_token';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured and at least 32 characters long');
  }
  return new TextEncoder().encode(secret);
}

export function getAdminEmail() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error('ADMIN_EMAIL is not configured');
  return email;
}

export async function verifyAdminToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] });

  if (payload.role !== 'admin' || typeof payload.email !== 'string') {
    throw new Error('Invalid admin token');
  }
  if (payload.email.toLowerCase() !== getAdminEmail()) {
    throw new Error('Invalid admin token');
  }

  return payload;
}
