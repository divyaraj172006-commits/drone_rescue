import express from 'express';
import * as db from '../models/dbAdapter.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all drones
router.get('/', authenticateToken, async (req, res) => {
  try {
    const drones = await db.getDrones();
    res.json(drones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single drone
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const drone = await db.getDroneById(req.params.id);
    if (!drone) return res.status(404).json({ message: 'Drone not found' });
    res.json(drone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new drone (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, model, speed, payloadCapacity, currentLocation, homeBase } = req.body;
    if (!name || !model || !currentLocation || !homeBase) {
      return res.status(400).json({ message: 'Missing required drone properties.' });
    }

    const newDrone = await db.createDrone({
      name,
      model,
      speed: parseFloat(speed) || 15,
      payloadCapacity: parseFloat(payloadCapacity) || 5,
      currentLocation,
      homeBase,
      status: 'idle',
      battery: 100
    });

    res.status(201).json(newDrone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update drone (Admin or Operator)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await db.updateDrone(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Drone not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete drone (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const deleted = await db.deleteDrone(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Drone not found' });
    res.json({ message: 'Drone deleted successfully.', deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
