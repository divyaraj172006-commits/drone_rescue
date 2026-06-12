import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSimulation } from '../context/SimulationContext';
import { Settings as SettingsIcon, Sun, Moon, Gauge, RefreshCw, ShieldAlert, CheckCircle } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Settings() {
  const { isAdmin } = useAuth();
  const { refresh } = useSimulation();

  // Dark/Light Mode state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Simulation Speed state
  const [simSpeed, setSimSpeed] = useState(1.5);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Fetch current simulation speed on mount
  useEffect(() => {
    const fetchSpeed = async () => {
      try {
        const res = await adminAPI.getSimulationSpeed();
        setSimSpeed(res.speed);
      } catch (err) {
        console.error('Failed to get simulation speed settings:', err);
      }
    };
    fetchSpeed();
  }, []);

  // Update theme class on document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSpeedChange = async (speedVal) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const val = parseFloat(speedVal);
      await adminAPI.setSimulationSpeed(val);
      setSimSpeed(val);
      setSuccess(`Telemetry tick rate updated to ${val}x successfully.`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update telemetry rate.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDb = async () => {
    setIsResetConfirmOpen(false);
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await adminAPI.resetDb();
      setSuccess('Emergency operations database restored to seed telemetry values.');
      refresh(); // Sync frontend contexts
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Database reset failed. Check write permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* Header */}
      <div className="pb-3 border-b border-brand-border">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Control Panel Settings</h3>
        <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Calibrate simulation feeds and display aesthetics</p>
      </div>

      {success && (
        <div className="p-4 rounded-lg bg-brand-success/10 border border-brand-success/30 text-brand-success text-xs flex items-center gap-3 animate-pulse">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-xs flex items-center gap-3">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Theme & Display Configuration */}
        <div className="glass-panel p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
            {theme === 'dark' ? <Moon size={14} className="text-brand-glow" /> : <Sun size={14} className="text-brand-warning" />}
            EOC Command Visuals
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">Adjust layout brightness for EOC display monitors</p>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 py-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2
                ${theme === 'dark' 
                  ? 'bg-brand-glow/10 border-brand-glow text-brand-glow shadow-glow' 
                  : 'bg-brand-dark border-brand-border text-slate-400 hover:border-slate-700'}`}
            >
              <Moon size={14} />
              <span>Tactical Dark</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 py-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2
                ${theme === 'light' 
                  ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-glow' 
                  : 'bg-brand-dark border-brand-border text-slate-400 hover:border-slate-700'}`}
            >
              <Sun size={14} />
              <span>Standard Light</span>
            </button>
          </div>
        </div>

        {/* Simulation Speed Control */}
        <div className="glass-panel p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
            <Gauge size={14} className="text-brand-warning" />
            Simulation Telemetry Clock
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">Calibrate coordinate interpolation speed for active UAV sorties</p>

          <div className="grid grid-cols-3 gap-2 pt-2">
            {[1.0, 2.5, 5.0].map((speedVal) => (
              <button
                key={speedVal}
                onClick={() => handleSpeedChange(speedVal)}
                className={`py-2 rounded border text-xs font-mono font-bold transition-all
                  ${simSpeed === speedVal 
                    ? 'bg-brand-warning/10 border-brand-warning text-brand-warning' 
                    : 'bg-brand-dark border-brand-border text-slate-400 hover:border-slate-700'}`}
              >
                {speedVal.toFixed(1)}x
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Database Maintenance Operations */}
      <div className="glass-panel p-5 space-y-4 border-brand-danger/20">
        <h4 className="text-xs font-bold uppercase tracking-widest text-brand-danger flex items-center gap-2">
          <ShieldAlert size={14} />
          EOC Hard Reset Maintenance
        </h4>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Restore system variables and clean active sorties. Restores all seed telemetry configurations.
          <strong className="text-brand-danger block mt-1">This operation requires EOC Director (Admin) clearance.</strong>
        </p>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          disabled={loading || !isAdmin}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-danger hover:bg-brand-danger/90 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-transparent text-white font-bold text-xs rounded-lg transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Wipe System & Seed Telemetry</span>
        </button>
      </div>

      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        title="Wipe & Reset Database"
        message="WARNING: This will wipe all current flight sorties and active disaster changes, and restore the EOC to its default bootstrap state. Proceed?"
        confirmText="Reset Database"
        cancelText="Cancel"
        onConfirm={handleResetDb}
        onCancel={() => setIsResetConfirmOpen(false)}
        isDanger={true}
      />

    </div>
  );
}
