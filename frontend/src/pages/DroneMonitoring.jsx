import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useAuth } from '../context/AuthContext';
import { droneAPI } from '../services/api';
import { Radio, Battery, Gauge, Hammer, Trash2, Plus, AlertTriangle, Eye } from 'lucide-react';

export default function DroneMonitoring() {
  const { drones, refresh } = useSimulation();
  const { isAdmin } = useAuth();

  // Create drone states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [model, setModel] = useState('Quadcopter VTOL');
  const [speed, setSpeed] = useState(15);
  const [payloadCapacity, setPayloadCapacity] = useState(5);
  const [lat, setLat] = useState(25.7617);
  const [lng, setLng] = useState(-80.1918);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddDrone = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await droneAPI.create({
        name,
        model,
        speed: parseFloat(speed),
        payloadCapacity: parseFloat(payloadCapacity),
        currentLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
        homeBase: { lat: parseFloat(lat), lng: parseFloat(lng) }
      });

      setSuccess('New UAV commissioned successfully!');
      setName('');
      setShowAddForm(false);
      refresh();
    } catch (err) {
      setError('Failed to create drone. Verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrone = async (id) => {
    if (!window.confirm('Are you sure you want to decommission this UAV?')) return;
    try {
      await droneAPI.delete(id);
      refresh();
    } catch (err) {
      alert('Failed to decommission drone.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'en_route':
        return 'bg-brand-warning/10 border border-brand-warning/30 text-brand-warning';
      case 'returning':
        return 'bg-brand-success/10 border border-brand-success/30 text-brand-success';
      case 'charging':
        return 'bg-brand-glow/10 border border-brand-glow/30 text-brand-glow animate-pulse';
      case 'maintenance':
        return 'bg-slate-700/50 border border-slate-600 text-slate-400';
      case 'idle':
      default:
        return 'bg-brand-border/40 border border-brand-border text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Commission Button */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-sans">Active Sortie UAV Fleet</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Real-time status monitoring and hardware control</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-glow hover:bg-brand-glow/90 text-brand-dark font-bold text-xs rounded-lg shadow-glow transition-all"
          >
            <Plus size={14} />
            <span>Commission UAV</span>
          </button>
        )}
      </div>

      {/* 2. Add Drone Modal / Drawer */}
      {showAddForm && (
        <div className="glass-panel p-5 border-brand-glow/30 max-w-xl">
          <h4 className="text-xs font-bold uppercase tracking-widest text-brand-glow mb-4">UAV Commission Parameters</h4>
          {error && <p className="text-xs text-brand-danger mb-3">{error}</p>}
          <form onSubmit={handleAddDrone} className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">UAV Callsign (Name)</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Falcon-X" 
                required 
                className="w-full p-2 bg-brand-dark border border-brand-border rounded text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Model / Airframe</label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 bg-brand-dark border border-brand-border rounded text-slate-200 focus:outline-none"
              >
                <option value="Quadcopter VTOL">Quadcopter VTOL</option>
                <option value="Heavy-Lift Hexacopter">Heavy-Lift Hexacopter</option>
                <option value="Fixed-Wing UAV">Fixed-Wing UAV</option>
                <option value="Waterproof Amphibious">Waterproof Amphibious</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Speed (m/s)</label>
              <input 
                type="number" 
                value={speed} 
                onChange={(e) => setSpeed(e.target.value)}
                required 
                className="w-full p-2 bg-brand-dark border border-brand-border rounded text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Payload Capacity (kg)</label>
              <input 
                type="number" 
                value={payloadCapacity} 
                onChange={(e) => setPayloadCapacity(e.target.value)}
                required 
                className="w-full p-2 bg-brand-dark border border-brand-border rounded text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Home Latitude</label>
              <input 
                type="number" 
                step="0.0001" 
                value={lat} 
                onChange={(e) => setLat(e.target.value)}
                required 
                className="w-full p-2 bg-brand-dark border border-brand-border rounded text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Home Longitude</label>
              <input 
                type="number" 
                step="0.0001" 
                value={lng} 
                onChange={(e) => setLng(e.target.value)}
                required 
                className="w-full p-2 bg-brand-dark border border-brand-border rounded text-slate-200 focus:outline-none"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 border border-brand-border text-slate-400 rounded hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-4 py-1.5 bg-brand-glow text-brand-dark font-bold rounded"
              >
                {loading ? 'Adding...' : 'Commission'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Drones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drones.map((drone) => {
          const isBatteryLow = drone.battery <= 20;

          return (
            <div 
              key={drone._id}
              className="glass-panel p-5 flex flex-col justify-between hover:border-brand-glow/20 transition-all duration-300 relative overflow-hidden"
            >
              {/* Top Row - Callsign & Badge */}
              <div className="flex items-start justify-between pb-3 border-b border-brand-border">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5 font-mono">
                    <Radio size={14} className="text-brand-glow animate-pulse" />
                    {drone.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{drone.model}</p>
                </div>
                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadge(drone.status)}`}>
                  {drone.status}
                </span>
              </div>

              {/* Middle Row - Telemetry values */}
              <div className="py-4 space-y-3 flex-1">
                {/* Battery Meter */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">BATTERY RESERVE</span>
                  <span className={`font-bold flex items-center gap-1 ${isBatteryLow ? 'text-brand-danger animate-pulse' : 'text-slate-200'}`}>
                    <Battery size={14} />
                    {drone.battery}%
                  </span>
                </div>
                <div className="w-full bg-brand-border h-2 rounded overflow-hidden">
                  <div 
                    className={`h-full rounded transition-all duration-300 ${isBatteryLow ? 'bg-brand-danger danger-pulse' : drone.battery < 50 ? 'bg-brand-warning' : 'bg-brand-success'}`}
                    style={{ width: `${drone.battery}%` }}
                  />
                </div>

                {/* Specs list */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] font-mono">
                  <div className="p-2 bg-brand-dark border border-brand-border rounded flex flex-col">
                    <span className="text-slate-500 uppercase tracking-widest text-[8px]">Flight Speed</span>
                    <span className="text-slate-200 font-bold text-xs mt-0.5 flex items-center gap-1">
                      <Gauge size={10} className="text-brand-glow" />
                      {drone.speed} m/s
                    </span>
                  </div>
                  <div className="p-2 bg-brand-dark border border-brand-border rounded flex flex-col">
                    <span className="text-slate-500 uppercase tracking-widest text-[8px]">Payload Cap</span>
                    <span className="text-slate-200 font-bold text-xs mt-0.5 flex items-center gap-1">
                      <Hammer size={10} className="text-brand-glow" />
                      {drone.payloadCapacity} kg
                    </span>
                  </div>
                </div>

                {/* Coordinates Telemetry */}
                <div className="p-2 bg-brand-dark/50 border border-brand-border rounded text-[9px] font-mono text-slate-400 space-y-0.5">
                  <p>Telemetry Coordinates:</p>
                  <p className="text-slate-300 font-bold">Lat: {drone.currentLocation.lat.toFixed(6)} | Lng: {drone.currentLocation.lng.toFixed(6)}</p>
                </div>
              </div>

              {/* Bottom Row - Admin Options */}
              {isAdmin && (
                <div className="pt-3 border-t border-brand-border flex justify-end">
                  <button
                    onClick={() => handleDeleteDrone(drone._id)}
                    className="p-1.5 hover:bg-brand-danger/10 text-slate-500 hover:text-brand-danger border border-transparent hover:border-brand-danger/30 rounded transition-all duration-200"
                    title="Decommission UAV"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
