import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ShieldAlert, AlertTriangle, Info, Clock } from 'lucide-react';

export default function LiveAlerts() {
  const { alerts } = useSimulation();

  const getAlertStyles = (type) => {
    switch (type) {
      case 'evacuation':
        return {
          bg: 'bg-brand-danger/10 border-brand-danger/30 text-brand-danger',
          icon: ShieldAlert,
          glow: 'shadow-[0_0_10px_rgba(255,74,74,0.15)] animate-pulse'
        };
      case 'warning':
        return {
          bg: 'bg-brand-warning/10 border-brand-warning/30 text-brand-warning',
          icon: AlertTriangle,
          glow: 'shadow-[0_0_10px_rgba(255,170,0,0.15)]'
        };
      case 'info':
      default:
        return {
          bg: 'bg-brand-glow/10 border-brand-glow/30 text-brand-glow',
          icon: Info,
          glow: 'shadow-[0_0_10px_rgba(0,216,246,0.15)]'
        };
    }
  };

  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="glass-panel p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-danger animate-ping" />
          Live EOC Incident Log
        </h3>
        <span className="text-[10px] font-mono text-slate-500 bg-brand-dark px-2 py-0.5 rounded border border-brand-border">
          {alerts.length} Records
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
            <Info size={28} className="mb-2 text-slate-600" />
            <p className="text-xs font-medium">No incidents logged</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const styles = getAlertStyles(alert.type);
            const Icon = styles.icon;

            return (
              <div 
                key={alert._id} 
                className={`flex items-start gap-3 p-3 rounded-lg border text-xs leading-relaxed transition-all duration-300 ${styles.bg} ${styles.glow}`}
              >
                <div className="mt-0.5 p-1 bg-white/5 rounded">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200">{alert.message}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-mono">
                    <Clock size={10} />
                    <span>{formatTime(alert.timestamp)}</span>
                    {alert.location && (
                      <span className="opacity-60 truncate">
                        • Coordinates: {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
