
import { MongoClient, Db, ServerApiVersion } from 'mongodb';

// Password from previous prompt: JLrQFVl3aX92VgMd
// Cluster from latest sample: cluster0.rxywjg9.mongodb.net
const MONGODB_URI = "mongodb+srv://absfeedinfo_db_user:JLrQFVl3aX92VgMd@cluster0.rxywjg9.mongodb.net/abs_feed_erp?retryWrites=true&w=majority&appName=Cluster0";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  console.log("[MongoDB] Initializing new connection...");
  
  const client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    // Verify connection with a ping
    await client.db("admin").command({ ping: 1 });
    console.log("[MongoDB] Connected successfully to Atlas Cluster");
    
    const db = client.db("abs_feed_erp");
    cachedClient = client;
    cachedDb = db;
    return { client, db };
  } catch (err) {
    console.error("[MongoDB] Connection failed:", err);
    throw err;
  }
}
