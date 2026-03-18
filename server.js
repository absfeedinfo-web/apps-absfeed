
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// MongoDB Connection URI
const uri = "mongodb+srv://absfeedinfo_db_user:JLrQFVl3aX92VgMd@cluster0.mongodb.net/abs_feed_erp?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Permissive CORS for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

let db;

async function connectDB() {
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    await client.connect();
    db = client.db("abs_feed_erp");
    console.log("Successfully connected to MongoDB Atlas");
    console.log("Express Server listening on port " + port);
  } catch (e) {
    console.error("MongoDB Connection error:", e);
    // Exit process if DB connection fails to let supervisor restart
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

// Specific Sales Routes
app.post('/api/sales', async (req, res) => {
  try {
    const sale = req.body;
    const salesCol = db.collection('sales');
    const productsCol = db.collection('products');
    const customersCol = db.collection('customers');

    await salesCol.insertOne(sale);

    // Update Product Stock
    for (const item of sale.items) {
      await productsCol.updateOne(
        { code: item.productCode },
        { $inc: { stock: -item.quantity } }
      );
    }

    // Update Customer Balance
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

app.delete('/api/sales/:invoiceNo', async (req, res) => {
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

// Bulk sync for master data
app.post('/api/sync/:collection', async (req, res) => {
  try {
    const collectionName = req.params.collection;
    const data = req.body;
    const collection = db.collection(collectionName);
    
    await collection.deleteMany({});
    if (data && data.length > 0) {
      await collection.insertMany(data);
    }
    res.json({ success: true, count: data ? data.length : 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Generic find all
app.get('/api/:collection', async (req, res) => {
  try {
    const collectionName = req.params.collection;
    if (!db) return res.status(503).json({ error: "Database not connected" });
    
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Catch-all 404 for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: "API Route not found", url: req.originalUrl });
});

app.listen(port, () => {
  console.log(`Server started. API accessible at http://localhost:${port}/api`);
});
