
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const sales = await db.collection('sales').find({}).toArray();
    console.log(`[API] Fetched ${sales.length} sales records.`);
    return NextResponse.json(sales);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sale = await request.json();
    const { db } = await connectToDatabase();

    console.log(`[API] Processing new sale: #ABS-${sale.invoiceNo}`);

    // 1. Insert the sale record
    await db.collection('sales').insertOne(sale);
    console.log(`[API] Sale record #ABS-${sale.invoiceNo} inserted.`);

    // 2. Update Product Stock
    for (const item of sale.items) {
      const res = await db.collection('products').updateOne(
        { code: item.productCode },
        { $inc: { stock: -item.quantity } }
      );
      if (res.modifiedCount > 0) {
        console.log(`[API] Stock updated for product ${item.productCode}: -${item.quantity}`);
      }
    }

    // 3. Update Customer Balance
    if (sale.dueAmount !== 0) {
      const res = await db.collection('customers').updateOne(
        { id: sale.customerId },
        { $inc: { balance: -sale.dueAmount } }
      );
      if (res.modifiedCount > 0) {
        console.log(`[API] Customer ${sale.customerId} balance updated: -${sale.dueAmount}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(`[API] Sale processing error:`, e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceNo = searchParams.get('invoiceNo');
    if (!invoiceNo) return NextResponse.json({ error: "Missing invoiceNo" }, { status: 400 });

    const { db } = await connectToDatabase();
    console.log(`[API] Attempting to delete sale: #ABS-${invoiceNo}`);
    
    const sale = await db.collection('sales').findOne({ invoiceNo });
    if (!sale) {
      console.warn(`[API] Delete failed: Sale #ABS-${invoiceNo} not found.`);
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Reverse Stock Updates
    for (const item of sale.items) {
      await db.collection('products').updateOne(
        { code: item.productCode },
        { $inc: { stock: item.quantity } }
      );
    }

    // Reverse Customer Balance
    if (sale.dueAmount !== 0) {
      await db.collection('customers').updateOne(
        { id: sale.customerId },
        { $inc: { balance: sale.dueAmount } }
      );
    }

    await db.collection('sales').deleteOne({ invoiceNo });
    console.log(`[API] Sale #ABS-${invoiceNo} deleted and inventory/balances reverted.`);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(`[API] Sale deletion error:`, e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
