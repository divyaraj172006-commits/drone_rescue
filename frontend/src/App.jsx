import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SimulationProvider } from './context/SimulationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DisasterMap from './pages/DisasterMap';
import MissionPlanning from './pages/MissionPlanning';
import DroneMonitoring from './pages/DroneMonitoring';
import VictimDetection from './pages/VictimDetection';
import ResourceAllocation from './pages/ResourceAllocation';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Private Route Guard Component
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center text-brand-glow">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-glow"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Secure EOC Command Center Routes */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <SimulationProvider>
                  <Layout />
                </SimulationProvider>
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="map" element={<DisasterMap />} />
            <Route path="missions" element={<MissionPlanning />} />
            <Route path="drones" element={<DroneMonitoring />} />
            <Route path="victims" element={<VictimDetection />} />
            <Route path="resources" element={<ResourceAllocation />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
