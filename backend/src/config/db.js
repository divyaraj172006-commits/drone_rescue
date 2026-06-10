import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isMongoConnected = false;
const fallbackDbPath = path.resolve('src/data/db.json');

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;

  if (mongoURI) {
    try {
      console.log('Attempting to connect to MongoDB...');
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s
      });
      isMongoConnected = true;
      console.log('MongoDB connected successfully.');
    } catch (err) {
      console.error('MongoDB connection failed. Falling back to local JSON database.', err.message);
      isMongoConnected = false;
    }
  } else {
    console.log('No MONGODB_URI provided. Using local JSON database fallback.');
    isMongoConnected = false;
  }

  // Ensure JSON database exists if we are in fallback mode
  if (!isMongoConnected) {
    ensureJsonDbExists();
  }

  return isMongoConnected;
}

export function getDbMode() {
  return isMongoConnected ? 'mongodb' : 'json';
}

function ensureJsonDbExists() {
  const dir = path.dirname(fallbackDbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(fallbackDbPath)) {
    console.log('Creating template JSON database at:', fallbackDbPath);
    const initialData = {
      users: [],
      drones: [],
      disasters: [],
      missions: [],
      alerts: []
    };
    fs.writeFileSync(fallbackDbPath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}
