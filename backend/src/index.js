import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import * as db from './models/dbAdapter.js';
import { getSeedData } from './data/seedData.js';
import { startSimulation } from './services/simulation.js';

// Load route handlers
import authRoutes from './routes/authRoutes.js';
import droneRoutes from './routes/droneRoutes.js';
import disasterRoutes from './routes/disasterRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import visionRoutes from './routes/visionRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // support larger base64 uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/drones', droneRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vision', visionRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error occurred.', error: err.message });
});

// Bootstrapping function
async function bootstrap() {
  // 1. Database Connection (MongoDB with JSON Fallback)
  const isMongo = await connectDB();
  console.log(`Database engine loaded in: ${isMongo ? 'MongoDB' : 'JSON DB File Fallback'} mode.`);

  // 2. Self-seeding check: seed if no users are registered
  try {
    const users = await db.getUsers();
    if (users.length === 0) {
      console.log('Database is empty. Seeding default emergency datasets...');
      const seedData = await getSeedData();
      await db.resetJsonDb(seedData);
      console.log('Database seeded successfully.');
    }
  } catch (err) {
    console.error('Error during self-seeding check:', err.message);
  }

  // 3. Start real-time drone simulation scheduler
  startSimulation();

  // 4. Start HTTP Server
  app.listen(PORT, () => {
    console.log(`RescueDrone EOC Server running on http://localhost:${PORT}`);
  });
}

bootstrap();
