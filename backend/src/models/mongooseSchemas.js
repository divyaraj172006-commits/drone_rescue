import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'operator'], default: 'operator' },
  name: { type: String, required: true }
});

// Drone Schema
const DroneSchema = new Schema({
  name: { type: String, required: true },
  model: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['idle', 'en_route', 'returning', 'charging', 'maintenance'], 
    default: 'idle' 
  },
  battery: { type: Number, min: 0, max: 100, default: 100 },
  speed: { type: Number, default: 15 }, // m/s
  payloadCapacity: { type: Number, default: 5 }, // kg
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  homeBase: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
});

// Disaster Schema
const DisasterSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['flood', 'wildfire', 'earthquake', 'hurricane'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  radius: { type: Number, default: 500 }, // obstacle radius in meters
  reportedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  metrics: {
    rainfall: { type: Number, default: 0 },
    windSpeed: { type: Number, default: 0 },
    populationDensity: { type: Number, default: 0 },
    waterLevel: { type: Number, default: 0 }
  }
});

// Mission Schema
const MissionSchema = new Schema({
  title: { type: String, required: true },
  droneId: { type: Schema.Types.ObjectId, ref: 'Drone', required: true },
  disasterId: { type: Schema.Types.ObjectId, ref: 'Disaster', required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' },
  route: [{
    lat: { type: Number },
    lng: { type: Number }
  }],
  progress: { type: Number, min: 0, max: 100, default: 0 },
  victimsFound: { type: Number, default: 0 },
  allocatedResources: {
    ambulances: { type: Number, default: 0 },
    rescueTeams: { type: Number, default: 0 },
    foodKits: { type: Number, default: 0 },
    medicalSupplies: { type: Number, default: 0 },
    shelters: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

// Alert Schema
const AlertSchema = new Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ['warning', 'evacuation', 'info'], default: 'info' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  timestamp: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
export const Drone = mongoose.model('Drone', DroneSchema);
export const Disaster = mongoose.model('Disaster', DisasterSchema);
export const Mission = mongoose.model('Mission', MissionSchema);
export const Alert = mongoose.model('Alert', AlertSchema);
