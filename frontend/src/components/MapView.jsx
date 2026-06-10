import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSimulation } from '../context/SimulationContext';
import { Activity, ShieldCheck, Heart, Radio, Navigation } from 'lucide-react';

// Reset Leaflet Default Icons to prevent bundle load errors
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom component to handle dynamic zooming/pan center controls
function MapController({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ focusLocation, focusZoom, interactive = true }) {
  const { drones, disasters, missions } = useSimulation();

  const karnatakaCenter = [12.6000, 77.1000];

  // Helper: Create custom Tailwind styled markers using L.divIcon
  const createDroneIcon = (drone) => {
    let colorClass = 'bg-brand-glow border-brand-glow text-black';
    let pulseClass = 'animate-pulse';
    
    if (drone.status === 'en_route') {
      colorClass = 'bg-brand-warning border-brand-warning text-black';
    } else if (drone.status === 'returning') {
      colorClass = 'bg-brand-success border-brand-success text-black';
    } else if (drone.status === 'maintenance') {
      colorClass = 'bg-slate-600 border-slate-600 text-slate-300';
      pulseClass = '';
    }

    return L.divIcon({
      className: '',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full ${colorClass} opacity-20 ${pulseClass}"></div>
          <div class="w-7 h-7 rounded-lg border-2 flex items-center justify-center ${colorClass} shadow-glow text-[10px] font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          </div>
          <div class="absolute -top-7 px-1.5 py-0.5 rounded bg-brand-card/90 border border-brand-border text-[9px] font-bold text-slate-200 shadow truncate max-w-[80px]">${drone.name}</div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  const createDisasterIcon = (disaster) => {
    let colorClass = 'bg-brand-warning text-brand-dark border-brand-warning';
    
    if (disaster.severity === 'critical') {
      colorClass = 'bg-brand-danger text-white border-brand-danger';
    } else if (disaster.severity === 'high') {
      colorClass = 'bg-brand-danger/80 text-white border-brand-danger/90';
    }

    return L.divIcon({
      className: '',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 rounded-full ${colorClass} opacity-35 animate-ping"></div>
          <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center ${colorClass} shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6v7z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="absolute -top-7 px-1.5 py-0.5 rounded bg-brand-card/90 border border-brand-border text-[9px] font-bold text-slate-200 shadow truncate max-w-[90px]">${disaster.title}</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  // Safe zones list
  const safeZones = [
    { name: "Victoria Hospital (Bengaluru)", lat: 12.9625, lng: 77.5732, type: 'hospital' },
    { name: "K.R. Hospital (Mysuru)", lat: 12.3138, lng: 76.6490, type: 'hospital' },
    { name: "Mandya EOC Shelter", lat: 12.5220, lng: 76.8970, type: 'shelter' }
  ];

  const createSafeZoneIcon = (zone) => {
    const isHospital = zone.type === 'hospital';
    const colorClass = isHospital ? 'bg-brand-success text-brand-dark border-brand-success' : 'bg-brand-glow text-brand-dark border-brand-glow';
    
    return L.divIcon({
      className: '',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-md border flex items-center justify-center ${colorClass} shadow-lg">
            ${isHospital 
              ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' 
              : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'}
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#FF4A4A';
      case 'high': return '#FF7373';
      case 'medium': return '#FFAA00';
      case 'low':
      default:
        return '#00E676';
    }
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-brand-border bg-brand-dark shadow-glow">
      <MapContainer 
        center={karnatakaCenter} 
        zoom={9} 
        zoomControl={interactive}
        scrollWheelZoom={interactive}
        dragging={interactive}
        className="w-full h-full"
      >
        <MapController center={focusLocation} zoom={focusZoom} />

        {/* Premium Dark Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-tile-map"
        />

        {/* 1. Render Disaster Danger Zones (Circles + Markers) */}
        {disasters.map((disaster) => (
          <React.Fragment key={disaster._id}>
            <Circle
              center={[disaster.location.lat, disaster.location.lng]}
              radius={disaster.radius}
              pathOptions={{
                color: getSeverityColor(disaster.severity),
                fillColor: getSeverityColor(disaster.severity),
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '4, 4'
              }}
            />
            <Marker 
              position={[disaster.location.lat, disaster.location.lng]}
              icon={createDisasterIcon(disaster)}
            >
              <Popup className="custom-popup">
                <div className="p-1 text-brand-dark font-sans">
                  <h4 className="font-bold text-sm text-slate-800">{disaster.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 capitalize">Severity: <span className="font-bold">{disaster.severity}</span></p>
                  <p className="text-xs text-slate-600">Type: <span className="font-bold">{disaster.type}</span></p>
                  <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                    Wind: {disaster.metrics.windSpeed}km/h | Water: {disaster.metrics.waterLevel}m
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* 2. Render Safe Zones (Hospitals / Shelters) */}
        {safeZones.map((zone, idx) => (
          <Marker
            key={`sz-${idx}`}
            position={[zone.lat, zone.lng]}
            icon={createSafeZoneIcon(zone)}
          >
            <Popup>
              <div className="p-1 text-brand-dark">
                <h4 className="font-bold text-sm text-slate-800">{zone.name}</h4>
                <p className="text-xs text-slate-600 mt-0.5 capitalize">Safe Zone: {zone.type}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 3. Render Drones (Animated Markers) */}
        {drones.map((drone) => (
          <Marker
            key={drone._id}
            position={[drone.currentLocation.lat, drone.currentLocation.lng]}
            icon={createDroneIcon(drone)}
          >
            <Popup>
              <div className="p-1 text-brand-dark font-sans">
                <h4 className="font-bold text-sm text-slate-800">{drone.name}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{drone.model}</p>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex justify-between gap-4">
                    <span>Status:</span>
                    <span className="font-bold uppercase text-brand-glow">{drone.status}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Battery:</span>
                    <span className="font-bold">{drone.battery}%</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Speed:</span>
                    <span>{drone.speed} m/s</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 4. Render Active Mission Routes */}
        {missions
          .filter(m => m.status === 'active' && m.route && m.route.length > 0)
          .map((mission) => (
            <Polyline
              key={`route-${mission._id}`}
              positions={mission.route.map(node => [node.lat, node.lng])}
              pathOptions={{
                color: '#00D8F6',
                weight: 3,
                opacity: 0.75,
                lineJoin: 'round',
                dashArray: '8, 8',
                dashOffset: '10'
              }}
            />
          ))}
      </MapContainer>
    </div>
  );
}
