import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, KeyRound, User as UserIcon, Activity } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userRole) => {
    setUsername(userRole);
    setPassword(userRole === 'admin' ? 'admin123' : 'operator123');
    setError('');
    setLoading(true);

    try {
      await login(userRole, userRole === 'admin' ? 'admin123' : 'operator123');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 grid-bg">

      {/* Decorative Neon Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-brand-glow/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 relative overflow-hidden shadow-glow-lg border-brand-glow/20">

        {/* Glowing border line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-glow to-transparent"></div>

        {/* EOC Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-brand-glow/10 border border-brand-glow/30 rounded-xl text-brand-glow mb-3 shadow-glow animate-pulse">
            <Activity size={32} />
          </div>
          <h2 className="text-2xl font-bold tracking-wider text-slate-100">RescueDrone EOC</h2>
          <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase mt-1">UAV Mission Command Center</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-xs flex items-center gap-3">
            <ShieldAlert size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <UserIcon size={16} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter operator username"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-brand-dark border border-brand-border text-slate-200 text-sm focus:outline-none focus:border-brand-glow focus:ring-1 focus:ring-brand-glow/30 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Secret Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <KeyRound size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-brand-dark border border-brand-border text-slate-200 text-sm focus:outline-none focus:border-brand-glow focus:ring-1 focus:ring-brand-glow/30 transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-glow text-brand-dark font-bold rounded-lg text-sm hover:bg-brand-glow/90 shadow-glow hover:shadow-glow-lg active:scale-[0.99] transition-all duration-200 flex items-center justify-center"
          >
            {loading ? 'Authenticating System...' : 'Access EOC Dashboard'}
          </button>
        </form>

        {/* Quick Access panel for convenience */}
        <div className="mt-8 pt-6 border-t border-brand-border text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Credentials Access</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="py-2 bg-slate-900 border border-brand-border hover:border-brand-glow text-slate-300 hover:text-brand-glow text-[11px] rounded-lg transition-all duration-200"
            >
              System Admin
            </button>
            <button
              onClick={() => handleQuickLogin('operator')}
              disabled={loading}
              className="py-2 bg-slate-900 border border-brand-border hover:border-brand-glow text-slate-300 hover:text-brand-glow text-[11px] rounded-lg transition-all duration-200"
            >
              UAV Operator
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
