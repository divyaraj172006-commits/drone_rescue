import fs from 'fs';
import path from 'path';
import { getDbMode } from '../config/db.js';
import * as MongooseModels from './mongooseSchemas.js';

const jsonDbPath = path.resolve('src/data/db.json');

// Helper to read JSON DB
function readJsonDb() {
  try {
    const data = fs.readFileSync(jsonDbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON DB file:', err.message);
    return { users: [], drones: [], disasters: [], missions: [], alerts: [] };
  }
}

// Helper to write JSON DB
function writeJsonDb(data) {
  try {
    fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing JSON DB file:', err.message);
  }
}

// Generate unique ID for JSON models
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Convert string ID to Mongoose ObjectId if in MongoDB mode, otherwise return string
function cleanId(id) {
  return id;
}

// --- USER OPERATIONS ---
export async function getUserByUsername(username) {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.User.findOne({ username });
  } else {
    const db = readJsonDb();
    return db.users.find(u => u.username === username) || null;
  }
}

export async function getUserById(id) {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.User.findById(id);
  } else {
    const db = readJsonDb();
    return db.users.find(u => u._id === id) || null;
  }
}

export async function createUser(userData) {
  if (getDbMode() === 'mongodb') {
    const newUser = new MongooseModels.User(userData);
    return await newUser.save();
  } else {
    const db = readJsonDb();
    const newUser = { _id: generateId(), ...userData };
    db.users.push(newUser);
    writeJsonDb(db);
    return newUser;
  }
}

export async function getUsers() {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.User.find({}, '-password');
  } else {
    const db = readJsonDb();
    // Exclude password
    return db.users.map(({ password, ...u }) => u);
  }
}

// --- DRONE OPERATIONS ---
export async function getDrones() {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.Drone.find({});
  } else {
    const db = readJsonDb();
    return db.drones;
  }
}

export async function getDroneById(id) {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.Drone.findById(id);
  } else {
    const db = readJsonDb();
    return db.drones.find(d => d._id === id) || null;
  }
}

export async function createDrone(droneData) {
  if (getDbMode() === 'mongodb') {
    const newDrone = new MongooseModels.Drone(droneData);
    return await newDrone.save();
  } else {
    const db = readJsonDb();
    const newDrone = { _id: generateId(), ...droneData, status: droneData.status || 'idle', battery: droneData.battery ?? 100 };
    db.drones.push(newDrone);
    writeJsonDb(db);
    return newDrone;
  }
}

export async function updateDrone(id, droneData) {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.Drone.findByIdAndUpdate(id, droneData, { new: true });
  } else {
    const db = readJsonDb();
    const idx = db.drones.findIndex(d => d._id === id);
    if (idx === -1) return null;
    db.drones[idx] = { ...db.drones[idx], ...droneData };
    writeJsonDb(db);
    return db.drones[idx];
  }
}

export async function deleteDrone(id) {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.Drone.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    const idx = db.drones.findIndex(d => d._id === id);
    if (idx === -1) return null;
    const deleted = db.drones.splice(idx, 1)[0];
    writeJsonDb(db);
    return deleted;
  }
}

// --- DISASTER OPERATIONS ---
export async function getDisasters() {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.Disaster.find({});
  } else {
    const db = readJsonDb();
    return db.disasters;
  }
}

export async function getDisasterById(id) {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.Disaster.findById(id);
  } else {
    const db = readJsonDb();
    return db.disasters.find(d => d._id === id) || null;
  }
}

export async function createDisaster(disasterData) {
  if (getDbMode() === 'mongodb') {
    const newDisaster = new MongooseModels.Disaster(disasterData);
    return await newDisaster.save();
  } else {
    const db = readJsonDb();
    const newDisaster = {
      _id: generateId(),
      reportedAt: new Date().toISOString(),
      status: 'active',
      ...disasterData
    };
    db.disasters.push(newDisaster);
    writeJsonDb(db);
    return newDisaster;
  }
}

export async function updateDisaster(id, disasterData) {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.Disaster.findByIdAndUpdate(id, disasterData, { new: true });
  } else {
    const db = readJsonDb();
    const idx = db.disasters.findIndex(d => d._id === id);
    if (idx === -1) return null;
    db.disasters[idx] = { ...db.disasters[idx], ...disasterData };
    writeJsonDb(db);
    return db.disasters[idx];
  }
}

export async function deleteDisaster(id) {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.Disaster.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    const idx = db.disasters.findIndex(d => d._id === id);
    if (idx === -1) return null;
    const deleted = db.disasters.splice(idx, 1)[0];
    writeJsonDb(db);
    return deleted;
  }
}

