import express from 'express';
import * as db from '../models/dbAdapter.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { findOptimizedRoute } from '../services/pathfinding.js';
import { allocateResources } from '../services/resourceAllocation.js';

const router = express.Router();

// Get all missions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const missions = await db.getMissions(true);
    res.json(missions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Calculate resource recommendations dynamically
router.post('/recommend-resources', authenticateToken, async (req, res) => {
  try {
    const { severity, victimCount } = req.body;
    if (!severity) {
      return res.status(400).json({ message: 'Disaster severity is required.' });
    }
    const allocation = allocateResources(severity, victimCount || 0);
    res.json(allocation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new mission (Run A* and Resource Allocation, Update Drone Status)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, droneId, disasterId, priority, victimsCount } = req.body;

    if (!title || !droneId || !disasterId || !priority) {
      return res.status(400).json({ message: 'Missing title, droneId, disasterId, or priority.' });
    }

    // 1. Fetch Drone and Disaster details
    const drone = await db.getDroneById(droneId);
    if (!drone) return res.status(404).json({ message: 'Drone not found' });
    if (drone.status !== 'idle') {
      return res.status(400).json({ message: `Drone is currently ${drone.status}. Choose an idle drone.` });
    }

    const disaster = await db.getDisasterById(disasterId);
    if (!disaster) return res.status(404).json({ message: 'Disaster not found' });

    // 2. Fetch active disasters to treat as A* grid obstacles
    const allDisasters = await db.getDisasters();
    const activeDisasters = allDisasters.filter(d => d.status === 'active');

    // 3. Generate route using A* pathfinding
    const route = findOptimizedRoute(
      drone.currentLocation,
      disaster.location,
      activeDisasters,
      disasterId
    );

    // 4. Calculate recommended resources
    const allocation = allocateResources(disaster.severity, victimsCount || 0);

    // 5. Create mission
    const newMission = await db.createMission({
      title,
      droneId: drone._id,
      disasterId: disaster._id,
      priority,
      status: 'active', // starts immediately
      route,
      progress: 0,
      victimsFound: victimsCount || 0,
      allocatedResources: {
        ambulances: allocation.ambulances,
        rescueTeams: allocation.rescueTeams,
        foodKits: allocation.foodKits,
        medicalSupplies: allocation.medicalSupplies,
        shelters: allocation.shelters
      }
    });

    // 6. Set drone status to en_route
    await db.updateDrone(drone._id, { status: 'en_route' });

    // 7. Create Alert
    await db.createAlert({
      message: `Mission Launched: Drone ${drone.name} is en route to ${disaster.title} with resource payload.`,
      type: 'info',
      location: drone.currentLocation
    });

    // Return populated mission object
    const populated = await db.getMissionById(newMission._id, true);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single mission
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const mission = await db.getMissionById(req.params.id, true);
    if (!mission) return res.status(404).json({ message: 'Mission not found' });
    res.json(mission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update mission
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status, progress, victimsFound } = req.body;
    const oldMission = await db.getMissionById(req.params.id, false);
    if (!oldMission) return res.status(404).json({ message: 'Mission not found' });

    const updated = await db.updateMission(req.params.id, req.body);

    // Update drone status accordingly if mission status changes
    if (status && status !== oldMission.status) {
      const droneId = oldMission.droneId;
      if (status === 'completed' || status === 'cancelled') {
        // Drone returns home or becomes idle. Let's say it returns home (changes location and goes idle)
        const drone = await db.getDroneById(droneId);
        if (drone) {
          await db.updateDrone(droneId, {
            status: 'idle',
            currentLocation: drone.homeBase // return home on completion
          });
          
          await db.createAlert({
            message: `Mission ${status.toUpperCase()}: Drone ${drone.name} has returned to base and is now IDLE.`,
            type: 'info',
            location: drone.homeBase
          });
        }
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete mission (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const deleted = await db.deleteMission(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Mission not found' });
    res.json({ message: 'Mission deleted successfully.', deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
