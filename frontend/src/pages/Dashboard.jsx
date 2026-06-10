import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import MapView from '../components/MapView';
import LiveAlerts from '../components/LiveAlerts';
import { Radio, ShieldAlert, Heart, ClipboardCheck, ArrowUpRight, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { drones, disasters, missions, analytics, loading } = useSimulation();
  const navigate = useNavigate();

  // Loading skeleton placeholder
  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-96 text-brand-glow">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-glow"></div>
      </div>
    );
  }

  const stats = analytics?.summary || {
    activeMissions: 0,
    completedMissions: 0,
    activeDisasters: 0,
    victimsRescued: 0,
    activeVictimsReported: 0,
    averageBattery: 100,
    droneUtilizationPercentage: 0
  };

  const statCards = [
    {
      title: 'Active UAV Missions',
      value: stats.activeMissions,
      desc: 'Simulated en route / returning',
      icon: Navigation,
      color: 'text-brand-glow bg-brand-glow/10 border-brand-glow/30',
      action: () => navigate('/missions')
    },
    {
      title: 'Active Disaster Zones',
      value: stats.activeDisasters,
      desc: 'Floods, fires, collapses',
      icon: ShieldAlert,
      color: 'text-brand-danger bg-brand-danger/10 border-brand-danger/30',
      action: () => navigate('/map')
    },
    {
      title: 'Victims Rescued',
      value: stats.victimsRescued,
      desc: 'Assisted in completed sorties',
      icon: Heart,
      color: 'text-brand-success bg-brand-success/10 border-brand-success/30',
      action: () => navigate('/reports')
    },
    {
      title: 'UAV Fleet Status',
      value: `${stats.droneUtilizationPercentage}%`,
      desc: 'Active drone utilization rate',
      icon: Radio,
      color: 'text-brand-warning bg-brand-warning/10 border-brand-warning/30',
      action: () => navigate('/drones')
    }
  ];

  const activeMissionsList = missions.filter(m => m.status === 'active');

  return (
    <div className="space-y-6">
      
      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              onClick={card.action}
              className="glass-panel p-5 flex items-center justify-between hover:border-brand-glow/40 hover:shadow-glow cursor-pointer transition-all duration-300 group"
            >
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
                <h3 className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">{card.value}</h3>
                <p className="text-[10px] text-slate-500 font-medium">{card.desc}</p>
              </div>
              <div className={`p-3 border rounded-xl transition-all duration-300 group-hover:scale-110 ${card.color}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Map & Alerts Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map View Widget (2/3 width) */}
        <div className="lg:col-span-2 glass-panel p-4 flex flex-col h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-glow shadow-glow animate-pulse" />
              Live GIS Command Map
            </h3>
            <button 
              onClick={() => navigate('/map')}
              className="text-[10px] font-bold text-brand-glow uppercase tracking-wider flex items-center gap-1 hover:underline"
            >
              Expand Screen <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <MapView interactive={false} />
          </div>
        </div>

        {/* Live Alerts panel (1/3 width) */}
        <div className="h-[480px]">
          <LiveAlerts />
        </div>

      </div>

      {/* 3. Bottom Active Missions Telemetry Feed */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Sortie Dispatch Feed</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Real-time status updates from UAV flight controllers</p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-brand-border/40 px-2 py-0.5 rounded border border-brand-border">
            {activeMissionsList.length} Active SORTIEs
          </span>
        </div>

        {activeMissionsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <ClipboardCheck size={32} className="text-slate-600 mb-2" />
            <p className="text-xs font-semibold">No active missions currently flying.</p>
            <button
              onClick={() => navigate('/missions')}
              className="mt-3 px-3 py-1.5 bg-brand-glow/10 hover:bg-brand-glow text-brand-glow hover:text-brand-dark text-xs font-bold rounded-lg border border-brand-glow/30 hover:border-brand-glow transition-all duration-200"
            >
              Launch Rescue Mission
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMissionsList.map((m) => (
              <div 
                key={m._id}
                className="p-4 bg-brand-dark border border-brand-border hover:border-brand-glow/30 rounded-xl space-y-3 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{m.title}</h4>
                    <p className="text-[9px] text-brand-glow font-bold uppercase mt-0.5">Drone: {m.droneId?.name || 'Unknown'}</p>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider
                    ${m.priority === 'critical' ? 'bg-brand-danger/10 border border-brand-danger/30 text-brand-danger' : 
                      m.priority === 'high' ? 'bg-brand-danger/10 text-brand-danger' : 'bg-brand-warning/10 text-brand-warning'}
                  `}>
                    {m.priority}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-500">SORTIE PROGRESS</span>
                    <span className="font-bold text-slate-300">{m.progress}%</span>
                  </div>
                  <div className="w-full bg-brand-border h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-glow h-full transition-all duration-300 shadow-glow" 
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </div>

                {/* Details line */}
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-brand-border/40">
                  <span className="truncate max-w-[150px]">Target: {m.disasterId?.title || 'Danger Zone'}</span>
                  <span>Battery: {m.droneId?.battery || 100}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
