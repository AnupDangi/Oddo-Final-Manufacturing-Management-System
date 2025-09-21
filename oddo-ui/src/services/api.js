// API service for authentication and other API calls
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication services
export const authService = {

  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigation will be handled by the AuthContext
    return { success: true, message: 'Logged out successfully' };
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Manufacturing Order services
export const manufacturingOrderService = {
  // Create manufacturing order by product search
  createByProductSearch: async (orderData) => {
    try {
      const response = await apiClient.post('/manufacturing-orders/by-product-search', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create manufacturing order by product ID
  create: async (orderData) => {
    try {
      const response = await apiClient.post('/manufacturing-orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all manufacturing orders
  getAll: async (queryParams = {}) => {
    try {
      const response = await apiClient.get('/manufacturing-orders', { params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get manufacturing order by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/manufacturing-orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update manufacturing order
  update: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/manufacturing-orders/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update manufacturing order status
  updateStatus: async (id, status, notes = '') => {
    try {
      const response = await apiClient.patch(`/manufacturing-orders/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get material requirements
  getMaterialRequirements: async (id) => {
    try {
      const response = await apiClient.get(`/manufacturing-orders/${id}/material-requirements`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Check material availability
  checkMaterialAvailability: async (id) => {
    try {
      const response = await apiClient.post(`/manufacturing-orders/${id}/check-materials`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate work orders
  generateWorkOrders: async (id, workCenterAssignments) => {
    try {
      const response = await apiClient.post(`/manufacturing-orders/${id}/generate-work-orders`, {
        work_center_assignments: workCenterAssignments
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get manufacturing orders by status
  getByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/manufacturing-orders/by-status/${status}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Work Center services
export const workCenterService = {
  // Create work center
  create: async (workCenterData) => {
    try {
      const response = await apiClient.post('/work-centers', workCenterData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all work centers
  getAll: async (queryParams = {}) => {
    try {
      const response = await apiClient.get('/work-centers', { params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get work center by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/work-centers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update work center
  update: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/work-centers/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete work center
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/work-centers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// BOM services
export const bomService = {
  // Create BOM
  create: async (bomData) => {
    try {
      const response = await apiClient.post('/boms', bomData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all BOMs
  getAll: async (queryParams = {}) => {
    try {
      const response = await apiClient.get('/boms', { params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get BOM by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/boms/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update BOM
  update: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/boms/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete BOM
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/boms/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get BOM cost calculation
  calculateCost: async (id, quantity) => {
    try {
      const response = await apiClient.get(`/boms/${id}/cost-calculation`, {
        params: { quantity }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Work Order services
export const workOrderService = {
  // Create work order
  create: async (workOrderData) => {
    try {
      const response = await apiClient.post('/work-orders', workOrderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all work orders
  getAll: async (queryParams = {}) => {
    try {
      const response = await apiClient.get('/work-orders', { params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get work order by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/work-orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update work order
  update: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/work-orders/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update work order status
  updateStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/work-orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Start work order timer
  startTimer: async (id) => {
    try {
      const response = await apiClient.post(`/work-orders/${id}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Stop work order timer
  stopTimer: async (id) => {
    try {
      const response = await apiClient.post(`/work-orders/${id}/stop`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get work orders by manufacturing order
  getByManufacturingOrder: async (manufacturingOrderId) => {
    try {
      const response = await apiClient.get(`/work-orders/by-manufacturing-order/${manufacturingOrderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Stock Ledger services
export const stockLedgerService = {
  // Get stock summary for all products
  getStockSummary: async (queryParams = {}) => {
    try {
      const response = await apiClient.get('/stock-ledger/summary', { params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get stock summary for specific product
  getProductStock: async (productId) => {
    try {
      const response = await apiClient.get(`/stock-ledger/product/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get stock transactions
  getTransactions: async (queryParams = {}) => {
    try {
      const response = await apiClient.get('/stock-ledger/transactions', { params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create stock transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await apiClient.post('/stock-ledger/transactions', transactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Product services
export const productService = {
  // Create product
  create: async (productData) => {
    try {
      const response = await apiClient.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all products
  getAll: async (queryParams = {}) => {
    try {
      const response = await apiClient.get('/products', { params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get product by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update product
  update: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/products/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete product
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Search products
  search: async (searchTerm) => {
    try {
      const response = await apiClient.get(`/products/search`, {
        params: { q: searchTerm }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default apiClient;