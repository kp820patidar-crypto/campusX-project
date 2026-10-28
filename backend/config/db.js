import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (uri && uri.trim() !== '') {
      console.log(`📡 Connecting to MongoDB at ${uri.includes('mongodb+srv') ? 'MongoDB Atlas cluster' : uri}...`);
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB successfully.');
      return;
    }

    // Fallback: If no MONGODB_URI is provided, start MongoMemoryServer for instant local zero-config running
    console.log('ℹ️ No MONGODB_URI provided in environment. Starting embedded MongoDB server...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memUri = mongoMemoryServer.getUri();
    await mongoose.connect(memUri);
    console.log(`✅ Connected to embedded MongoDB at ${memUri}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // If external URI failed, try embedded fallback so app stays functional
    if (!mongoMemoryServer) {
      try {
        console.log('🔄 Attempting fallback to embedded MongoDB server...');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`✅ Connected to fallback embedded MongoDB at ${memUri}`);
        return;
      } catch (fallbackError) {
        console.error('❌ Embedded MongoDB fallback also failed:', fallbackError.message);
      }
    }
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('Error closing DB:', err);
  }
};

