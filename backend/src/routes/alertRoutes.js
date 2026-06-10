import express from 'express';
import * as db from '../models/dbAdapter.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all alerts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const alerts = await db.getAlerts();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new alert
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { message, type, location } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const newAlert = await db.createAlert({
      message,
      type: type || 'info',
      location: location || null
    });

    res.status(201).json(newAlert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete alert
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await db.deleteAlert(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert deleted successfully.', deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