// --- MISSION OPERATIONS ---
export async function getMissions(populate = true) {
  if (getDbMode() === 'mongodb') {
    let query = MongooseModels.Mission.find({});
    if (populate) {
      query = query.populate('droneId').populate('disasterId');
    }
    return await query;
  } else {
    const db = readJsonDb();
    if (!populate) return db.missions;

    return db.missions.map(m => {
      const drone = db.drones.find(d => d._id === (m.droneId?._id || m.droneId)) || null;
      const disaster = db.disasters.find(d => d._id === (m.disasterId?._id || m.disasterId)) || null;
      return {
        ...m,
        droneId: drone,
        disasterId: disaster
      };
    });
  }
}

export async function getMissionById(id, populate = true) {
  if (getDbMode() === 'mongodb') {
    let query = MongooseModels.Mission.findById(id);
    if (populate) {
      query = query.populate('droneId').populate('disasterId');
    }
    return await query;
  } else {
    const db = readJsonDb();
    const m = db.missions.find(x => x._id === id);
    if (!m) return null;
    if (!populate) return m;

    const drone = db.drones.find(d => d._id === (m.droneId?._id || m.droneId)) || null;
    const disaster = db.disasters.find(d => d._id === (m.disasterId?._id || m.disasterId)) || null;
    return {
      ...m,
      droneId: drone,
      disasterId: disaster
    };
  }
}

export async function createMission(missionData) {
  if (getDbMode() === 'mongodb') {
    const newMission = new MongooseModels.Mission(missionData);
    return await newMission.save();
  } else {
    const db = readJsonDb();
    const newMission = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      progress: 0,
      victimsFound: 0,
      ...missionData
    };
    db.missions.push(newMission);
    writeJsonDb(db);
    return newMission;
  }
}

export async function updateMission(id, missionData) {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.Mission.findByIdAndUpdate(id, missionData, { new: true }).populate('droneId').populate('disasterId');
  } else {
    const db = readJsonDb();
    const idx = db.missions.findIndex(m => m._id === id);
    if (idx === -1) return null;
    db.missions[idx] = { ...db.missions[idx], ...missionData };
    writeJsonDb(db);
    return await getMissionById(id, true);
  }
}

export async function deleteMission(id) {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.Mission.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    const idx = db.missions.findIndex(m => m._id === id);
    if (idx === -1) return null;
    const deleted = db.missions.splice(idx, 1)[0];
    writeJsonDb(db);
    return deleted;
  }
}

// --- ALERT OPERATIONS ---
export async function getAlerts() {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.Alert.find({}).sort({ timestamp: -1 }).limit(50);
  } else {
    const db = readJsonDb();
    // sort by timestamp descending
    return [...db.alerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

export async function createAlert(alertData) {
  if (getDbMode() === 'mongodb') {
    const newAlert = new MongooseModels.Alert(alertData);
    return await newAlert.save();
  } else {
    const db = readJsonDb();
    const newAlert = {
      _id: generateId(),
      timestamp: new Date().toISOString(),
      ...alertData
    };
    db.alerts.unshift(newAlert); // add to beginning
    if (db.alerts.length > 50) db.alerts.pop(); // limit to 50
    writeJsonDb(db);
    return newAlert;
  }
}

export async function deleteAlert(id) {
  if (getDbMode() === 'mongodb') {
    return await MongooseModels.Alert.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    const idx = db.alerts.findIndex(a => a._id === id);
    if (idx === -1) return null;
    const deleted = db.alerts.splice(idx, 1)[0];
    writeJsonDb(db);
    return deleted;
  }
}

// Reset JSON database to initial mock seeds
export async function resetJsonDb(seedData) {
  if (getDbMode() === 'mongodb') {
    // Clear MongoDB
    await MongooseModels.User.deleteMany({});
    await MongooseModels.Drone.deleteMany({});
    await MongooseModels.Disaster.deleteMany({});
    await MongooseModels.Mission.deleteMany({});
    await MongooseModels.Alert.deleteMany({});

    // Seed
    await MongooseModels.User.insertMany(seedData.users);
    await MongooseModels.Drone.insertMany(seedData.drones);
    await MongooseModels.Disaster.insertMany(seedData.disasters);
    await MongooseModels.Mission.insertMany(seedData.missions);
    await MongooseModels.Alert.insertMany(seedData.alerts);
  } else {
    writeJsonDb(seedData);
  }
}
