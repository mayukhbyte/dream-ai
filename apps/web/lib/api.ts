import { io, Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket && typeof window !== 'undefined') {
    socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to DreamFood Real-Time WebSocket Server at', API_BASE);
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Disconnected from DreamFood WebSocket Server');
    });
  }
  return socket as Socket;
}

export interface Dish {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isSpicy: boolean;
  preparationTime: number;
  imageUrl: string;
  isAvailable: boolean;
  thermalOptimalTemp: number;
  qualityScore: number;
  hotProbability: number;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisineType: string[];
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  qualityScore: number;
  deliveryFee: number;
  minOrderValue: number;
  isOpen: boolean;
  imageUrl: string;
  openingTime: string;
  closingTime: string;
  thermalPackType: string;
}

export interface OrderTelemetry {
  currentTemp: number;
  targetTemp: number;
  ambientTemp: number;
  batteryLevel: number;
  riderLat: number;
  riderLng: number;
  insulationMode: string;
  lastUpdated: string;
}

export interface PreparationStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

export interface DroneDetails {
  droneId: string;
  speedKmh: number;
  altitudeMeters: number;
  etaMins: number;
  shortestRouteDistanceKm: number;
  batteryPct: number;
  flightStatus: 'standby' | 'airborne' | 'descending' | 'delivered';
  currentCoordinates?: { lat: number; lng: number };
}

export interface PaymentInfo {
  method: 'COD' | 'ONLINE' | 'UPI' | 'CARD';
  status: 'PENDING' | 'PAID';
  amount: number;
  transactionId?: string;
  paidAt?: string;
}

export interface RatingInfo {
  stars: number;
  review?: string;
  feedbackTags?: string[];
  ratedAt: string;
  chefResponse?: string;
  chefRespondedAt?: string;
}

export interface FoodComplaint {
  id: string;
  orderId: string;
  customerMessage: string;
  photoUrl?: string;
  createdAt: string;
  status: 'RESOLVED' | 'INVESTIGATING';
  chefResponse?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  restaurantId: string;
  restaurantName: string;
  dish: string;
  price: string;
  rawPrice: number;
  qualityScore: number;
  hotProbability: number;
  deliveryMode: 'fast' | 'saver' | 'green';
  eta: string;
  status: 'PREPARING' | 'QUALITY_CHECK' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  createdAt: string;
  deliveryAddress: string;
  telemetry: OrderTelemetry;
  // Chef features
  preparationSteps?: PreparationStep[];
  chefInitialTemp?: number;
  chefNotes?: string;
  isReadyForPickup?: boolean;
  chefFeedbackReply?: string;
  // Delivery features
  droneDetails?: DroneDetails;
  // Payment & Rating
  payment?: PaymentInfo;
  rating?: RatingInfo;
  // Complaints
  complaints?: FoodComplaint[];
}

export interface AIConciergeResponse {
  dish: string;
  dishId?: string;
  restaurant: string;
  restaurantId?: string;
  price: string;
  rawPrice: number;
  qualityScore: number;
  hotProbability: number;
  prepTime: string;
  eta?: string;
  tasteRating: string;
  packagingRating: string;
  orderAccuracy: string;
  explanation: string;
  imageUrl?: string;
}

export interface CustomMealPayload {
  userId: string;
  userEmail?: string;
  base: string;
  protein: string;
  side: string;
  drink: string;
  price?: string;
}

export interface FoodMemoryRecord {
  id: string;
  userId: string;
  query: string;
  matchedDish: string;
  qualityScore: number;
  createdAt: string;
}

// Check Backend Health
export async function checkBackendHealth(): Promise<{ status: string; connected: boolean; stats?: any }> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      const data = await res.json();
      return { status: 'ok', connected: true, stats: data.stats };
    }
  } catch (err) {
    // API not reachable
  }
  return { status: 'disconnected', connected: false };
}

// Fetch all dishes directly from real backend database
export async function getLiveDishes(): Promise<Dish[]> {
  const res = await fetch(`${API_BASE}/api/restaurants/dishes/all`);
  if (!res.ok) throw new Error(`Failed to fetch dishes: ${res.statusText}`);
  const data = await res.json();
  return data.dishes || [];
}

// Fetch all restaurants directly from real backend database
export async function getRestaurants(query?: string): Promise<Restaurant[]> {
  const url = query ? `${API_BASE}/api/restaurants?search=${encodeURIComponent(query)}` : `${API_BASE}/api/restaurants`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch restaurants: ${res.statusText}`);
  const data = await res.json();
  return data.restaurants || [];
}

// Fetch orders for user from real backend database
export async function getOrders(userId?: string): Promise<Order[]> {
  const url = userId ? `${API_BASE}/api/orders?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/orders`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.statusText}`);
  const data = await res.json();
  return data.orders || [];
}

