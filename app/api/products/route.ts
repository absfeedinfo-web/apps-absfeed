
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const products = await db.collection('products').find({}).toArray();
    return NextResponse.json(products);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
