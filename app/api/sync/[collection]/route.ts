
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection: collectionName } = await params;
    const data = await request.json();
    const { db } = await connectToDatabase();
    
    console.log(`[API] Bulk sync triggered for collection: ${collectionName}`);

    // Updated validCollections to include 'sales' for cascading updates consistency
    const validCollections = ['products', 'customers', 'officers', 'sales'];
    if (!validCollections.includes(collectionName)) {
      console.error(`[API] Invalid sync attempt for collection: ${collectionName}`);
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    const collection = db.collection(collectionName);
    const deleteResult = await collection.deleteMany({});
    console.log(`[API] Deleted ${deleteResult.deletedCount} existing items from ${collectionName}`);
    
    let insertCount = 0;
    if (data && data.length > 0) {
      const insertResult = await collection.insertMany(data);
      insertCount = insertResult.insertedCount;
      console.log(`[API] Inserted ${insertCount} new items into ${collectionName}`);
    }
    
    return NextResponse.json({ success: true, count: insertCount });
  } catch (e: any) {
    console.error(`[API] Sync error for collection:`, e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
