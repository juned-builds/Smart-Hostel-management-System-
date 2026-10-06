import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<string> {
  const customUri = process.env.MONGODB_URI?.trim();

  if (customUri) {
    try {
      console.log(`[DB] Attempting connection to configured MongoDB URI...`);
      await mongoose.connect(customUri);
      console.log(`[DB] Successfully connected to custom MongoDB URI.`);
      return customUri;
    } catch (err) {
      console.warn(`[DB] Could not connect to configured MONGODB_URI. Falling back to embedded MongoMemoryServer.`, err);
    }
  }

  // Fallback to embedded MongoMemoryServer for instant zero-config academic demo
  try {
    console.log(`[DB] Initializing embedded MongoDB server...`);
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`[DB] Connected to embedded MongoDB server at ${uri}`);
    return uri;
  } catch (error) {
    console.error(`[DB] Failed to initialize embedded MongoDB:`, error);
    throw error;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
