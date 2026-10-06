import mongoose from 'mongoose';
import net from 'net';

function checkPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

export async function connectDB(): Promise<string> {
  const mongoUri = process.env.MONGODB_URI?.trim() || 'mongodb://127.0.0.1:27017/smart_hostel';

  // Check if port 27017 is running; in cloud runner sandbox if no local service is active,
  // spin up local daemon on 27017 so mongodb://127.0.0.1:27017/smart_hostel is always available.
  const is27017Active = await checkPortOpen(27017, '127.0.0.1');
  if (!is27017Active) {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      await MongoMemoryServer.create({
        instance: { port: 27017, dbName: 'smart_hostel' },
      });
      console.log(`[DB] Local MongoDB daemon listening on 127.0.0.1:27017`);
    } catch (daemonErr) {
      console.warn(`[DB] Note: Could not auto-launch daemon on 27017:`, daemonErr);
    }
  }

  console.log(`[DB] Connecting to MongoDB Server at ${mongoUri}...`);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  const db = mongoose.connection;
  console.log(`[DB] Successfully connected to database: "${db.name}" on ${db.host}:${db.port}`);
  return mongoUri;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
