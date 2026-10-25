import { auth } from '../firebaseConfig';
import {
  getIdToken
} from 'firebase/auth';

// Base URL for API - in production, this would come from environment variables
const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get Firebase ID token
const getAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    const token = await getIdToken(user);
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// API service methods
export const apiService = {
  // Auth endpoints
  auth: {
    verify: () => apiRequest('/auth/verify'),
    profile: () => apiRequest('/auth/profile')
  },

  // Restaurant endpoints
  restaurant: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/restaurants${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => apiRequest(`/restaurants/${id}`),
    search: (query) => apiRequest(`/restaurants/search?q=${encodeURIComponent(query)}`),
    getMenu: (restaurantId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/restaurants/${restaurantId}/menu${queryString ? `?${queryString}` : ''}`);
    }
  },

  // Order endpoints
  order: {
    getCart: () => apiRequest('/orders/cart'),
    addToCart: (menuItemId, quantity = 1, specialInstructions = '') =>
      apiRequest('/orders/cart', {
        method: 'POST',
        body: JSON.stringify({ menuItemId, quantity, specialInstructions })
      }),
    updateCartItem: (itemId, quantity, specialInstructions = '') =>
      apiRequest(`/orders/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity, specialInstructions })
      }),
    removeFromCart: (itemId) =>
      apiRequest(`/orders/cart/${itemId}`, {
        method: 'DELETE'
      }),
    clearCart: () =>
      apiRequest('/orders/cart', {
        method: 'DELETE'
      }),
    createOrder: (orderData) =>
      apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      }),
    getOrders: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`);
    },
    getOrderById: (id) => apiRequest(`/orders/${id}`),
    updateOrderStatus: (id, status) =>
      apiRequest(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
  },

  // AI endpoints
  ai: {
    getRecommendations: (context = {}, limit = 10) =>
      apiRequest('/ai/recommendations', {
        method: 'POST',
        body: JSON.stringify({ context, limit })
      }),
    getHomeContent: () => apiRequest('/ai/home'),
    getQualityScore: (restaurantId, menuItemId) =>
      apiRequest('/ai/quality-score', {
        method: 'POST',
        body: JSON.stringify({ restaurantId, menuItemId })
      }),
    getHotArrivalPrediction: (restaurantId, menuItemIds, deliveryLat, deliveryLng) =>
      apiRequest('/ai/hot-arrival-prediction', {
        method: 'POST',
        body: JSON.stringify({ restaurantId, menuItemIds, deliveryLat, deliveryLng })
      }),
    getExplanation: (recommendationId) =>
      apiRequest('/ai/explain', {
        method: 'POST',
        body: JSON.stringify({ recommendationId })
      })
  }
};

export default apiService;