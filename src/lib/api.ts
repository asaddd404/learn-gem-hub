import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  register: async (data: {
    full_name: string;
    username: string;
    password: string;
    teacher_id: number;
    group_id: number;
  }) => {
    const response = await api.post('/users/', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getTeachers: async () => {
    const response = await api.get('/users/teachers');
    return response.data;
  },
  getAll: async (params?: { role?: string; skip?: number; limit?: number }) => {
    const response = await api.get('/users/', { params });
    return response.data;
  },
  create: async (data: {
    full_name: string;
    username: string;
    password: string;
    role: string;
  }) => {
    const response = await api.post('/users/admin/create', data);
    return response.data;
  },
  getLeaderboard: async () => {
    const response = await api.get('/users/leaderboard');
    return response.data;
  },
};

// Groups API
export const groupsAPI = {
  getAll: async (teacher_id?: number) => {
    const response = await api.get('/groups', { params: { teacher_id } });
    return response.data;
  },
  create: async (data: { name: string; teacher_id: number }) => {
    const response = await api.post('/groups/', data);
    return response.data;
  },
  getStudents: async (groupId: number) => {
    const response = await api.get(`/groups/${groupId}/students`);
    return response.data;
  },
};

// Shop API
export const shopAPI = {
  getItems: async () => {
    const response = await api.get('/shop/items');
    return response.data;
  },
  buyItem: async (itemId: number) => {
    const response = await api.post(`/shop/buy/${itemId}`);
    return response.data;
  },
  createItem: async (data: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    image_url?: string;
  }) => {
    const response = await api.post('/shop/items', data);
    return response.data;
  },
  updateItem: async (itemId: number, data: Partial<{
    name: string;
    description: string;
    price: number;
    quantity: number;
    image_url?: string;
  }>) => {
    const response = await api.put(`/shop/items/${itemId}`, data);
    return response.data;
  },
};

// Transactions API
export const transactionsAPI = {
  getMyTransactions: async () => {
    const response = await api.get('/transactions/my');
    return response.data;
  },
  awardCoins: async (data: {
    student_id: number;
    amount: number;
    comment: string;
  }) => {
    const response = await api.post('/transactions/', data);
    return response.data;
  },
  updateLimit: async (limit: number) => {
    const response = await api.put('/transactions/config/limit', { daily_limit: limit });
    return response.data;
  },
  getConfig: async () => {
    const response = await api.get('/transactions/config');
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getMyOrders: async () => {
    const response = await api.get('/orders/my');
    return response.data;
  },
  getAllOrders: async (status?: string) => {
    const response = await api.get('/orders/', { params: { status } });
    return response.data;
  },
  updateStatus: async (orderId: number, status: string) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};

export default api;
