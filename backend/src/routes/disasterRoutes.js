import express from 'express';
import * as db from '../models/dbAdapter.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { predictSeverity } from '../services/severityPredictor.js';

const router = express.Router();

// Get all disasters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const disasters = await db.getDisasters();
    res.json(disasters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Run AI ML Severity Prediction
router.post('/predict', authenticateToken, (req, res) => {
  try {
    const { type, rainfall, windSpeed, populationDensity, waterLevel } = req.body;
    if (!type) {
      return res.status(400).json({ message: 'Disaster type is required for prediction.' });
    }

    const prediction = predictSeverity({ type, rainfall, windSpeed, populationDensity, waterLevel });
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new disaster (includes automatic severity prediction and alert generation)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, type, location, radius, metrics } = req.body;

    if (!title || !type || !location) {
      return res.status(400).json({ message: 'Missing title, type, or location.' });
    }

    // Auto-predict severity
    const prediction = predictSeverity({
      type,
      rainfall: metrics?.rainfall || 0,
      windSpeed: metrics?.windSpeed || 0,
      populationDensity: metrics?.populationDensity || 0,
      waterLevel: metrics?.waterLevel || 0
    });

    const newDisaster = await db.createDisaster({
      title,
      type,
      location,
      radius: parseFloat(radius) || 500,
      severity: prediction.severity,
      metrics: {
        rainfall: parseFloat(metrics?.rainfall) || 0,
        windSpeed: parseFloat(metrics?.windSpeed) || 0,
        populationDensity: parseFloat(metrics?.populationDensity) || 0,
        waterLevel: parseFloat(metrics?.waterLevel) || 0
      },
      status: 'active'
    });

    // Create automatic warning alert
    const alertMessage = `${newDisaster.severity.toUpperCase()} Emergency: ${newDisaster.type.toUpperCase()} - ${newDisaster.title} reported. Please avoid the area within ${newDisaster.radius}m radius.`;
    await db.createAlert({
      message: alertMessage,
      type: newDisaster.severity === 'critical' || newDisaster.severity === 'high' ? 'evacuation' : 'warning',
      location: newDisaster.location
    });

    res.status(201).json({ disaster: newDisaster, prediction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single disaster
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const disaster = await db.getDisasterById(req.params.id);
    if (!disaster) return res.status(404).json({ message: 'Disaster not found' });
    res.json(disaster);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update disaster
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await db.updateDisaster(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Disaster not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete disaster (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const deleted = await db.deleteDisaster(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Disaster not found' });
    res.json({ message: 'Disaster deleted successfully.', deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
