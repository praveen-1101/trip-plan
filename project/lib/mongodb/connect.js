import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Log URI without credentials for debugging
console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@'));

// Use a better caching mechanism
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null,
    models: {},
    isConnected: false
  };
}

async function connectDB() {
  // If we're already connected, return the existing connection
  if (cached.conn && cached.isConnected) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  // Clear cache if connection was lost
  if (cached.conn && !cached.isConnected) {
    console.log('Previous connection lost, reconnecting...');
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      maxPoolSize: 10, // Limit number of connections
      family: 4, // Use IPv4
    };

    console.log('Connecting to MongoDB...');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        // Check connection state
        const connectionState = mongoose.connection.readyState;
        cached.isConnected = connectionState === 1; // 1 = connected
        
        if (cached.isConnected) {
          console.log('Successfully connected to MongoDB.');
          
          // Log the available collections
          mongoose.connection.db.listCollections().toArray()
            .then(collections => {
              console.log('Available collections:', collections.map(c => c.name));
            })
            .catch(err => console.error('Failed to list collections:', err));
        } else {
          console.warn('MongoDB connection state:', connectionState);
        }
        
        return mongoose;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        cached.promise = null;
        cached.isConnected = false;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    
    // Double check connection state after await
    cached.isConnected = mongoose.connection.readyState === 1;
    
    if (!cached.isConnected) {
      throw new Error('Failed to establish MongoDB connection');
    }
    
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.isConnected = false;
    console.error('Error in database connection:', e);
    throw e;
  }
}

// Add event listeners for connection status
if (typeof mongoose.connection.on === 'function') {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established');
    cached.isConnected = true;
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connection lost');
    cached.isConnected = false;
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    cached.isConnected = false;
  });
}

export default connectDB;