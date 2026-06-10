import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { missionAPI } from '../services/api';
import { findOptimizedRoute } from '../utils/pathfinding';
import { MapContainer, TileLayer, Marker, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Play, AlertCircle, Info, ShieldAlert, Heart, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MissionPlanning() {
  const { drones, disasters, refresh } = useSimulation();
  const navigate = useNavigate();

  // Inputs
  const [title, setTitle] = useState('');
  const [selectedDisasterId, setSelectedDisasterId] = useState('');
  const [selectedDroneId, setSelectedDroneId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [victimsCount, setVictimsCount] = useState(0);

  // Computed states
  const [routePreview, setRoutePreview] = useState([]);
  const [resourceRecommendations, setResourceRecommendations] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Available Idle Drones
  const idleDrones = drones.filter(d => d.status === 'idle');
  const activeDisasters = disasters.filter(d => d.status === 'active');

  const selectedDisaster = disasters.find(d => d._id === selectedDisasterId);
  const selectedDrone = drones.find(d => d._id === selectedDroneId);

  // Set default title on selection
  useEffect(() => {
    if (selectedDisaster && selectedDrone) {
      setTitle(`Sortie-${selectedDrone.name}: ${selectedDisaster.title}`);
    } else {
      setTitle('');
    }
  }, [selectedDisasterId, selectedDroneId]);

  // Compute Route Preview and Resources dynamically
  useEffect(() => {
    if (selectedDisaster && selectedDrone) {
      // 1. Calculate A* Route client-side for immediate EOC feedback!
      const preview = findOptimizedRoute(
        selectedDrone.currentLocation,
        selectedDisaster.location,
        activeDisasters,
        selectedDisasterId
      );
      setRoutePreview(preview);

      // 2. Fetch Resource Allocations
      const fetchAllocations = async () => {
        try {
          const res = await missionAPI.recommendResources(selectedDisaster.severity, victimsCount);
          setResourceRecommendations(res);
        } catch (err) {
          console.error('Failed to load resource recommendations:', err);
        }
      };
      fetchAllocations();
    } else {
      setRoutePreview([]);
      setResourceRecommendations(null);
    }
  }, [selectedDisasterId, selectedDroneId, victimsCount]);

  const handleLaunchMission = async (e) => {
    e.preventDefault();
    if (!title || !selectedDroneId || !selectedDisasterId) {
      setError('Please fill in all mission parameters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await missionAPI.create({
        title,
        droneId: selectedDroneId,
        disasterId: selectedDisasterId,
        priority,
        victimsCount: parseInt(victimsCount) || 0
      });

      setSuccess('UAV Mission Launched successfully!');
      refresh(); // Sync telemetry immediately
      setTimeout(() => {
        navigate('/drones'); // Redirect to monitoring
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch mission.');
    } finally {
      setLoading(false);
    }
  };

  // Custom marker markers for route preview map
  const createMarkerIcon = (color, text) => {
    return L.divIcon({
      className: '',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-[10px] text-white ${color}">
            ${text}
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. Control Parameters Panel */}
      <div className="glass-panel p-6 space-y-6">
        <div className="pb-4 border-b border-brand-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Mission Parameters</h3>
          <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Configure rescue payload and routing obstacles</p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-xs flex items-center gap-3">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-lg bg-brand-success/10 border border-brand-success/30 text-brand-success text-xs flex items-center gap-3">
            <ShieldAlert size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleLaunchMission} className="space-y-4">
          
          {/* Target Disaster Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Disaster Incident</label>
            <select
              value={selectedDisasterId}
              onChange={(e) => setSelectedDisasterId(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-glow"
            >
              <option value="">-- Select Active Disaster Zone --</option>
              {activeDisasters.map(d => (
                <option key={d._id} value={d._id}>
                  {d.title} ({d.severity.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Drone Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Available UAV</label>
            <select
              value={selectedDroneId}
              onChange={(e) => setSelectedDroneId(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-glow"
            >
              <option value="">-- Select Idle Drone (Battery &gt; 20%) --</option>
              {idleDrones.map(d => (
                <option key={d._id} value={d._id}>
                  {d.name} [{d.model}] (Battery: {d.battery}% | Cap: {d.payloadCapacity}kg)
                </option>
              ))}
            </select>
          </div>

          {/* Double column inputs */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sortie Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-glow"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Estimated Victims */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Victims Detected</label>
              <input
                type="number"
                min="0"
                value={victimsCount}
                onChange={(e) => setVictimsCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-brand-dark border border-brand-border text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-glow"
              />
            </div>
          </div>

          {/* Mission Title */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mission Operation Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sortie-Falcon-1: Biscayne Bay Recon"
              className="w-full bg-brand-dark border border-brand-border text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-glow"
            />
          </div>

          {/* Recommendations Display */}
          {resourceRecommendations && (
            <div className="p-4 bg-brand-dark/50 border border-brand-border rounded-lg space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Heart size={12} className="text-brand-success" />
                Resource Engine Allocation Recommendations
              </h4>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                <div className="p-2 bg-slate-900 border border-brand-border rounded text-center">
                  <span className="block text-slate-500">Ambulances</span>
                  <span className="font-bold text-slate-200 text-xs">{resourceRecommendations.ambulances}</span>
                </div>
                <div className="p-2 bg-slate-900 border border-brand-border rounded text-center">
                  <span className="block text-slate-500">Rescue Teams</span>
                  <span className="font-bold text-slate-200 text-xs">{resourceRecommendations.rescueTeams}</span>
                </div>
                <div className="p-2 bg-slate-900 border border-brand-border rounded text-center">
                  <span className="block text-slate-500">Food Kits</span>
                  <span className="font-bold text-slate-200 text-xs">{resourceRecommendations.foodKits}</span>
                </div>
                <div className="p-2 bg-slate-900 border border-brand-border rounded text-center">
                  <span className="block text-slate-500">Medical Kits</span>
                  <span className="font-bold text-slate-200 text-xs">{resourceRecommendations.medicalSupplies}</span>
                </div>
                <div className="p-2 bg-slate-900 border border-brand-border rounded text-center">
                  <span className="block text-slate-500">Shelters</span>
                  <span className="font-bold text-slate-200 text-xs">{resourceRecommendations.shelters}</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 italic leading-relaxed">{resourceRecommendations.calculationExplanation}</p>
            </div>
          )}

          {/* Launch Button */}
          <button
            type="submit"
            disabled={loading || !selectedDroneId || !selectedDisasterId}
            className="w-full py-3 bg-brand-glow hover:bg-brand-glow/90 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-transparent text-brand-dark font-bold rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-glow disabled:shadow-none"
          >
            <Play size={16} fill="currentColor" />
            {loading ? 'Transmitting Sortie Commands...' : 'Launch Rescue Sortie'}
          </button>

        </form>
      </div>

      {/* 2. Visual Flight Route Preview Map */}
      <div className="glass-panel p-4 flex flex-col h-[520px]">
        <div className="pb-3 border-b border-brand-border mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-warning animate-pulse" />
            AI Optimized Flight Route Preview
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Calculates A* grid path avoiding other active danger zones</p>
        </div>

        <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden border border-brand-border">
          {selectedDisaster && selectedDrone && routePreview.length > 0 ? (
            <MapContainer
              center={[selectedDrone.currentLocation.lat, selectedDrone.currentLocation.lng]}
              zoom={12}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="dark-tile-map"
              />

              {/* Start Location (Drone Home base) */}
              <Marker 
                position={[selectedDrone.currentLocation.lat, selectedDrone.currentLocation.lng]} 
                icon={createMarkerIcon('bg-brand-glow', 'H')} 
              />

              {/* Target Location (Disaster Incident) */}
              <Marker 
                position={[selectedDisaster.location.lat, selectedDisaster.location.lng]} 
                icon={createMarkerIcon('bg-brand-danger', 'D')} 
              />

              {/* Danger Zone Obstacles */}
              {activeDisasters.map(d => (
                <React.Fragment key={d._id}>
                  <Circle
                    center={[d.location.lat, d.location.lng]}
                    radius={d.radius}
                    pathOptions={{
                      color: d._id === selectedDisasterId ? '#00D8F6' : '#FF4A4A',
                      fillColor: d._id === selectedDisasterId ? '#00D8F6' : '#FF4A4A',
                      fillOpacity: 0.1,
                      weight: 1.5,
                      dashArray: '4, 4'
                    }}
                  />
                </React.Fragment>
              ))}

              {/* Polyline Path */}
              <Polyline 
                positions={routePreview.map(node => [node.lat, node.lng])} 
                pathOptions={{
                  color: '#FFAA00',
                  weight: 3.5,
                  opacity: 0.9,
                  dashArray: '6, 6'
                }}
              />
            </MapContainer>
          ) : (
            <div className="w-full h-full bg-slate-900/50 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              <Navigation size={42} className="text-slate-700 mb-3 animate-bounce" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telemetry Link Pending</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[250px]">Select a target disaster and an available drone to run AI pathfinding optimization.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
