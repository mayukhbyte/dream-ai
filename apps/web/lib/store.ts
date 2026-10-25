/**
 * Full in-memory database store — ported from packages/api/src/db.ts.
 * Replaces the old store.ts. All backend logic lives here as a Next.js-compatible
 * singleton (no `fs`, no Express — works in Vercel serverless functions).
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Restaurant {
  id: string; name: string; description: string;
  cuisineType: string[]; address: string;
  latitude: number; longitude: number;
  rating: number; qualityScore: number;
  deliveryFee: number; minOrderValue: number;
  isOpen: boolean; imageUrl: string;
  openingTime: string; closingTime: string;
  thermalPackType: string;
}

export interface MenuItem {
  id: string; restaurantId: string; restaurantName?: string;
  name: string; description: string; price: number;
  category: string; isVegetarian: boolean; isVegan: boolean;
  isSpicy: boolean; preparationTime: number; imageUrl: string;
  isAvailable: boolean; thermalOptimalTemp: number;
  qualityScore: number; hotProbability: number;
}

export interface OrderTelemetry {
  currentTemp: number; targetTemp: number; ambientTemp: number;
  batteryLevel: number; riderLat: number; riderLng: number;
  insulationMode: string; lastUpdated: string;
}

export type OrderStatus = 'PREPARING' | 'QUALITY_CHECK' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

export interface PreparationStep {
  id: string; stepNumber: number; title: string;
  description: string; status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

export interface DroneDetails {
  droneId: string; speedKmh: number; altitudeMeters: number;
  etaMins: number; shortestRouteDistanceKm: number; batteryPct: number;
  flightStatus: 'standby' | 'airborne' | 'descending' | 'delivered';
  currentCoordinates?: { lat: number; lng: number };
}

export interface PaymentInfo {
  method: 'COD' | 'ONLINE' | 'UPI' | 'CARD';
  status: 'PENDING' | 'PAID';
  amount: number; transactionId?: string; paidAt?: string;
}

export interface RatingInfo {
  stars: number; review?: string; feedbackTags?: string[];
  ratedAt: string; chefResponse?: string; chefRespondedAt?: string;
}

export interface FoodComplaint {
  id: string; orderId: string; customerMessage: string;
  photoUrl?: string; createdAt: string;
  status: 'RESOLVED' | 'INVESTIGATING'; chefResponse?: string;
}

export interface Order {
  id: string; userId: string; userEmail: string;
  restaurantId: string; restaurantName: string;
  dish: string; price: string; rawPrice: number;
  qualityScore: number; hotProbability: number;
  deliveryMode: 'fast' | 'saver' | 'green';
  eta: string; status: OrderStatus;
  createdAt: string; deliveryAddress: string;
  telemetry: OrderTelemetry;
  preparationSteps?: PreparationStep[];
  chefInitialTemp?: number; chefNotes?: string;
  isReadyForPickup?: boolean; chefFeedbackReply?: string;
  droneDetails?: DroneDetails;
  payment?: PaymentInfo; rating?: RatingInfo;
  complaints?: FoodComplaint[];
}

export interface CustomMeal {
  id: string; userId: string; userEmail?: string;
  base: string; protein: string; side: string;
  drink: string; price: string; createdAt: string;
}

export interface FoodMemory {
  id: string; userId: string; query: string;
  matchedDish: string; qualityScore: number; createdAt: string;
}

// ── Seed data ──────────────────────────────────────────────────────────────────

const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1', name: 'Moti Mahal Delights',
    description: 'Ancestral Mughlai hearth with 70-year old authentic butter chicken recipe & induction heated dispatch.',
    cuisineType: ['North Indian', 'Mughlai', 'Tandoor'],
    address: 'Connaught Place Outer Circle, New Delhi',
    latitude: 28.6315, longitude: 77.2167,
    rating: 4.9, qualityScore: 98, deliveryFee: 35, minOrderValue: 199, isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    openingTime: '11:00', closingTime: '23:30',
    thermalPackType: 'Double-Walled Induction Sealed (90°C)'
  },
  {
    id: 'rest-2', name: 'Pure Botanica Hearth',
    description: 'Farm-to-fork organic culinary kitchen specializing in clay-roasted paneer, superfood bowls, and cold-pressed elixirs.',
    cuisineType: ['Healthy', 'Organic Vegan', 'Contemporary Indian'],
    address: 'Indiranagar 100ft Road, Bengaluru',
    latitude: 12.9784, longitude: 77.6408,
    rating: 4.8, qualityScore: 97, deliveryFee: 29, minOrderValue: 149, isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    openingTime: '08:30', closingTime: '22:30',
    thermalPackType: 'Biodegradable Sugarcane Thermal Clamshell (85°C)'
  },
  {
    id: 'rest-3', name: 'Lucknowi Dum Nawaab',
    description: 'Authentic Awadhi dum pukht cooking in copper handis, slow-steamed with aromatic spices and saffron.',
    cuisineType: ['Awadhi', 'Biryani', 'Kebabs'],
    address: 'Hazratganj Palace Road, Lucknow',
    latitude: 26.8467, longitude: 80.9462,
    rating: 4.95, qualityScore: 99, deliveryFee: 40, minOrderValue: 249, isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    openingTime: '12:00', closingTime: '23:00',
    thermalPackType: 'Clay Pot Sealed Dough Rim (94°C)'
  },
  {
    id: 'rest-4', name: 'Tokyo Umami Bowl',
    description: '18-hour simmered dashi & tonkotsu ramen with springy hand-pulled noodles and hot broth thermos separation.',
    cuisineType: ['Japanese', 'Ramen', 'Asian Bowls'],
    address: 'Bandra West, Mumbai',
    latitude: 19.0596, longitude: 72.8295,
    rating: 4.85, qualityScore: 96, deliveryFee: 45, minOrderValue: 299, isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    openingTime: '11:30', closingTime: '23:00',
    thermalPackType: 'Dual-Chamber Vacuum Thermos (88°C)'
  },
  {
    id: 'rest-5', name: 'Artisan Woodfire Pizzeria',
    description: 'Napoli-style naturally leavened dough baked at 450°C in volcanic stone ovens with crisp crust ventilation.',
    cuisineType: ['Italian', 'Woodfire Pizza', 'Gourmet Pasta'],
    address: 'Jubilee Hills, Hyderabad',
    latitude: 17.4326, longitude: 78.4071,
    rating: 4.78, qualityScore: 95, deliveryFee: 30, minOrderValue: 250, isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    openingTime: '12:00', closingTime: '00:00',
    thermalPackType: 'Corrugated Heat-Vented Thermal Shield (82°C)'
  }
];

const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dish-1', restaurantId: 'rest-1', restaurantName: 'Moti Mahal Delights',
    name: 'Smoked Spice Butter Chicken \u2013 Delhi Heritage',
    description: 'Charcoal-grilled tender chicken simmered in silky tomato-fenugreek reduction, sealed in dual-layer thermal vessel.',
    price: 280, category: 'Main Course', isVegetarian: false, isVegan: false, isSpicy: true,
    preparationTime: 18,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    isAvailable: true, thermalOptimalTemp: 89, qualityScore: 98, hotProbability: 97
  },
  {
    id: 'dish-2', restaurantId: 'rest-2', restaurantName: 'Pure Botanica Hearth',
    name: 'Clay Roasted Paneer Tikka & Jeera Bowl',
    description: 'Malai paneer marinated in stone-ground yellow mustard & Himalayan spices, paired with organic cumin grain.',
    price: 260, category: 'Bowls', isVegetarian: true, isVegan: false, isSpicy: false,
    preparationTime: 14,
    imageUrl: 'https://images.unsplash.com/photo-1567184109-7a54a9386c75?auto=format&fit=crop&w=800&q=80',
    isAvailable: true, thermalOptimalTemp: 86, qualityScore: 97, hotProbability: 96
  },
  {
    id: 'dish-3', restaurantId: 'rest-3', restaurantName: 'Lucknowi Dum Nawaab',
    name: 'Royal Saffron Mutton Dum Biryani',
    description: 'Fragrant long-grain aged basmati layered with succulent goat cuts, cooked on slow glowing charcoal embers.',
    price: 360, category: 'Biryani', isVegetarian: false, isVegan: false, isSpicy: true,
    preparationTime: 22,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true, thermalOptimalTemp: 92, qualityScore: 99, hotProbability: 98
  },
  {
    id: 'dish-4', restaurantId: 'rest-4', restaurantName: 'Tokyo Umami Bowl',
    name: 'Smoked Miso Shiitake Ramen',
    description: 'Rich roasted vegetable and kelp broth, artisanal wheat noodles, torched king oyster mushrooms, and bamboo shoots.',
    price: 320, category: 'Ramen', isVegetarian: true, isVegan: true, isSpicy: false,
    preparationTime: 16,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    isAvailable: true, thermalOptimalTemp: 88, qualityScore: 96, hotProbability: 95
  },
  {
    id: 'dish-5', restaurantId: 'rest-5', restaurantName: 'Artisan Woodfire Pizzeria',
    name: 'Truffle Burrata & Wild Mushroom Pizza',
    description: 'San Marzano DOP tomato sauce, fresh creamy pugliese burrata, saut\u00e9ed porcini mushrooms, white truffle oil.',
    price: 390, category: 'Pizza', isVegetarian: true, isVegan: false, isSpicy: false,
    preparationTime: 15,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isAvailable: true, thermalOptimalTemp: 84, qualityScore: 95, hotProbability: 94
  },
  {
    id: 'dish-6', restaurantId: 'rest-2', restaurantName: 'Pure Botanica Hearth',
    name: 'Avocado Detox Quinoa Crunch Bowl',
    description: 'Hass avocado slices, organic tri-color quinoa, roasted edamame, and cold-pressed citrus tahini glaze under 420 kcal.',
    price: 240, category: 'Healthy', isVegetarian: true, isVegan: true, isSpicy: false,
    preparationTime: 12,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    isAvailable: true, thermalOptimalTemp: 75, qualityScore: 98, hotProbability: 99
  },
  {
    id: 'dish-cold-drink-1', restaurantId: 'rest-1', restaurantName: 'Moti Mahal Delights',
    name: 'Chilled Coca-Cola Classic (330ml Can) \u2013 Official MRP: \u20b940',
    description: 'Ice-cold at 4.0\u00b0C: Sealed 330ml can of original sparkling cola, dispatched at authentic retail MRP. Cryo-sleeve delivery preserves optimal carbonation.',
    price: 40, category: 'Beverages', isVegetarian: true, isVegan: true, isSpicy: false,
    preparationTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    isAvailable: true, thermalOptimalTemp: 4, qualityScore: 99, hotProbability: 99
  },
  {
    id: 'dish-cold-drink-2', restaurantId: 'rest-2', restaurantName: 'Pure Botanica Hearth',
    name: 'Ice-Cold Crisp Lemon Sprite (330ml Can) \u2013 Official MRP: \u20b940',
    description: 'Chilled clear lemon-lime thirst quencher. Dispatched at official Maximum Retail Price (MRP). Cryo-insulated thermal pod holding cold.',
    price: 40, category: 'Beverages', isVegetarian: true, isVegan: true, isSpicy: false,
    preparationTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=800&q=80',
    isAvailable: true, thermalOptimalTemp: 4, qualityScore: 99, hotProbability: 99
  },
  {
    id: 'dish-cold-drink-3', restaurantId: 'rest-4', restaurantName: 'Tokyo Umami Bowl',
    name: 'Slow-Brewed Peach Iced Tea (350ml Bottle) \u2013 Retail MRP: \u20b960',
    description: 'Black tea steeped with real peach extract and crushed mint, served ice chilled at official retail price.',
    price: 60, category: 'Beverages', isVegetarian: true, isVegan: true, isSpicy: false,
    preparationTime: 5,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    isAvailable: true, thermalOptimalTemp: 4, qualityScore: 98, hotProbability: 99
  }
];

// ── Mutable in-memory state (module-level singleton) ───────────────────────────

interface State {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  customMeals: CustomMeal[];
  foodMemories: FoodMemory[];
  complaints: FoodComplaint[];
}

const state: State = {
  restaurants: [...INITIAL_RESTAURANTS],
  menuItems: [...INITIAL_MENU_ITEMS],
  orders: [
    {
      id: 'ord_sample_1',
      userId: 'guest-user',
      userEmail: 'guest@dreamfood.ai',
      restaurantId: 'rest-1',
      restaurantName: 'Moti Mahal Delights',
      dish: 'Smoked Spice Butter Chicken \u2013 Delhi Heritage',
      price: '\u20b9280', rawPrice: 280,
      qualityScore: 98, hotProbability: 97,
      deliveryMode: 'fast',
      eta: '18 mins',
      status: 'DELIVERED',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      deliveryAddress: 'Greenwood Heights, 4th Floor',
      chefInitialTemp: 91.5,
      chefNotes: 'Induction vessel pre-heated. Organic spice crust applied.',
      isReadyForPickup: true,
      preparationSteps: [
        { id: 'step-s1-1', stepNumber: 1, title: 'Ingredient Selection & Mise en Place', description: 'Selecting premium farm-fresh ingredients.', status: 'completed', completedAt: new Date(Date.now() - 1000 * 60 * 44).toISOString() },
        { id: 'step-s1-2', stepNumber: 2, title: 'High-Heat Culinary Crafting', description: 'Saut\u00e9ing and roasting in clay hearth.', status: 'completed', completedAt: new Date(Date.now() - 1000 * 60 * 38).toISOString() },
        { id: 'step-s1-3', stepNumber: 3, title: 'Vacuum Induction Thermal Packaging', description: 'Sealing in double-wall thermal insulation at 91.5\u00b0C dispatch temp.', status: 'completed', completedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { id: 'step-s1-4', stepNumber: 4, title: 'Thermal Quality Check & Ready for Drone', description: 'Final digital probe verification & dispatch readiness.', status: 'completed', completedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() }
      ],
      droneDetails: {
        droneId: 'DR-402', speedKmh: 42, altitudeMeters: 0, etaMins: 0,
        shortestRouteDistanceKm: 3.2, batteryPct: 68, flightStatus: 'delivered',
        currentCoordinates: { lat: 28.640, lng: 77.225 }
      },
      payment: { method: 'ONLINE', status: 'PAID', amount: 280, transactionId: 'PAY-001', paidAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
      rating: { stars: 5, review: 'Piping hot and absolutely delicious!', feedbackTags: ['Hot Arrival', 'Great Packaging', 'Superb Taste'], ratedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      complaints: [],
      telemetry: {
        currentTemp: 76.0, targetTemp: 80.0, ambientTemp: 27.5, batteryLevel: 68,
        riderLat: 28.640, riderLng: 77.225,
        insulationMode: '\u2705 Delivered \u2013 76.0\u00b0C retained',
        lastUpdated: new Date().toISOString()
      }
    }
  ],
  customMeals: [],
  foodMemories: [
    {
      id: 'mem_1', userId: 'guest-user',
      query: 'Spicy butter chicken under \u20b9300 with hot arrival guarantee',
      matchedDish: 'Smoked Spice Butter Chicken \u2013 Delhi Heritage',
      qualityScore: 98, createdAt: new Date().toISOString()
    }
  ],
  complaints: []
};

// ── SSE client registry ────────────────────────────────────────────────────────
type SSEWriter = (data: string) => void;
const sseClients: Map<string, SSEWriter[]> = new Map();

export function registerSSEClient(orderId: string, writer: SSEWriter) {
  if (!sseClients.has(orderId)) sseClients.set(orderId, []);
  sseClients.get(orderId)!.push(writer);
}

export function unregisterSSEClient(orderId: string, writer: SSEWriter) {
  const arr = sseClients.get(orderId);
  if (arr) {
    const idx = arr.indexOf(writer);
    if (idx !== -1) arr.splice(idx, 1);
  }
}

export function broadcastOrderSSE(order: Order) {
  const payload = `data: ${JSON.stringify(order)}\n\n`;
  for (const key of [order.id, '*']) {
    (sseClients.get(key) || []).forEach(w => { try { w(payload); } catch (_) {} });
  }
}

// ── Store API — mirrors db.ts public methods ───────────────────────────────────

export const store = {

  // Restaurants
  getRestaurants: (search?: string, cuisineType?: string, minRating?: number): Restaurant[] => {
    let list = state.restaurants;
    if (cuisineType) {
      const t = cuisineType.toLowerCase();
      list = list.filter(r => r.cuisineType.some(c => c.toLowerCase().includes(t)));
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.cuisineType.some(c => c.toLowerCase().includes(s))
      );
    }
    if (minRating) {
      list = list.filter(r => r.rating >= minRating);
    }
    return list;
  },

  getRestaurantById: (id: string): (Restaurant & { menuItems: MenuItem[] }) | null => {
    const rest = state.restaurants.find(r => r.id === id);
    if (!rest) return null;
    return { ...rest, menuItems: state.menuItems.filter(m => m.restaurantId === id) };
  },

  // Menu Items
  getMenuItems: (restaurantId?: string, category?: string, isVegetarian?: boolean): MenuItem[] => {
    let items = state.menuItems;
    if (restaurantId) items = items.filter(m => m.restaurantId === restaurantId);
    if (category) items = items.filter(m => m.category.toLowerCase() === category.toLowerCase());
    if (isVegetarian !== undefined) items = items.filter(m => m.isVegetarian === isVegetarian);
    return items;
  },
  getMenuItemById: (id: string) => state.menuItems.find(m => m.id === id) || null,
  addMenuItem: (item: MenuItem): MenuItem => {
    const existing = state.menuItems.find(m => m.id === item.id || m.name.toLowerCase() === item.name.toLowerCase());
    if (existing) return existing;
    state.menuItems.push(item);
    return item;
  },

  // Orders
  getOrders: (userId?: string): Order[] =>
    userId ? state.orders.filter(o => o.userId === userId) : state.orders,

  getOrderById: (id: string): Order | null =>
    state.orders.find(o => o.id === id) || null,

  createOrder: (payload: Omit<Order, 'id' | 'createdAt' | 'telemetry'>): Order => {
    const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const restaurant = state.restaurants.find(r => r.id === payload.restaurantId) || state.restaurants[0];
    const order: Order = {
      ...payload,
      id,
      createdAt: new Date().toISOString(),
      chefInitialTemp: 91.5,
      isReadyForPickup: false,
      chefNotes: 'Induction vessel pre-heated. Organic spice crust applied.',
      preparationSteps: [
        { id: `step-${id}-1`, stepNumber: 1, title: 'Ingredient Selection & Mise en Place', description: 'Selecting premium farm-fresh ingredients and artisanal spices.', status: 'completed', completedAt: new Date().toISOString() },
        { id: `step-${id}-2`, stepNumber: 2, title: 'High-Heat Culinary Crafting', description: 'Saut\u00e9ing and roasting in clay hearth to lock in aromatics.', status: 'in_progress' },
        { id: `step-${id}-3`, stepNumber: 3, title: 'Vacuum Induction Thermal Packaging', description: 'Sealing in double-wall thermal insulation at 91.5\u00b0C dispatch temp.', status: 'pending' },
        { id: `step-${id}-4`, stepNumber: 4, title: 'Thermal Quality Check & Ready for Drone', description: 'Final digital probe verification & dispatch readiness.', status: 'pending' }
      ],
      droneDetails: {
        droneId: 'DR-402', speedKmh: 42, altitudeMeters: 75, etaMins: 16,
        shortestRouteDistanceKm: 3.2, batteryPct: 98, flightStatus: 'standby',
        currentCoordinates: { lat: restaurant.latitude, lng: restaurant.longitude }
      },
      payment: { method: 'ONLINE', status: 'PENDING', amount: payload.rawPrice || 280 },
      complaints: [],
      telemetry: {
        currentTemp: payload.hotProbability > 90 ? 91.5 : 86.0,
        targetTemp: 78.0, ambientTemp: 26.5, batteryLevel: 98,
        riderLat: restaurant.latitude + (Math.random() - 0.5) * 0.01,
        riderLng: restaurant.longitude + (Math.random() - 0.5) * 0.01,
        insulationMode: payload.deliveryMode === 'fast'
          ? 'Thermal Induction Shield (Priority Drone/Rider)'
          : payload.deliveryMode === 'green'
          ? 'Zero-Emission Insulated Cargo Carrier'
          : 'Smart Multi-Stop Thermal Consolidation',
        lastUpdated: new Date().toISOString()
      }
    };
    state.orders.unshift(order);
    return order;
  },

  updateOrderStatus: (id: string, status: OrderStatus, telemetryUpdates?: Partial<OrderTelemetry>): Order | null => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return null;
    order.status = status;
    if (telemetryUpdates) {
      order.telemetry = { ...order.telemetry, ...telemetryUpdates, lastUpdated: new Date().toISOString() };
    } else {
      order.telemetry.lastUpdated = new Date().toISOString();
    }
    return order;
  },

  // Chef Terminal
  updateOrderChef: (id: string, updates: { preparationSteps?: PreparationStep[]; chefInitialTemp?: number; chefNotes?: string; isReadyForPickup?: boolean }): Order | null => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return null;
    if (updates.preparationSteps) order.preparationSteps = updates.preparationSteps;
    if (updates.chefInitialTemp !== undefined) {
      order.chefInitialTemp = updates.chefInitialTemp;
      order.telemetry.currentTemp = updates.chefInitialTemp;
    }
    if (updates.chefNotes !== undefined) order.chefNotes = updates.chefNotes;
    if (updates.isReadyForPickup !== undefined) {
      order.isReadyForPickup = updates.isReadyForPickup;
      if (updates.isReadyForPickup && order.status === 'PREPARING') {
        order.status = 'QUALITY_CHECK';
        order.telemetry.insulationMode = '\ud83d\udc68\u200d\ud83c\udf73 Chef Order Ready: Passed Thermal Quality Gate. Awaiting Drone Pickup.';
      }
    }
    order.telemetry.lastUpdated = new Date().toISOString();
    return order;
  },

  // Drone/Delivery Pilot
  updateOrderDelivery: (id: string, updates: Partial<DroneDetails> & { eta?: string }): Order | null => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return null;
    if (!order.droneDetails) {
      order.droneDetails = { droneId: 'DR-402', speedKmh: 45, altitudeMeters: 75, etaMins: 15, shortestRouteDistanceKm: 3.2, batteryPct: 95, flightStatus: 'standby' };
    }
    Object.assign(order.droneDetails, updates);
    if (updates.eta) order.eta = updates.eta;
    if (updates.speedKmh) {
      order.telemetry.insulationMode = `\ud83d\ude81 Drone #${order.droneDetails.droneId} Airborne: Speed ${updates.speedKmh} km/h \u2022 Altitude ${order.droneDetails.altitudeMeters || 80}m`;
    }
    if (updates.flightStatus === 'airborne' && order.status !== 'OUT_FOR_DELIVERY') order.status = 'OUT_FOR_DELIVERY';
    if (updates.flightStatus === 'delivered' && order.status !== 'DELIVERED') order.status = 'DELIVERED';
    order.telemetry.lastUpdated = new Date().toISOString();
    return order;
  },

  // Handover to drone
  handoverToDrone: (id: string): Order | null => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return null;
    if (!order.droneDetails) {
      order.droneDetails = { droneId: 'DR-402', speedKmh: 42, altitudeMeters: 75, etaMins: 16, shortestRouteDistanceKm: 3.2, batteryPct: 98, flightStatus: 'standby' };
    }
    order.droneDetails.flightStatus = 'airborne';
    order.status = 'OUT_FOR_DELIVERY';
    order.telemetry.insulationMode = '\ud83d\ude81 Drone #DR-402 Airborne & Connected';
    order.telemetry.lastUpdated = new Date().toISOString();
    return order;
  },

  // Payment
  updateOrderPayment: (id: string, payment: PaymentInfo): Order | null => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return null;
    order.payment = { ...payment, paidAt: new Date().toISOString() };
    return order;
  },

  // Rating
  updateOrderRating: (id: string, rating: Omit<RatingInfo, 'ratedAt'>): Order | null => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return null;
    order.rating = { ...rating, ratedAt: new Date().toISOString() };
    return order;
  },

  // Complaints
  addOrderComplaint: (id: string, complaint: { customerMessage: string; photoUrl?: string }): FoodComplaint | null => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return null;
    const newComplaint: FoodComplaint = {
      id: `complaint_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId: id, customerMessage: complaint.customerMessage,
      photoUrl: complaint.photoUrl, createdAt: new Date().toISOString(),
      status: 'INVESTIGATING'
    };
    if (!order.complaints) order.complaints = [];
    order.complaints.unshift(newComplaint);
    state.complaints.unshift(newComplaint);
    return newComplaint;
  },

  getAllComplaints: (): FoodComplaint[] => state.complaints,

  // Chef Reply
  updateOrderChefFeedbackReply: (id: string, reply: string): Order | null => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return null;
    order.chefFeedbackReply = reply;
    if (order.rating) { order.rating.chefResponse = reply; order.rating.chefRespondedAt = new Date().toISOString(); }
    if (order.complaints) {
      order.complaints.forEach(c => { c.chefResponse = reply; c.status = 'RESOLVED'; });
    }
    state.complaints.filter(c => c.orderId === id).forEach(c => { c.chefResponse = reply; c.status = 'RESOLVED'; });
    return order;
  },

  // Custom Meals
  saveCustomMeal: (meal: Omit<CustomMeal, 'id' | 'createdAt'>): CustomMeal => {
    const newMeal: CustomMeal = { ...meal, id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, createdAt: new Date().toISOString() };
    state.customMeals.unshift(newMeal);
    return newMeal;
  },
  getCustomMeals: (userId?: string): CustomMeal[] =>
    userId ? state.customMeals.filter(m => m.userId === userId) : state.customMeals,

  // Food Memory
  saveFoodMemory: (memory: Omit<FoodMemory, 'id' | 'createdAt'>): FoodMemory => {
    const mem: FoodMemory = { ...memory, id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, createdAt: new Date().toISOString() };
    state.foodMemories.unshift(mem);
    return mem;
  },
  getFoodMemories: (userId?: string): FoodMemory[] =>
    userId ? state.foodMemories.filter(m => m.userId === userId) : state.foodMemories,

  stats: () => ({
    restaurants: state.restaurants.length,
    dishes: state.menuItems.length,
    orders: state.orders.length
  }),

  updateOrderTelemetry: (id: string, telemetry: Partial<OrderTelemetry>): Order | null => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return null;
    Object.assign(order.telemetry, telemetry, { lastUpdated: new Date().toISOString() });
    return order;
  }
};

// ── Order lifecycle simulation ─────────────────────────────────────────────────
const activeSimulations = new Set<string>();

export function startOrderLifecycle(orderId: string) {
  if (activeSimulations.has(orderId)) return;
  activeSimulations.add(orderId);

  const stages = [
    { status: 'QUALITY_CHECK' as OrderStatus, delay: 6000, temp: 88.5, mode: '\ud83d\udd0d Quality Inspection at kitchen' },
    { status: 'OUT_FOR_DELIVERY' as OrderStatus, delay: 14000, temp: 86.0, mode: '\ud83d\ude81 Drone #DR-402 Airborne & Connected' },
    { status: 'DELIVERED' as OrderStatus, delay: 38000, temp: 78.0, mode: '\u2705 Delivered \u2013 thermal locked' }
  ];

  let elapsed = 0;
  for (const stage of stages) {
    elapsed += stage.delay;
    const d = elapsed;
    setTimeout(() => {
      const order = store.getOrderById(orderId);
      if (!order || order.status === 'DELIVERED') return;
      const updated = store.updateOrderStatus(orderId, stage.status, {
        insulationMode: stage.mode,
        currentTemp: stage.temp + (Math.random() * 2 - 1)
      });
      if (updated) broadcastOrderSSE(updated);
    }, d);
  }

  let ticks = 0;
  const iv = setInterval(() => {
    const order = store.getOrderById(orderId);
    if (!order || order.status === 'DELIVERED') { clearInterval(iv); activeSimulations.delete(orderId); return; }
    if (order.status === 'OUT_FOR_DELIVERY') {
      ticks++;
      const rest = state.restaurants.find(r => r.id === order.restaurantId) || { latitude: 28.63, longitude: 77.21 };
      const prog = Math.min(ticks / 10, 1);
      const updated = store.updateOrderTelemetry(orderId, {
        currentTemp: Math.max(75, 87 - ticks * 0.4 + (Math.random() * 0.8 - 0.4)),
        batteryLevel: Math.max(60, 96 - ticks),
        riderLat: rest.latitude + (28.640 - rest.latitude) * prog,
        riderLng: rest.longitude + (77.225 - rest.longitude) * prog,
        insulationMode: `\ud83d\ude81 Drone #DR-402 \u2022 ${35 + ticks}km/h \u2022 ${(87 - ticks * 0.4).toFixed(1)}\u00b0C`
      });
      if (updated) broadcastOrderSSE(updated);
    }
  }, 3000);

  setTimeout(() => { clearInterval(iv); activeSimulations.delete(orderId); }, 50000);
}
