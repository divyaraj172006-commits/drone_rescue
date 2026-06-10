import express from 'express';
import * as db from '../models/dbAdapter.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { getSeedData } from '../data/seedData.js';
import { setSimulationSpeed, getSimulationSpeed } from '../services/simulation.js';

const router = express.Router();

// Reset database to seed data (Admin only)
router.post('/reset-db', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const seedData = await getSeedData();
    await db.resetJsonDb(seedData);
    
    // Create alert about system reset
    await db.createAlert({
      message: 'System database has been reset to default emergency response seeds.',
      type: 'info',
      location: { lat: 12.6000, lng: 77.1000 }
    });

    res.json({ message: 'Database reset completed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get simulation speed
router.get('/simulation-speed', authenticateToken, (req, res) => {
  res.json({ speed: getSimulationSpeed() });
});

// Set simulation speed (Admin only or Operator)
router.post('/simulation-speed', authenticateToken, (req, res) => {
  const { speed } = req.body;
  if (!speed) return res.status(400).json({ message: 'Speed parameter is required.' });
  
  setSimulationSpeed(speed);
  res.json({ message: `Simulation speed successfully updated to ${speed}x.`, speed });
});

export default router;
