import * as db from '../models/dbAdapter.js';

let simulationInterval = null;
let simulationSpeed = 1.5; // multiplier for progress increment

// Helper to interpolate between two coordinates
function interpolate(coord1, coord2, fraction) {
  return {
    lat: coord1.lat + (coord2.lat - coord1.lat) * fraction,
    lng: coord1.lng + (coord2.lng - coord1.lng) * fraction
  };
}

// Get coordinate at a fraction of the route
function getRouteCoordinate(route, fraction) {
  if (!route || route.length === 0) return null;
  if (route.length === 1) return route[0];
  if (fraction <= 0) return route[0];
  if (fraction >= 1) return route[route.length - 1];

  const totalSegments = route.length - 1;
  const rawIndex = fraction * totalSegments;
  const segmentIdx = Math.floor(rawIndex);
  const segmentFraction = rawIndex - segmentIdx;

  return interpolate(route[segmentIdx], route[segmentIdx + 1], segmentFraction);
}

export function startSimulation() {
  if (simulationInterval) return;

  console.log('Starting drone mission simulation engine...');
  simulationInterval = setInterval(async () => {
    try {
      // Fetch all missions
      const allMissions = await db.getMissions(false);
      const activeMissions = allMissions.filter(m => m.status === 'active');

      for (const m of activeMissions) {
        // Fetch full mission details (with populated data manually to be safe)
        const mission = await db.getMissionById(m._id, true);
        if (!mission || !mission.droneId || !mission.disasterId) continue;

        const drone = mission.droneId;
        const disaster = mission.disasterId;
        const route = mission.route;

        // 1. Calculate new progress
        let newProgress = (mission.progress || 0) + (2 * simulationSpeed);
        if (newProgress >= 100) newProgress = 100;

        // 2. Drone state updates based on progress
        let newLocation = { ...drone.currentLocation };
        let newDroneStatus = drone.status;
        let batteryDrop = 0.5 * simulationSpeed;

        if (newProgress < 45) {
          // Phase 1: En Route to disaster (0% to 45%)
          newDroneStatus = 'en_route';
          const fraction = newProgress / 45;
          const pos = getRouteCoordinate(route, fraction);
          if (pos) newLocation = pos;
        } else if (newProgress >= 45 && newProgress < 65) {
          // Phase 2: On-site Search and Rescue (45% to 65%)
          // Hovering around disaster location
          newDroneStatus = 'en_route';
          newLocation = { ...disaster.location };
          
          // Jitter location slightly to simulate scanning
          newLocation.lat += (Math.random() - 0.5) * 0.0004;
          newLocation.lng += (Math.random() - 0.5) * 0.0004;
          batteryDrop = 0.8 * simulationSpeed; // higher consumption when hovering/searching
        } else if (newProgress >= 65 && newProgress < 100) {
          // Phase 3: Returning to Base (65% to 100%)
          newDroneStatus = 'returning';
          // Progress fraction from 0 to 1
          const fraction = (newProgress - 65) / 35;
          // Return is in reverse, so interpolate from disaster location back to home base
          const pos = getRouteCoordinate(route, 1 - fraction); // route starts at base and ends at disaster
          if (pos) newLocation = pos;
        }

        // 3. Update battery
        const newBattery = Math.max(0, Math.round(drone.battery - batteryDrop));

        // Send alert if battery is low
        if (newBattery <= 20 && drone.battery > 20) {
          await db.createAlert({
            message: `CRITICAL ALERT: Drone ${drone.name} battery at ${newBattery}% during mission "${mission.title}".`,
            type: 'warning',
            location: newLocation
          });
        }

        // 4. Check for completed state
        if (newProgress >= 100) {
          // Complete mission
          await db.updateMission(mission._id, {
            progress: 100,
            status: 'completed'
          });

          // Reset drone to idle, home location, and recharge if home
          await db.updateDrone(drone._id, {
            status: 'idle',
            currentLocation: drone.homeBase,
            battery: newBattery
          });

          await db.createAlert({
            message: `MISSION SUCCESS: "${mission.title}" completed. Drone ${drone.name} returned to base with ${newBattery}% battery. ${mission.victimsFound} victims assisted.`,
            type: 'info',
            location: drone.homeBase
          });
        } else {
          // Update mission progress
          await db.updateMission(mission._id, {
            progress: Math.round(newProgress)
          });

          // Update drone status, location, battery
          await db.updateDrone(drone._id, {
            status: newDroneStatus,
            currentLocation: newLocation,
            battery: newBattery
          });
        }
      }

      // Also simulate battery charging for idle drones that are at home base and not at 100%
      const drones = await db.getDrones();
      for (const d of drones) {
        if (d.status === 'idle' && d.battery < 100) {
          // If battery is low, maybe set status to charging
          const targetStatus = d.battery < 95 ? 'charging' : 'idle';
          const chargeRate = 2; // 2% per tick
          const nextBattery = Math.min(100, d.battery + chargeRate);
          
          await db.updateDrone(d._id, {
            status: nextBattery === 100 ? 'idle' : targetStatus,
            battery: nextBattery
          });
        }
      }

    } catch (err) {
      console.error('Error in simulation engine tick:', err.message);
    }
  }, 3000); // Ticks every 3 seconds
}

export function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('Drone mission simulation engine stopped.');
  }
}

export function setSimulationSpeed(speed) {
  simulationSpeed = parseFloat(speed) || 1.0;
  console.log(`Simulation speed set to ${simulationSpeed}x`);
}

export function getSimulationSpeed() {
  return simulationSpeed;
}
