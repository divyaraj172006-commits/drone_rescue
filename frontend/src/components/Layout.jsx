import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSimulation } from '../context/SimulationContext';
import { RefreshCw, Clock, Activity } from 'lucide-react';

export default function Layout() {
  const { refresh, loading } = useSimulation();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Telemetry Overview';
    if (path === '/map') return 'Disaster Map Control';
    if (path === '/missions') return 'UAV Mission Planner';
    if (path === '/drones') return 'Drone Operations';
    if (path === '/victims') return 'AI Victim Detector';
    if (path === '/resources') return 'Resource Allocation Engine';
    if (path === '/analytics') return 'Performance Analytics';
    if (path === '/reports') return 'System Logs & Reports';
    if (path === '/settings') return 'Control Panel Settings';
    return 'EOC Operations';
  };

  return (
    <div className="min-h-screen flex bg-brand-dark grid-bg">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-0 pl-0">
        
        {/* Top Control Bar */}
        <header className="h-16 bg-brand-card/75 border-b border-brand-border px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-brand-glow rounded-full shadow-glow"></span>
            <h2 className="font-bold text-sm tracking-wider uppercase text-slate-200">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            
            {/* Clock telemetry */}
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-400">
              <Clock size={14} className="text-brand-glow" />
              <span>{time.toLocaleDateString()}</span>
              <span>{time.toLocaleTimeString()}</span>
            </div>

            {/* Refresh button */}
            <button
              onClick={refresh}
              disabled={loading}
              className={`p-2 bg-brand-border/40 hover:bg-brand-border rounded-lg text-slate-400 hover:text-brand-glow transition-all duration-200 ${loading ? 'animate-spin text-brand-glow' : ''}`}
              title="Manual Telemetry Sync"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        {/* Dynamic Page Outlets */}
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
