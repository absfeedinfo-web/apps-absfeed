
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const customers = await db.collection('customers').find({}).toArray();
    return NextResponse.json(customers);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
