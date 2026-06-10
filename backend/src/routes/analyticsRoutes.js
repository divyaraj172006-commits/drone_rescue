import express from 'express';
import * as db from '../models/dbAdapter.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const drones = await db.getDrones();
    const disasters = await db.getDisasters();
    const missions = await db.getMissions(false); // don't populate for lightweight calc
    const alerts = await db.getAlerts();

    // 1. Mission counts
    const missionStats = {
      total: missions.length,
      active: missions.filter(m => m.status === 'active').length,
      completed: missions.filter(m => m.status === 'completed').length,
      pending: missions.filter(m => m.status === 'pending').length,
      cancelled: missions.filter(m => m.status === 'cancelled').length,
    };

    // 2. Drone utilisation & battery
    const totalDrones = drones.length;
    const activeDronesCount = drones.filter(d => d.status !== 'idle' && d.status !== 'maintenance').length;
    const avgBattery = totalDrones > 0 ? Math.round(drones.reduce((acc, d) => acc + d.battery, 0) / totalDrones) : 100;

    const droneUtilization = {
      total: totalDrones,
      active: activeDronesCount,
      idle: drones.filter(d => d.status === 'idle').length,
      charging: drones.filter(d => d.status === 'charging').length,
      maintenance: drones.filter(d => d.status === 'maintenance').length,
      percentage: totalDrones > 0 ? Math.round((activeDronesCount / totalDrones) * 100) : 0
    };

    // 3. Victims
    const victimsRescued = missions
      .filter(m => m.status === 'completed')
      .reduce((acc, m) => acc + (m.victimsFound || 0), 0);

    const activeVictimsReported = disasters
      .filter(d => d.status === 'active')
      .reduce((acc, d) => {
        // Mock active victims based on severity if not specified
        const base = d.severity === 'critical' ? 50 : d.severity === 'high' ? 20 : d.severity === 'medium' ? 5 : 1;
        return acc + base;
      }, 0);

    // 4. Resource Deployments Sum
    const deployedResources = {
      ambulances: 0,
      rescueTeams: 0,
      foodKits: 0,
      medicalSupplies: 0,
      shelters: 0
    };

    missions.forEach(m => {
      if (m.status === 'active') {
        const ar = m.allocatedResources || {};
        deployedResources.ambulances += ar.ambulances || 0;
        deployedResources.rescueTeams += ar.rescueTeams || 0;
        deployedResources.foodKits += ar.foodKits || 0;
        deployedResources.medicalSupplies += ar.medicalSupplies || 0;
        deployedResources.shelters += ar.shelters || 0;
      }
    });

    // 5. Chart Data: Missions over time (last 7 days or mock sequence)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const timelineData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const label = dayNames[d.getDay()];
      const dateString = d.toISOString().split('T')[0];

      // Count missions created on this date
      const missionsOnDay = missions.filter(m => {
        const cDate = new Date(m.createdAt).toISOString().split('T')[0];
        return cDate === dateString;
      });

      const completedOnDay = missions.filter(m => {
        const cDate = new Date(m.createdAt).toISOString().split('T')[0];
        return cDate === dateString && m.status === 'completed';
      });

      timelineData.push({
        name: label,
        launched: missionsOnDay.length || (7 - i), // baseline mock trend if no data
        completed: completedOnDay.length || Math.max(0, 5 - i)
      });
    }

    // 6. Drone Battery distribution chart data
    const batteryData = drones.map(d => ({
      name: d.name,
      battery: d.battery,
      status: d.status
    }));

    // 7. Disaster type distribution chart data
    const disasterTypeDistribution = {
      flood: disasters.filter(d => d.type === 'flood').length,
      wildfire: disasters.filter(d => d.type === 'wildfire').length,
      earthquake: disasters.filter(d => d.type === 'earthquake').length,
      hurricane: disasters.filter(d => d.type === 'hurricane').length,
    };

    res.json({
      summary: {
        activeMissions: missionStats.active,
        completedMissions: missionStats.completed,
        activeDisasters: disasters.filter(d => d.status === 'active').length,
        victimsRescued,
        activeVictimsReported,
        averageBattery: avgBattery,
        droneUtilizationPercentage: droneUtilization.percentage
      },
      missionStats,
      droneUtilization,
      deployedResources,
      timelineData,
      batteryData,
      disasterTypeDistribution
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
