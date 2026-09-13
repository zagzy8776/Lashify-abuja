import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, getAdminEmail, getJwtSecret, verifyAdminToken } from './admin-auth-core';

export { ADMIN_COOKIE_NAME, getAdminEmail, getJwtSecret, verifyAdminToken } from './admin-auth-core';

export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (!token) throw new Error('Unauthorized');
  return verifyAdminToken(token);
}
