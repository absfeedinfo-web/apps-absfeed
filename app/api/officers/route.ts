
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const officers = await db.collection('officers').find({}).toArray();
    return NextResponse.json(officers);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
