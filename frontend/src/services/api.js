import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authorization errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear local storage and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const droneAPI = {
  getAll: async () => {
    const res = await api.get('/drones');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/drones/${id}`);
    return res.data;
  },
  create: async (droneData) => {
    const res = await api.post('/drones', droneData);
    return res.data;
  },
  update: async (id, droneData) => {
    const res = await api.put(`/drones/${id}`, droneData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/drones/${id}`);
    return res.data;
  }
};

export const disasterAPI = {
  getAll: async () => {
    const res = await api.get('/disasters');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/disasters/${id}`);
    return res.data;
  },
  predictSeverity: async (metrics) => {
    const res = await api.post('/disasters/predict', metrics);
    return res.data;
  },
  create: async (disasterData) => {
    const res = await api.post('/disasters', disasterData);
    return res.data;
  },
  update: async (id, disasterData) => {
    const res = await api.put(`/disasters/${id}`, disasterData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/disasters/${id}`);
    return res.data;
  }
};

export const missionAPI = {
  getAll: async () => {
    const res = await api.get('/missions');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/missions/${id}`);
    return res.data;
  },
  recommendResources: async (severity, victimCount) => {
    const res = await api.post('/missions/recommend-resources', { severity, victimCount });
    return res.data;
  },
  create: async (missionData) => {
    const res = await api.post('/missions', missionData);
    return res.data;
  },
  update: async (id, missionData) => {
    const res = await api.put(`/missions/${id}`, missionData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/missions/${id}`);
    return res.data;
  }
};

export const alertAPI = {
  getAll: async () => {
    const res = await api.get('/alerts');
    return res.data;
  },
  create: async (alertData) => {
    const res = await api.post('/alerts', alertData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/alerts/${id}`);
    return res.data;
  }
};

export const analyticsAPI = {
  getSummary: async () => {
    const res = await api.get('/analytics');
    return res.data;
  }
};

export const adminAPI = {
  resetDb: async () => {
    const res = await api.post('/admin/reset-db');
    return res.data;
  },
  getSimulationSpeed: async () => {
    const res = await api.get('/admin/simulation-speed');
    return res.data;
  },
  setSimulationSpeed: async (speed) => {
    const res = await api.post('/admin/simulation-speed', { speed });
    return res.data;
  }
};

export const visionAPI = {
  detect: async (image) => {
    const res = await api.post('/vision/detect', { image });
    return res.data;
  }
};

export default api;
