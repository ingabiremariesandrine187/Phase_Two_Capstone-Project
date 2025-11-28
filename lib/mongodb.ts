import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  console.log(' Attempting to connect to MongoDB...');
  
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log(' Creating new MongoDB connection...');
    
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log(' MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error(' MongoDB connection failed:', error.message);
        console.log(' Tips:');
        console.log('   - Check your internet connection');
        console.log('   - Verify MongoDB Atlas cluster is running');
        console.log('   - Check if your IP is whitelisted in MongoDB Atlas');
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error(' Failed to establish MongoDB connection');
    cached.promise = null;
    throw error;
  }
}

export default connectDB;