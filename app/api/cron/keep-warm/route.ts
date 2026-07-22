import { NextResponse } from 'next/server';

// GET handler for Vercel Cron job to keep the serverless functions warm
export async function GET() {
  // Simply return success to prevent cold starts
  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}