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

    const validCollections = ['products', 'customers', 'officers', 'sales', 'formulas'];
    if (!validCollections.includes(collectionName)) {
      console.error(`[API] Invalid sync attempt for collection: ${collectionName}`);
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    const collection = db.collection(collectionName);

    if (!data || data.length === 0) {
      await collection.deleteMany({});
      return NextResponse.json({ success: true, count: 0 });
    }

    // ✅ FIX: Use bulkWrite with upsert instead of delete+insert
    // This UPDATES existing records and INSERTS new ones
    // without touching MongoDB's _id field at all
    const operations = data.map((item: any) => {
      // Remove _id from the update payload to avoid conflicts
      const { _id, ...itemWithoutId } = item;
      
      // Use the business ID field to match records
      const idField = collectionName === 'sales' ? 'invoiceNo'
        : collectionName === 'products' ? 'code'
        : 'id'; // customers, officers all use 'id'

      return {
        updateOne: {
          filter: { [idField]: item[idField] },
          update: { $set: itemWithoutId },
          upsert: true // Insert if not found, update if found ✅
        }
      };
    });

    const result = await collection.bulkWrite(operations);
    
    console.log(`[API] Sync complete for ${collectionName}:`, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    });

    return NextResponse.json({ 
      success: true, 
      count: result.modifiedCount + result.upsertedCount 
    });

  } catch (e: any) {
    console.error(`[API] Sync error:`, e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}