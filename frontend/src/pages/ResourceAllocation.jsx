import React, { useState, useEffect } from 'react';
import { missionAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Info, Heart, Truck, Users, Soup, Stethoscope, Home } from 'lucide-react';

export default function ResourceAllocation() {
  const [severity, setSeverity] = useState('medium');
  const [victimCount, setVictimCount] = useState(10);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await missionAPI.recommendResources(severity, victimCount);
      setRecommendations(res);
    } catch (err) {
      console.error('Failed to load resource recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [severity, victimCount]);

  // Format data for Recharts comparison
  const chartData = recommendations ? [
    { name: 'Ambulances', Quantity: recommendations.ambulances },
    { name: 'Rescue Teams', Quantity: recommendations.rescueTeams },
    { name: 'Food Kits (x10)', Quantity: Math.round(recommendations.foodKits / 10) },
    { name: 'Medical Kits (x10)', Quantity: Math.round(recommendations.medicalSupplies / 10) },
    { name: 'Shelters', Quantity: recommendations.shelters }
  ] : [];

  const resourceCards = recommendations ? [
    { name: 'Emergency Ambulances', value: recommendations.ambulances, icon: Truck, color: 'text-brand-danger bg-brand-danger/10 border-brand-danger/20' },
    { name: 'Rapid Response Teams', value: recommendations.rescueTeams, icon: Users, color: 'text-brand-warning bg-brand-warning/10 border-brand-warning/20' },
    { name: 'Food Rations & Kits', value: recommendations.foodKits, icon: Soup, color: 'text-brand-success bg-brand-success/10 border-brand-success/20' },
    { name: 'Medical Kits & Supplies', value: recommendations.medicalSupplies, icon: Stethoscope, color: 'text-brand-glow bg-brand-glow/10 border-brand-glow/20' },
    { name: 'Emergency Shelters', value: recommendations.shelters, icon: Home, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' }
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Left - Parameters Form (1/3) */}
      <div className="glass-panel p-5 space-y-6">
        <div className="pb-3 border-b border-brand-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Incident Calculator</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Determine logisitcs payloads based on incident sizes</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Disaster Severity Rating</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-glow"
            >
              <option value="low">Low Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="high">High Severity</option>
              <option value="critical">Critical Severity</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Survivor Count Estimation</label>
            <input
              type="number"
              min="0"
              value={victimCount}
              onChange={(e) => setVictimCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-brand-dark border border-brand-border text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-glow"
            />
          </div>
        </div>

        <div className="p-4 bg-brand-dark/50 border border-brand-border rounded-lg text-xs leading-relaxed text-slate-400 space-y-2">
          <h5 className="font-bold text-slate-300 flex items-center gap-1.5">
            <Info size={14} className="text-brand-glow" />
            Allocation Policy Logic
          </h5>
          <p className="text-[10px]">
            Resources are recommended dynamically using a standard EOC multiplier index. 
            Base resource packages are determined by disaster severity, and then scaled proportionally by estimated victim count to meet surge needs.
          </p>
        </div>
      </div>

      {/* 2. Middle & Right - Outputs & Recharts (2/3) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Results Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {resourceCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx}
                className="glass-panel p-4 flex flex-col justify-between items-center text-center space-y-2 border-brand-border/60 hover:border-brand-glow/20 transition-all duration-300"
              >
                <div className={`p-2.5 border rounded-lg ${card.color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-widest leading-tight">{card.name}</span>
                  <span className="text-xl font-bold font-mono text-slate-200 mt-1 block">{card.value}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recharts Allocation Breakdown */}
        <div className="glass-panel p-5 h-80 flex flex-col justify-between">
          <div className="pb-3 border-b border-brand-border mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Resource Deployment Analysis</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Quantity requirements (Food & Medical Kits normalized by factor of 10)</p>
          </div>

          <div className="flex-1 min-h-0">
            {recommendations && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2E4D" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151D30', borderColor: '#1F2E4D', borderRadius: '8px' }}
                    labelStyle={{ color: '#94A3B8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#00D8F6', fontSize: '11px' }}
                  />
                  <Bar dataKey="Quantity" fill="#00D8F6" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
