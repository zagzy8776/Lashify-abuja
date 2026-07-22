import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@lashifyabuja.com';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    let isValid = false;

    if (process.env.ADMIN_PASSWORD) {
      // If user set a plain text password in Vercel (easiest for them)
      isValid = password === process.env.ADMIN_PASSWORD;
    } else if (process.env.ADMIN_PASSWORD_HASH) {
      // If user set a bcrypt hash in Vercel (more secure)
      isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    } else {
      // Default fallback if no env vars are set
      if (process.env.NODE_ENV !== 'production' && password === 'admin123') {
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ email, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secretKey);

    const response = NextResponse.json({ success: true });
    
    // Set HTTP-only cookie
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
