/**
 * Vercel-compatible in-memory data store (singleton).
 * Replaces the file-based db.ts from packages/api/src/db.ts.
 * All data lives in module scope across warm serverless invocations.
 */

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

export interface Order {
  id: string; userId: string; userEmail: string;
  restaurantId: string; restaurantName: string;
  dish: string; price: string; rawPrice: number;
  qualityScore: number; hotProbability: number;
  deliveryMode: 'fast' | 'saver' | 'green';
  eta: string; status: OrderStatus;
  createdAt: string; deliveryAddress: string;
  telemetry: OrderTelemetry;
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

const RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1', name: 'Moti Mahal Delights',
    description: 'Ancestral Mughlai hearth with 70-year old authentic butter chicken recipe & induction heated dispatch.',
    cuisineType: ['North Indian', 'Mughlai', 'Tandoor'],
    address: 'Connaught Place Outer Circle, New Delhi',
    latitude: 28.6315, longitude: 77.2167,
    rating: 4.9, qualityScore: 98, deliveryFee: 35, minOrderValue: 199,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    openingTime: '11:00', closingTime: '23:30',
    thermalPackType: 'Double-Walled Induction Sealed (90\u00b0C)'
  },
  {
    id: 'rest-2', name: 'Pure Botanica Hearth',
    description: 'Farm-to-fork organic culinary kitchen specializing in clay-roasted paneer, superfood bowls, and cold-pressed elixirs.',
    cuisineType: ['Healthy', 'Organic Vegan', 'Contemporary Indian'],
    address: 'Indiranagar 100ft Road, Bengaluru',
    latitude: 12.9784, longitude: 77.6408,
    rating: 4.8, qualityScore: 97, deliveryFee: 29, minOrderValue: 149,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    openingTime: '08:30', closingTime: '22:30',
    thermalPackType: 'Biodegradable Sugarcane Thermal Clamshell (85\u00b0C)'
  },
  {
    id: 'rest-3', name: 'Lucknowi Dum Nawaab',
    description: 'Authentic Awadhi dum pukht cooking in copper handis, slow-steamed with aromatic spices and saffron.',
    cuisineType: ['Awadhi', 'Biryani', 'Kebabs'],
    address: 'Hazratganj Palace Road, Lucknow',
    latitude: 26.8467, longitude: 80.9462,
    rating: 4.95, qualityScore: 99, deliveryFee: 40, minOrderValue: 249,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    openingTime: '12:00', closingTime: '23:00',
    thermalPackType: 'Clay Pot Sealed Dough Rim (94\u00b0C)'
  },
  {
    id: 'rest-4', name: 'Tokyo Umami Bowl',
    description: '18-hour simmered dashi & tonkotsu ramen with springy hand-pulled noodles and hot broth thermos separation.',
    cuisineType: ['Japanese', 'Ramen', 'Asian Bowls'],
    address: 'Bandra West, Mumbai',
    latitude: 19.0596, longitude: 72.8295,
    rating: 4.85, qualityScore: 96, deliveryFee: 45, minOrderValue: 299,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    openingTime: '11:30', closingTime: '23:00',
    thermalPackType: 'Dual-Chamber Vacuum Thermos (88\u00b0C)'
  },
  {
    id: 'rest-5', name: 'Artisan Woodfire Pizzeria',
    description: 'Napoli-style naturally leavened dough baked at 450\u00b0C in volcanic stone ovens with crisp crust ventilation.',
    cuisineType: ['Italian', 'Woodfire Pizza', 'Gourmet Pasta'],
    address: 'Jubilee Hills, Hyderabad',
    latitude: 17.4326, longitude: 78.4071,
    rating: 4.78, qualityScore: 95, deliveryFee: 30, minOrderValue: 250,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    openingTime: '12:00', closingTime: '00:00',
    thermalPackType: 'Corrugated Heat-Vented Thermal Shield (82\u00b0C)'
  }
];

const MENU_ITEMS: MenuItem[] = [
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
    description: 'San Marzano DOP tomato sauce, fresh creamy pugliese burrata, sau\u00e9t\u00e9ed porcini mushrooms, white truffle oil.',
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
  }
];

// ── Mutable in-memory state ────────────────────────────────────────────────────

const state = {
  restaurants: [...RESTAURANTS],
  menuItems: [...MENU_ITEMS],
  orders: [
    {
      id: 'ord_sample_1',
      userId: 'guest-user',
      userEmail: 'guest@dreamfood.ai',
      restaurantId: 'rest-1',
      restaurantName: 'Moti Mahal Delights',
      dish: 'Smoked Spice Butter Chicken \u2013 Delhi Heritage',
      price: '\u20b9280',
      rawPrice: 280,
      qualityScore: 98,
      hotProbability: 97,
      deliveryMode: 'fast' as const,
      eta: '18 mins',
      status: 'DELIVERED' as OrderStatus,
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      deliveryAddress: 'Greenwood Heights, 4th Floor',
      telemetry: {
        currentTemp: 76.0,
        targetTemp: 80.0,
        ambientTemp: 27.5,
        batteryLevel: 78,
        riderLat: 28.634,
        riderLng: 77.219,
        insulationMode: '\u2705 Delivered \u2013 76.0\u00b0C retained',
        lastUpdated: new Date().toISOString()
      }
    }
  ] as Order[],
  customMeals: [] as CustomMeal[],
  foodMemories: [
    {
      id: 'mem_1',
      userId: 'guest-user',
      query: 'Spicy butter chicken under \u20b9300 with hot arrival guarantee',
      matchedDish: 'Smoked Spice Butter Chicken \u2013 Delhi Heritage',
      qualityScore: 98,
      createdAt: new Date().toISOString()
    }
  ] as FoodMemory[]
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
  const allKeys = [order.id, '*'];
  const payload = `data: ${JSON.stringify(order)}\n\n`;
  allKeys.forEach(key => {
    (sseClients.get(key) || []).forEach(writer => {
      try { writer(payload); } catch (_) {}
    });
  });
}

