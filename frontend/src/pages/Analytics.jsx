import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsAPI.getSummary();
      setData(res);
    } catch (err) {
      console.error('Failed to load EOC analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Poll analytics every 5s
    const timer = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96 text-brand-glow">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-glow"></div>
      </div>
    );
  }

  // Colors for charts
  const PIE_COLORS = ['#00D8F6', '#FF4A4A', '#FFAA00', '#00E676'];

  // Format disaster distribution data for Recharts Pie
  const disasterPieData = data ? [
    { name: 'Floods', value: data.disasterTypeDistribution.flood },
    { name: 'Wildfires', value: data.disasterTypeDistribution.wildfire },
    { name: 'Earthquakes', value: data.disasterTypeDistribution.earthquake },
    { name: 'Hurricanes', value: data.disasterTypeDistribution.hurricane }
  ].filter(item => item.value > 0) : [];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="pb-3 border-b border-brand-border">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Performance Analytics</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Statistical outputs measuring rescue mission efficiency</p>
      </div>

      {/* 1. First Row - 2 Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Missions launched vs completed */}
        <div className="glass-panel p-5 h-[340px] flex flex-col justify-between">
          <div className="pb-3 border-b border-brand-border mb-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp size={14} className="text-brand-glow" />
              Rescue Sorites Over Time
            </h4>
          </div>
          <div className="flex-1 min-h-0">
            {data && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLaunch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D8F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00D8F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorComplete" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E676" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00E676" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2E4D" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151D30', borderColor: '#1F2E4D', borderRadius: '8px' }}
                    labelStyle={{ color: '#94A3B8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="launched" stroke="#00D8F6" fillOpacity={1} fill="url(#colorLaunch)" strokeWidth={2} name="Launched" />
                  <Area type="monotone" dataKey="completed" stroke="#00E676" fillOpacity={1} fill="url(#colorComplete)" strokeWidth={2} name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Drone Battery Distribution */}
        <div className="glass-panel p-5 h-[340px] flex flex-col justify-between">
          <div className="pb-3 border-b border-brand-border mb-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Cpu size={14} className="text-brand-warning" />
              Fleet Battery Reserves
            </h4>
          </div>
          <div className="flex-1 min-h-0">
            {data && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.batteryData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2E4D" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={9} tickLine={false} domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151D30', borderColor: '#1F2E4D', borderRadius: '8px' }}
                    labelStyle={{ color: '#94A3B8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#FFAA00', fontSize: '11px' }}
                  />
                  <Bar dataKey="battery" fill="#FFAA00" radius={[0, 4, 4, 0]} barSize={16}>
                    {data.batteryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.battery <= 20 ? '#FF4A4A' : '#FFAA00'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 2. Second Row - Pie chart & Stats Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Disaster Type Pie distribution */}
        <div className="glass-panel p-5 h-[320px] flex flex-col justify-between">
          <div className="pb-3 border-b border-brand-border mb-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-brand-danger" />
              Disaster Risk Profile
            </h4>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {disasterPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={disasterPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {disasterPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151D30', borderColor: '#1F2E4D', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={8} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500 font-medium">No active disasters reported.</p>
            )}
          </div>
        </div>

        {/* Stats Summary list (2/3 width) */}
        <div className="lg:col-span-2 glass-panel p-5 h-[320px] flex flex-col justify-between">
          <div className="pb-3 border-b border-brand-border mb-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart3 size={14} className="text-brand-glow" />
              Telemetry Analytics Ledger
            </h4>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-brand-dark border border-brand-border rounded-lg flex flex-col justify-between">
              <span className="text-slate-500">SORTIE COMPLETIONS</span>
              <span className="text-2xl font-bold text-brand-success mt-1">{data?.summary?.completedMissions} Sorties</span>
            </div>
            <div className="p-4 bg-brand-dark border border-brand-border rounded-lg flex flex-col justify-between">
              <span className="text-slate-500">SURVIVORS ASSISTED</span>
              <span className="text-2xl font-bold text-slate-100 mt-1">{data?.summary?.victimsRescued} Stranded</span>
            </div>
            <div className="p-4 bg-brand-dark border border-brand-border rounded-lg flex flex-col justify-between">
              <span className="text-slate-500">UAV MISSION SUCCESS RATE</span>
              <span className="text-2xl font-bold text-brand-glow mt-1">98.4%</span>
            </div>
            <div className="p-4 bg-brand-dark border border-brand-border rounded-lg flex flex-col justify-between">
              <span className="text-slate-500">MEAN RESPONSE TIME</span>
              <span className="text-2xl font-bold text-brand-warning mt-1">14.8 mins</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
