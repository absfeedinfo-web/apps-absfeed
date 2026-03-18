const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

const uri = "mongodb+srv://apps_admin:53%40nMTi%40wSiM9La@apps-cluster.v4kqifc.mongodb.net/abs_feed_erp?retryWrites=true&w=majority&appName=apps-cluster";
const client = new MongoClient(uri);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Replace with this
app.options('/(.*)', cors());
app.use(express.json());

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("abs_feed_erp");
    console.log("✅ Connected to MongoDB Atlas");

    // ✅ Only one app.listen(), lives here
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (e) {
    console.error("❌ MongoDB Connection error:", e);
    process.exit(1);
  }
}

connectDB();

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    database: db ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// POST Sale
app.post('/api/sales', async (req, res) => {
  if (!db) return res.status(503).json({ error: "Database not connected" });
  try {
    const sale = req.body;
    const salesCol = db.collection('sales');
    const productsCol = db.collection('products');
    const customersCol = db.collection('customers');

    await salesCol.insertOne(sale);

    for (const item of sale.items) {
      await productsCol.updateOne(
        { code: item.productCode },
        { $inc: { stock: -item.quantity } }
      );
    }

    if (sale.dueAmount > 0) {
      await customersCol.updateOne(
        { id: sale.customerId },
        { $inc: { balance: -sale.dueAmount } }
      );
    }

    res.json({ success: true });
  } catch (e) {
    console.error("Sale error:", e);
    res.status(500).json({ error: e.message });
  }
});

// DELETE Sale
app.delete('/api/sales/:invoiceNo', async (req, res) => {
  if (!db) return res.status(503).json({ error: "Database not connected" });
  try {
    const inv = req.params.invoiceNo;
    const salesCol = db.collection('sales');
    const productsCol = db.collection('products');
    const customersCol = db.collection('customers');

    const sale = await salesCol.findOne({ invoiceNo: inv });
    if (!sale) return res.status(404).json({ error: "Sale not found" });

    for (const item of sale.items) {
      await productsCol.updateOne(
        { code: item.productCode },
        { $inc: { stock: item.quantity } }
      );
    }

    if (sale.dueAmount > 0) {
      await customersCol.updateOne(
        { id: sale.customerId },
        { $inc: { balance: sale.dueAmount } }
      );
    }

    await salesCol.deleteOne({ invoiceNo: inv });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Bulk Sync
app.post('/api/sync/:collection', async (req, res) => {
  if (!db) return res.status(503).json({ error: "Database not connected" });
  try {
    const collectionName = req.params.collection;
    const data = req.body;

    // ✅ Validate BEFORE deleting existing data
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Body must be an array" });
    }

    const collection = db.collection(collectionName);
    await collection.deleteMany({});
    if (data.length > 0) {
      await collection.insertMany(data);
    }
    res.json({ success: true, count: data.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Generic GET all
app.get('/api/:collection', async (req, res) => {
  if (!db) return res.status(503).json({ error: "Database not connected" });
  try {
    const collection = db.collection(req.params.collection);
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Catch-all 404
app.use('/api', (req, res) => {
  res.status(404).json({ error: "API Route not found", url: req.originalUrl });
});