// Place a new order into the real backend
export async function createOrder(payload: {
  userId?: string;
  userEmail?: string;
  dish: string;
  restaurantName?: string;
  price: string;
  rawPrice?: number;
  qualityScore?: number;
  hotProbability?: number;
  deliveryMode?: string;
  eta?: string;
  deliveryAddress?: string;
}): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create order: ${res.statusText}`);
  const data = await res.json();
  return data.order;
}

// Update order status manually or simulate transition
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error(`Failed to update order status: ${res.statusText}`);
  const data = await res.json();
  return data.order;
}

// Handover order to 3D Drone tracking
export async function handoverOrderToDrone(orderId: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/handover-drone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Handover failed: ${res.statusText}`);
  const data = await res.json();
  return data.order;
}

// Ask AI Concierge (Real thermodynamic route matching against DB)
export async function askAIConcierge(prompt: string, userId?: string, deliveryMode = 'fast'): Promise<AIConciergeResponse> {
  const res = await fetch(`${API_BASE}/api/ai/concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      userId: userId || 'guest-user',
      deliveryMode
    })
  });
  if (!res.ok) throw new Error(`AI Concierge request failed: ${res.statusText}`);
  return await res.json();
}

// Save Custom Meal Configuration
export async function saveCustomMeal(payload: CustomMealPayload) {
  const res = await fetch(`${API_BASE}/api/orders/custom-meal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to save custom meal: ${res.statusText}`);
  return await res.json();
}

// Get user's saved food memory
export async function getFoodMemories(userId?: string): Promise<FoodMemoryRecord[]> {
  const url = userId ? `${API_BASE}/api/orders/food-memory/list?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/orders/food-memory/list`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.memories || [];
}

// Chef Terminal: Update preparation steps, initial cooking temp, notes, ready for pickup
export async function chefUpdateOrder(orderId: string, payload: {
  preparationSteps?: PreparationStep[];
  chefInitialTemp?: number;
  chefNotes?: string;
  isReadyForPickup?: boolean;
}): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/chef-update`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Chef update failed: ${res.statusText}`);
  const data = await res.json();
  return data.order;
}

// Delivery / Drone Pilot: Update drone speed, altitude, eta, shortest route, flight status
export async function deliveryUpdateOrder(orderId: string, payload: {
  speedKmh?: number;
  altitudeMeters?: number;
  etaMins?: number;
  shortestRouteDistanceKm?: number;
  flightStatus?: 'standby' | 'airborne' | 'descending' | 'delivered';
  eta?: string;
}): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/delivery-update`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Delivery update failed: ${res.statusText}`);
  const data = await res.json();
  return data.order;
}

// Customer: Submit payment (Cash on Delivery or Online Mode)
export async function submitOrderPayment(orderId: string, payload: {
  method: 'COD' | 'ONLINE' | 'UPI' | 'CARD';
  amount?: number;
  transactionId?: string;
}): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Payment submission failed: ${res.statusText}`);
  const data = await res.json();
  return data.order;
}

// Customer: Submit rating (1-5 stars) and review feedback
export async function submitOrderRating(orderId: string, payload: {
  stars: number;
  review?: string;
  feedbackTags?: string[];
}): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Rating submission failed: ${res.statusText}`);
  const data = await res.json();
  return data.order;
}

// Customer: Submit bad food complaint with camera photo
export async function submitOrderComplaint(orderId: string, payload: {
  customerMessage: string;
  photoUrl?: string;
}): Promise<{ success: boolean; complaint: FoodComplaint; helpline: string; supportSite: string }> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/complaint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Complaint submission failed: ${res.statusText}`);
  return await res.json();
}

// Chef Dashboard: List all customer complaints with photos
export async function getAllComplaints(): Promise<FoodComplaint[]> {
  try {
    const res = await fetch(`${API_BASE}/api/orders/complaints/all`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.complaints || [];
  } catch (err) {
    return [];
  }
}

// Chef: Reply to customer rating/complaint feedback
export async function chefReplyToFeedback(orderId: string, reply: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/chef-reply`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply })
  });
  if (!res.ok) throw new Error(`Chef reply failed: ${res.statusText}`);
  const data = await res.json();
  return data.order;
}
