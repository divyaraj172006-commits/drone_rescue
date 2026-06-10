import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { droneAPI, disasterAPI, missionAPI, alertAPI, analyticsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const { user } = useAuth();
  const [drones, setDrones] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [missions, setMissions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [dronesData, disastersData, missionsData, alertsData, analyticsData] = await Promise.all([
        droneAPI.getAll(),
        disasterAPI.getAll(),
        missionAPI.getAll(),
        alertAPI.getAll(),
        analyticsAPI.getSummary(),
      ]);

      setDrones(dronesData);
      setDisasters(disastersData);
      setMissions(missionsData);
      setAlerts(alertsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to sync simulation states:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      // Start polling every 3 seconds to match backend simulation tick
      intervalRef.current = setInterval(fetchData, 3000);
    } else {
      // Clear data on logout
      setDrones([]);
      setDisasters([]);
      setMissions([]);
      setAlerts([]);
      setAnalytics(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  const triggerManualRefresh = () => {
    fetchData();
  };

  const value = {
    drones,
    disasters,
    missions,
    alerts,
    analytics,
    loading,
    refresh: triggerManualRefresh
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
