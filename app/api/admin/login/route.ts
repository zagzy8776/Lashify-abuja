import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { timingSafeEqual } from 'node:crypto';
import { getAdminEmail, getJwtSecret, ADMIN_COOKIE_NAME } from '@/src/lib/admin-auth';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW_MS });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearFailures(key: string) {
  attempts.delete(key);
}

function safePasswordCompare(password: string, expected: string) {
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password || email.length > 254 || password.length > 256) {
      recordFailure(clientKey);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (email !== getAdminEmail()) {
      recordFailure(clientKey);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    const legacyPassword = process.env.ADMIN_PASSWORD;
    let isValid = false;

    if (passwordHash) {
      isValid = await bcrypt.compare(password, passwordHash);
    } else if (legacyPassword) {
      // Backwards-compatible only when explicitly configured; prefer ADMIN_PASSWORD_HASH.
      isValid = safePasswordCompare(password, legacyPassword);
    } else {
      console.error('Admin authentication is not configured: set ADMIN_PASSWORD_HASH and JWT_SECRET.');
      return NextResponse.json({ error: 'Admin authentication is not configured' }, { status: 503 });
    }

    if (!isValid) {
      recordFailure(clientKey);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    clearFailures(clientKey);

    const token = await new SignJWT({ email, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(getJwtSecret());

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
