import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    // Production or configured Atlas connection
    if (uri && uri.trim() !== '') {
      console.log(`📡 Connecting to MongoDB at ${uri.includes('mongodb+srv') ? 'MongoDB Atlas cluster' : uri}...`);
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB successfully.');
      return;
    }

    // If in production and no MONGODB_URI was supplied
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI environment variable is required in production. Please set it in your Render Environment Variables.');
    }

    // Local Development Fallback: Dynamically import mongodb-memory-server so it is not required in production
    console.log('ℹ️ No MONGODB_URI provided in environment. Starting local embedded MongoDB server...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memUri = mongoMemoryServer.getUri();
    await mongoose.connect(memUri);
    console.log(`✅ Connected to embedded MongoDB at ${memUri}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
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
