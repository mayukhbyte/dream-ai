import { createClient } from '@supabase/supabase-js';
import * as api from './api';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xyzcompany')
);

// Safe client creation for both browser and serverless edge
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

export interface OrderRecord {
  id: string;
  userId: string;
  userEmail?: string;
  dish: string;
  restaurant: string;
  price: string;
  qualityScore: number;
  hotProbability: number;
  deliveryMode: string;
  eta: string;
  status: 'PREPARING' | 'QUALITY_CHECK' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  createdAt: string;
  telemetry?: any;
}

export interface FoodMemoryRecord {
  id: string;
  userId: string;
  query: string;
  matchedDish: string;
  qualityScore: number;
  createdAt: string;
}

export interface CustomMealRecord {
  id: string;
  userId: string;
  base: string;
  protein: string;
  side: string;
  drink: string;
  price: string;
  createdAt: string;
}

// --- ORDERS API (Delegates directly to Real-Time Backend API) ---
export async function createOrder(orderData: Omit<OrderRecord, 'id' | 'createdAt'>): Promise<OrderRecord> {
  try {
    const order = await api.createOrder({
      userId: orderData.userId,
      userEmail: orderData.userEmail,
      dish: orderData.dish,
      restaurantName: orderData.restaurant,
      price: orderData.price,
      qualityScore: orderData.qualityScore,
      hotProbability: orderData.hotProbability,
      deliveryMode: orderData.deliveryMode,
      eta: orderData.eta
    });
    return {
      id: order.id,
      userId: order.userId,
      userEmail: order.userEmail,
      dish: order.dish,
      restaurant: order.restaurantName,
      price: order.price,
      qualityScore: order.qualityScore,
      hotProbability: order.hotProbability,
      deliveryMode: order.deliveryMode,
      eta: order.eta,
      status: order.status,
      createdAt: order.createdAt,
      telemetry: order.telemetry
    };
  } catch (err) {
    console.warn('Realtime API error placing order:', err);
    throw err;
  }
}

export async function getUserOrders(userId: string): Promise<OrderRecord[]> {
  try {
    const orders = await api.getOrders(userId);
    return orders.map(o => ({
      id: o.id,
      userId: o.userId,
      userEmail: o.userEmail,
      dish: o.dish,
      restaurant: o.restaurantName,
      price: o.price,
      qualityScore: o.qualityScore,
      hotProbability: o.hotProbability,
      deliveryMode: o.deliveryMode,
      eta: o.eta,
      status: o.status,
      createdAt: o.createdAt,
      telemetry: o.telemetry
    }));
  } catch (err) {
    console.warn('Realtime API error fetching orders:', err);
    return [];
  }
}

// --- FOOD MEMORY API ---
export async function recordFoodMemory(userId: string, query: string, matchedDish: string, qualityScore: number) {
  try {
    // Recorded automatically via AI concierge on backend
    return { id: `mem_${Date.now()}`, userId, query, matchedDish, qualityScore, createdAt: new Date().toISOString() };
  } catch (err) {
    console.warn('Food memory error:', err);
  }
}

export async function getUserFoodMemories(userId: string): Promise<FoodMemoryRecord[]> {
  try {
    const memories = await api.getFoodMemories(userId);
    return memories;
  } catch (err) {
    console.warn('Food memory fetch error:', err);
    return [];
  }
}

// --- BUILD MY MEAL CUSTOMIZER API ---
export async function saveCustomMeal(mealData: Omit<CustomMealRecord, 'id' | 'createdAt'>): Promise<CustomMealRecord> {
  try {
    const result = await api.saveCustomMeal(mealData);
    return result.meal;
  } catch (err) {
    console.warn('Custom meal error:', err);
    throw err;
  }
}

export async function getUserCustomMeals(userId: string): Promise<CustomMealRecord[]> {
  try {
    const res = await fetch(`http://localhost:5000/api/orders/custom-meals/list?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      return data.meals || [];
    }
  } catch (err) {
    console.warn('Fetch custom meals error:', err);
  }
  return [];
}
