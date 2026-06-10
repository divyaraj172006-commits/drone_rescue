import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import MapView from '../components/MapView';
import { Search, Eye, Filter, Crosshair, MapPin } from 'lucide-react';

const KARNATAKA_DISTRICTS = [
  { name: 'Show All Region', lat: 12.6000, lng: 77.1000, zoom: 9 },
  { name: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946, zoom: 12 },
  { name: 'Mysuru (Mysore)', lat: 12.2958, lng: 76.6394, zoom: 12 },
  { name: 'Mandya', lat: 12.5220, lng: 76.8970, zoom: 12 },
  { name: 'Dakshina Kannada (Mangaluru)', lat: 12.9141, lng: 74.8560, zoom: 11 },
  { name: 'Udupi', lat: 13.3409, lng: 74.7421, zoom: 11 },
  { name: 'Kodagu (Coorg)', lat: 12.4244, lng: 75.7382, zoom: 11 }
];

export default function DisasterMap() {
  const { disasters, refresh } = useSimulation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  
  const [focusLocation, setFocusLocation] = useState(null);
  const [focusZoom, setFocusZoom] = useState(9);

  // Filter disasters
  const filteredDisasters = disasters.filter((disaster) => {
    const matchesSearch = disaster.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          disaster.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || disaster.severity === severityFilter;
    return matchesSearch && matchesSeverity && disaster.status === 'active';
  });

  const handleFocusDisaster = (disaster) => {
    setFocusLocation([disaster.location.lat, disaster.location.lng]);
    setFocusZoom(14.5); // Zoom close to the disaster
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-brand-danger/10 border border-brand-danger/30 text-brand-danger';
      case 'high': return 'bg-brand-danger/10 text-brand-danger';
      case 'medium': return 'bg-brand-warning/10 text-brand-warning';
      case 'low':
      default:
        return 'bg-brand-success/10 text-brand-success';
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-6">
      
      {/* 1. Sidebar - Search & Disasters List */}
      <div className="w-full lg:w-80 flex flex-col glass-panel p-4 h-full overflow-hidden">
        
        {/* Header */}
        <div className="pb-3 border-b border-brand-border mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Incident Registry</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Focus UAV camera feed by selecting target</p>
        </div>

        {/* District Selector */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <MapPin size={12} className="text-brand-glow animate-pulse" />
            Karnataka District Focus
          </label>
          <select
            onChange={(e) => {
              const dist = KARNATAKA_DISTRICTS.find(d => d.name === e.target.value);
              if (dist) {
                setFocusLocation([dist.lat, dist.lng]);
                setFocusZoom(dist.zoom);
              }
            }}
            className="w-full bg-brand-dark border border-brand-border text-slate-300 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-glow"
          >
            {KARNATAKA_DISTRICTS.map((dist, idx) => (
              <option key={idx} value={dist.name}>{dist.name}</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search disasters..."
            className="w-full pl-9 pr-3 py-2 bg-brand-dark border border-brand-border rounded-lg text-slate-200 text-xs focus:outline-none focus:border-brand-glow"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter size={12} className="text-slate-500" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="flex-1 bg-brand-dark border border-brand-border text-slate-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-brand-glow"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High & Critical</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Disasters List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredDisasters.length === 0 ? (
            <div className="text-center text-slate-500 py-10 text-xs font-medium">
              No active incidents match query.
            </div>
          ) : (
            filteredDisasters.map((disaster) => (
              <div
                key={disaster._id}
                onClick={() => handleFocusDisaster(disaster)}
                className="p-3 bg-brand-dark hover:bg-slate-900 border border-brand-border hover:border-brand-glow/30 rounded-lg cursor-pointer transition-all duration-200 group flex items-start justify-between"
              >
                <div className="space-y-1.5 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="p-0.5 bg-brand-border rounded text-slate-400 group-hover:text-brand-glow transition-colors">
                      <MapPin size={12} />
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-brand-glow transition-colors">{disaster.title}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Lat: {disaster.location.lat.toFixed(4)} Lng: {disaster.location.lng.toFixed(4)}
                  </p>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                    <span>Radius: {disaster.radius}m</span>
                    <span>•</span>
                    <span className="capitalize">{disaster.type}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${getSeverityBadgeClass(disaster.severity)}`}>
                    {disaster.severity}
                  </span>
                  <button
                    className="p-1 hover:bg-brand-border text-slate-500 hover:text-brand-glow rounded transition-colors"
                    title="Center Map"
                  >
                    <Crosshair size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Map Canvas (Full Height Flex) */}
      <div className="flex-1 h-full min-h-[300px] lg:min-h-0 relative">
        <MapView focusLocation={focusLocation} focusZoom={focusZoom} />

        {/* Map Legend Overlay overlay */}
        <div className="absolute bottom-4 left-4 z-[400] glass-panel p-3 text-[10px] space-y-1.5 bg-brand-card/90 max-w-[150px] shadow-lg border-brand-border pointer-events-none">
          <p className="font-bold text-slate-300 border-b border-brand-border pb-1 mb-1">GIS Map Legend</p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-danger animate-pulse"></span>
            <span>Disaster Center</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded bg-brand-success"></span>
            <span>Hospital Base</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded bg-brand-glow"></span>
            <span>EOC Shelter</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded bg-brand-warning"></span>
            <span>Drone (Active)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