// ── Store API ──────────────────────────────────────────────────────────────────

export const store = {
  getRestaurants: (search?: string): Restaurant[] => {
    if (!search) return state.restaurants;
    const q = search.toLowerCase();
    return state.restaurants.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.cuisineType.some(c => c.toLowerCase().includes(q)) ||
      r.address.toLowerCase().includes(q)
    );
  },
  getRestaurantById: (id: string) => state.restaurants.find(r => r.id === id),

  getMenuItems: (restaurantId?: string): MenuItem[] =>
    restaurantId ? state.menuItems.filter(m => m.restaurantId === restaurantId) : state.menuItems,
  getMenuItemById: (id: string) => state.menuItems.find(m => m.id === id),
  addMenuItem: (item: MenuItem) => { state.menuItems.push(item); return item; },

  getOrders: (userId?: string): Order[] =>
    userId ? state.orders.filter(o => o.userId === userId) : state.orders,
  getOrderById: (id: string) => state.orders.find(o => o.id === id),

  createOrder: (payload: Omit<Order, 'id' | 'createdAt' | 'telemetry'>): Order => {
    const restaurant = state.restaurants.find(r => r.id === payload.restaurantId) || state.restaurants[0];
    const order: Order = {
      ...payload,
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      telemetry: {
        currentTemp: 89.5,
        targetTemp: 80,
        ambientTemp: 27,
        batteryLevel: 100,
        riderLat: restaurant.latitude,
        riderLng: restaurant.longitude,
        insulationMode: `\ud83d\udd25 Preparing at ${restaurant.name}`,
        lastUpdated: new Date().toISOString()
      }
    };
    state.orders.push(order);
    return order;
  },

  updateOrderStatus: (id: string, status: OrderStatus, telemetry?: Partial<OrderTelemetry>): Order | null => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return null;
    order.status = status;
    if (telemetry) Object.assign(order.telemetry, telemetry);
    order.telemetry.lastUpdated = new Date().toISOString();
    return order;
  },

  updateOrderTelemetry: (id: string, telemetry: Partial<OrderTelemetry>): Order | null => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return null;
    Object.assign(order.telemetry, telemetry, { lastUpdated: new Date().toISOString() });
    return order;
  },

  saveCustomMeal: (payload: Omit<CustomMeal, 'id' | 'createdAt'>): CustomMeal => {
    const meal: CustomMeal = { ...payload, id: `meal_${Date.now()}`, createdAt: new Date().toISOString() };
    state.customMeals.push(meal);
    return meal;
  },
  getCustomMeals: (userId?: string) =>
    userId ? state.customMeals.filter(m => m.userId === userId) : state.customMeals,

  saveFoodMemory: (payload: Omit<FoodMemory, 'id' | 'createdAt'>): FoodMemory => {
    const mem: FoodMemory = { ...payload, id: `mem_${Date.now()}`, createdAt: new Date().toISOString() };
    state.foodMemories.push(mem);
    return mem;
  },
  getFoodMemories: (userId?: string) =>
    userId ? state.foodMemories.filter(m => m.userId === userId) : state.foodMemories,

  stats: () => ({
    restaurants: state.restaurants.length,
    dishes: state.menuItems.length,
    orders: state.orders.length
  })
};

// ── Order lifecycle simulation ─────────────────────────────────────────────────
const activeSimulations = new Set<string>();

export function startOrderLifecycle(orderId: string) {
  if (activeSimulations.has(orderId)) return;
  activeSimulations.add(orderId);

  const stages = [
    { status: 'QUALITY_CHECK' as OrderStatus, delay: 5000,  temp: 88.5, mode: '\ud83d\udd0d Quality Inspection at kitchen' },
    { status: 'OUT_FOR_DELIVERY' as OrderStatus, delay: 11000, temp: 86.0, mode: '\ud83d\ude81 Drone #DR-402 Airborne & Connected' },
    { status: 'DELIVERED' as OrderStatus, delay: 32000, temp: 78.0, mode: '\u2705 Delivered \u2013 thermal locked' }
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

  // Telemetry ticks every 3s while OUT_FOR_DELIVERY
  let ticks = 0;
  const iv = setInterval(() => {
    const order = store.getOrderById(orderId);
    if (!order || order.status === 'DELIVERED') { clearInterval(iv); activeSimulations.delete(orderId); return; }
    if (order.status === 'OUT_FOR_DELIVERY') {
      ticks++;
      const rest = store.getRestaurantById(order.restaurantId) || { latitude: 28.63, longitude: 77.21 };
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

  setTimeout(() => { clearInterval(iv); activeSimulations.delete(orderId); }, 45000);
}
