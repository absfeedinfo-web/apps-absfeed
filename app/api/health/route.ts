
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    // Confirm connection is live
    await db.command({ ping: 1 });
    console.log("[API] Health check passed: MongoDB is reachable.");
    return NextResponse.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (e: any) {
    console.error("[API] Health check failed:", e.message);
    return NextResponse.json({ status: 'error', database: 'disconnected', error: e.message }, { status: 500 });
  }
}
