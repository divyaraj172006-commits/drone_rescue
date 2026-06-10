import bcrypt from 'bcryptjs';

export async function getSeedData() {
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const operatorPassword = await bcrypt.hash('operator123', salt);

  const users = [
    {
      _id: 'u1',
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      name: 'EOC Director (Admin)'
    },
    {
      _id: 'u2',
      username: 'operator',
      password: operatorPassword,
      role: 'operator',
      name: 'UAV Operator'
    }
  ];

  const drones = [
    {
      _id: 'd1',
      name: 'Falcon-1',
      model: 'Quadcopter VTOL',
      status: 'idle',
      battery: 100,
      speed: 15,
      payloadCapacity: 5,
      currentLocation: { lat: 12.9716, lng: 77.5946 }, // Bengaluru Palace HQ
      homeBase: { lat: 12.9716, lng: 77.5946 }
    },
    {
      _id: 'd2',
      name: 'RescueEye-2',
      model: 'Heavy-Lift Hexacopter',
      status: 'idle',
      battery: 92,
      speed: 12,
      payloadCapacity: 10,
      currentLocation: { lat: 12.3052, lng: 76.6551 }, // Mysuru Palace EOC
      homeBase: { lat: 12.3052, lng: 76.6551 }
    },
    {
      _id: 'd3',
      name: 'Stratus-3',
      model: 'Fixed-Wing Long-Endurance',
      status: 'idle',
      battery: 78,
      speed: 22,
      payloadCapacity: 3,
      currentLocation: { lat: 12.5220, lng: 76.8970 }, // Mandya EOC Base
      homeBase: { lat: 12.5220, lng: 76.8970 }
    },
    {
      _id: 'd4',
      name: 'AquaDrone-4',
      model: 'Waterproof Amphibious UAV',
      status: 'idle',
      battery: 100,
      speed: 10,
      payloadCapacity: 8,
      currentLocation: { lat: 12.9625, lng: 77.5732 }, // Victoria Hospital
      homeBase: { lat: 12.9625, lng: 77.5732 }
    }
  ];

  const disasters = [
    {
      _id: 'dis1',
      title: 'Bellandur Lake Flash Flood',
      type: 'flood',
      severity: 'high',
      location: { lat: 12.9340, lng: 77.6710 },
      radius: 1000,
      reportedAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
      status: 'active',
      metrics: {
        rainfall: 120,
        windSpeed: 25,
        populationDensity: 1500,
        waterLevel: 1.8
      }
    },
    {
      _id: 'dis2',
      title: 'Bannerghatta Border Wildfire',
      type: 'wildfire',
      severity: 'medium',
      location: { lat: 12.8600, lng: 77.5100 },
      radius: 1500,
      reportedAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
      status: 'active',
      metrics: {
        rainfall: 0,
        windSpeed: 45,
        populationDensity: 200,
        waterLevel: 0.1
      }
    },
    {
      _id: 'dis3',
      title: 'Mysuru Heritage Palace Collapse',
      type: 'earthquake',
      severity: 'critical',
      location: { lat: 12.3052, lng: 76.6551 },
      radius: 600,
      reportedAt: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 hour ago
      status: 'active',
      metrics: {
        rainfall: 10,
        windSpeed: 15,
        populationDensity: 3000,
        waterLevel: 0.5
      }
    }
  ];

  const missions = [
    {
      _id: 'm1',
      title: 'Mysuru Palace Recon & Medical Delivery',
      droneId: 'd2',
      disasterId: 'dis3',
      priority: 'high',
      status: 'completed',
      route: [
        { lat: 12.3052, lng: 76.6551 },
        { lat: 12.3075, lng: 76.6520 },
        { lat: 12.3052, lng: 76.6551 }
      ],
      progress: 100,
      victimsFound: 6,
      allocatedResources: {
        ambulances: 6,
        rescueTeams: 5,
        foodKits: 212,
        medicalSupplies: 212,
        shelters: 1
      },
      createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString()
    }
  ];

  const alerts = [
    {
      _id: 'a1',
      message: 'CRITICAL Emergency: Mysuru Heritage Palace Structural Collapse reported. Evacuate immediately.',
      type: 'evacuation',
      location: { lat: 12.3052, lng: 76.6551 },
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      _id: 'a2',
      message: 'HIGH Emergency: Bellandur Lake Flash Flood reported. Avoid waterways.',
      type: 'warning',
      location: { lat: 12.9340, lng: 77.6710 },
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      _id: 'a3',
      message: 'MEDIUM Warning: Bannerghatta Border Wildfire active. Avoid reserve forest travel.',
      type: 'warning',
      location: { lat: 12.8600, lng: 77.5100 },
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ];

  return {
    users,
    drones,
    disasters,
    missions,
    alerts
  };
}
