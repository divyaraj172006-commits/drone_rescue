import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Map, 
  Navigation, 
  Radio, 
  Scan, 
  ShieldAlert, 
  BarChart3, 
  FileText, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  Activity
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Disaster Map', path: '/map', icon: Map },
    { name: 'Mission Planning', path: '/missions', icon: Navigation },
    { name: 'Drone Monitoring', path: '/drones', icon: Radio },
    { name: 'Victim Detection', path: '/victims', icon: Scan },
    { name: 'Resource Allocation', path: '/resources', icon: ShieldAlert },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-brand-card border border-brand-border rounded-lg text-slate-100 hover:text-brand-glow"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Panel */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-brand-card/95 border-r border-brand-border flex flex-col justify-between transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:static'}
      `}>
        <div>
          {/* Header/Logo */}
          <div className="p-6 border-b border-brand-border flex items-center gap-3">
            <div className="p-2 bg-brand-glow/10 border border-brand-glow/30 rounded-lg text-brand-glow shadow-glow animate-pulse">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-wider text-slate-100">RESCUEDRONE</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">EOC Command Center</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-200
                    ${isActive 
                      ? 'bg-brand-glow/10 border-l-4 border-brand-glow text-brand-glow shadow-glow' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'}
                  `}
                  end={item.path === '/'}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile footer & logout */}
        <div className="p-4 border-t border-brand-border bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-border flex items-center justify-center font-bold text-brand-glow border border-brand-glow/20">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Operator'}</h4>
              <p className="text-[10px] font-bold text-brand-glow uppercase tracking-wider">{user?.role || 'operator'}</p>
            </div>
          </div>

          {/* Live system state bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-dark border border-brand-border text-[9px] text-brand-success font-mono font-bold tracking-widest uppercase mb-3 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-brand-success" />
            <span>Telemetry Link: Active</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-danger/10 hover:bg-brand-danger border border-brand-danger/30 hover:border-brand-danger rounded-lg text-xs font-medium text-brand-danger hover:text-white transition-all duration-200"
          >
            <LogOut size={14} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
