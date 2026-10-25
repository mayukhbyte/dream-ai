import fs from 'fs';
import path from 'path';

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

export interface MenuItem {
  id: string;
  restaurantId: string;
  restaurantName?: string;
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

export type OrderStatus = 'PREPARING' | 'QUALITY_CHECK' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

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
  status: OrderStatus;
  createdAt: string;
  deliveryAddress: string;
  telemetry: OrderTelemetry;
  // Chef features
  preparationSteps?: PreparationStep[];
  chefInitialTemp?: number;
  chefNotes?: string;
  isReadyForPickup?: boolean;
  chefFeedbackReply?: string;
  // Delivery & Drone features
  droneDetails?: DroneDetails;
  // Payment & Rating features
  payment?: PaymentInfo;
  rating?: RatingInfo;
  // Quality & Complaints
  complaints?: FoodComplaint[];
}

export interface CustomMeal {
  id: string;
  userId: string;
  userEmail?: string;
  base: string;
  protein: string;
  side: string;
  drink: string;
  price: string;
  createdAt: string;
}

export interface FoodMemory {
  id: string;
  userId: string;
  query: string;
  matchedDish: string;
  qualityScore: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'RIDER' | 'ADMIN';
}

interface DatabaseSchema {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  customMeals: CustomMeal[];
  foodMemories: FoodMemory[];
  users: User[];
  complaints: FoodComplaint[];
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Moti Mahal Delights',
    description: 'Ancestral Mughlai hearth with 70-year old authentic butter chicken recipe & induction heated dispatch.',
    cuisineType: ['North Indian', 'Mughlai', 'Tandoor'],
    address: 'Connaught Place Outer Circle, New Delhi',
    latitude: 28.6315,
    longitude: 77.2167,
    rating: 4.9,
    qualityScore: 98,
    deliveryFee: 35,
    minOrderValue: 199,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    openingTime: '11:00',
    closingTime: '23:30',
    thermalPackType: 'Double-Walled Induction Sealed (90°C)'
  },
  {
    id: 'rest-2',
    name: 'Pure Botanica Hearth',
    description: 'Farm-to-fork organic culinary kitchen specializing in clay-roasted paneer, superfood bowls, and cold-pressed elixirs.',
    cuisineType: ['Healthy', 'Organic Vegan', 'Contemporary Indian'],
    address: 'Indiranagar 100ft Road, Bengaluru',
    latitude: 12.9784,
    longitude: 77.6408,
    rating: 4.8,
    qualityScore: 97,
    deliveryFee: 29,
    minOrderValue: 149,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    openingTime: '08:30',
    closingTime: '22:30',
    thermalPackType: 'Biodegradable Sugarcane Thermal Clamshell (85°C)'
  },
  {
    id: 'rest-3',
    name: 'Lucknowi Dum Nawaab',
    description: 'Authentic Awadhi dum pukht cooking in copper handis, slow-steamed with aromatic spices and saffron.',
    cuisineType: ['Awadhi', 'Biryani', 'Kebabs'],
    address: 'Hazratganj Palace Road, Lucknow',
    latitude: 26.8467,
    longitude: 80.9462,
    rating: 4.95,
    qualityScore: 99,
    deliveryFee: 40,
    minOrderValue: 249,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    openingTime: '12:00',
    closingTime: '23:00',
    thermalPackType: 'Clay Pot Sealed Dough Rim (94°C)'
  },
  {
    id: 'rest-4',
    name: 'Tokyo Umami Bowl',
    description: '18-hour simmered dashi & tonkotsu ramen with springy hand-pulled noodles and hot broth thermos separation.',
    cuisineType: ['Japanese', 'Ramen', 'Asian Bowls'],
    address: 'Bandra West, Mumbai',
    latitude: 19.0596,
    longitude: 72.8295,
    rating: 4.85,
    qualityScore: 96,
    deliveryFee: 45,
    minOrderValue: 299,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    openingTime: '11:30',
    closingTime: '23:00',
    thermalPackType: 'Dual-Chamber Vacuum Thermos (88°C)'
  },
  {
    id: 'rest-5',
    name: 'Artisan Woodfire Pizzeria',
    description: 'Napoli-style naturally leavened dough baked at 450°C in volcanic stone ovens with crisp crust ventilation.',
    cuisineType: ['Italian', 'Woodfire Pizza', 'Gourmet Pasta'],
    address: 'Jubilee Hills, Hyderabad',
    latitude: 17.4326,
    longitude: 78.4071,
    rating: 4.78,
    qualityScore: 95,
    deliveryFee: 30,
    minOrderValue: 250,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    openingTime: '12:00',
    closingTime: '00:00',
    thermalPackType: 'Corrugated Heat-Vented Thermal Shield (82°C)'
  }
];

const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dish-1',
    restaurantId: 'rest-1',
    restaurantName: 'Moti Mahal Delights',
    name: 'Smoked Spice Butter Chicken – Delhi Heritage',
    description: 'Charcoal-grilled tender chicken simmered in silky tomato-fenugreek reduction, sealed in dual-layer thermal vessel.',
    price: 280,
    category: 'Main Course',
    isVegetarian: false,
    isVegan: false,
    isSpicy: true,
    preparationTime: 18,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    thermalOptimalTemp: 89,
    qualityScore: 98,
    hotProbability: 97
  },
  {
    id: 'dish-2',
    restaurantId: 'rest-2',
    restaurantName: 'Pure Botanica Hearth',
    name: 'Clay Roasted Paneer Tikka & Jeera Bowl',
    description: 'Malai paneer marinated in stone-ground yellow mustard & Himalayan spices, paired with organic cumin grain.',
    price: 260,
    category: 'Bowls',
    isVegetarian: true,
    isVegan: false,
    isSpicy: false,
    preparationTime: 14,
    imageUrl: 'https://images.unsplash.com/photo-1567184109-7a54a9386c75?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    thermalOptimalTemp: 86,
    qualityScore: 97,
    hotProbability: 96
  },
  {
    id: 'dish-3',
    restaurantId: 'rest-3',
    restaurantName: 'Lucknowi Dum Nawaab',
    name: 'Royal Saffron Mutton Dum Biryani',
    description: 'Fragrant long-grain aged basmati layered with succulent goat cuts, cooked on slow glowing charcoal embers.',
    price: 360,
    category: 'Biryani',
    isVegetarian: false,
    isVegan: false,
    isSpicy: true,
    preparationTime: 22,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    thermalOptimalTemp: 92,
    qualityScore: 99,
    hotProbability: 98
  },
  {
    id: 'dish-4',
    restaurantId: 'rest-4',
    restaurantName: 'Tokyo Umami Bowl',
    name: 'Smoked Miso Shiitake Ramen',
    description: 'Rich roasted vegetable and kelp broth, artisanal wheat noodles, torched king oyster mushrooms, and bamboo shoots.',
    price: 320,
    category: 'Ramen',
    isVegetarian: true,
    isVegan: true,
    isSpicy: false,
    preparationTime: 16,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    thermalOptimalTemp: 88,
    qualityScore: 96,
    hotProbability: 95
  },
  {
    id: 'dish-5',
    restaurantId: 'rest-5',
    restaurantName: 'Artisan Woodfire Pizzeria',
    name: 'Truffle Burrata & Wild Mushroom Pizza',
    description: 'San Marzano DOP tomato sauce, fresh creamy pugliese burrata, sautéed porcini mushrooms, white truffle oil.',
    price: 390,
    category: 'Pizza',
    isVegetarian: true,
    isVegan: false,
    isSpicy: false,
    preparationTime: 15,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    thermalOptimalTemp: 84,
    qualityScore: 95,
    hotProbability: 94
  },
  {
    id: 'dish-6',
    restaurantId: 'rest-2',
    restaurantName: 'Pure Botanica Hearth',
    name: 'Avocado Detox Quinoa Crunch Bowl',
    description: 'Hass avocado slices, organic tri-color quinoa, roasted edamame, and cold-pressed citrus tahini glaze under 420 kcal.',
    price: 240,
    category: 'Healthy',
    isVegetarian: true,
    isVegan: true,
    isSpicy: false,
    preparationTime: 12,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    thermalOptimalTemp: 75,
    qualityScore: 98,
    hotProbability: 99
  },
  {
    id: 'dish-cold-drink-1',
    restaurantId: 'rest-1',
    restaurantName: 'Moti Mahal Delights',
    name: 'Chilled Coca-Cola Classic (330ml Can) – Official MRP: ₹40',
    description: 'Ice-cold at 4.0°C: Sealed 330ml can of original sparkling cola, dispatched at authentic retail MRP. Cryo-sleeve delivery preserves optimal carbonation.',
    price: 40,
    category: 'Beverages',
    isVegetarian: true,
    isVegan: true,
    isSpicy: false,
    preparationTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    thermalOptimalTemp: 4,
    qualityScore: 99,
    hotProbability: 99
  },
  {
    id: 'dish-cold-drink-2',
    restaurantId: 'rest-2',
    restaurantName: 'Pure Botanica Hearth',
    name: 'Ice-Cold Crisp Lemon Sprite (330ml Can) – Official MRP: ₹40',
    description: 'Chilled clear lemon-lime thirst quencher. Dispatched at official Maximum Retail Price (MRP). Cryo-insulated thermal pod holding cold.',
    price: 40,
    category: 'Beverages',
    isVegetarian: true,
    isVegan: true,
    isSpicy: false,
    preparationTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    thermalOptimalTemp: 4,
    qualityScore: 99,
    hotProbability: 99
  },
  {
    id: 'dish-cold-drink-3',
    restaurantId: 'rest-4',
    restaurantName: 'Tokyo Umami Bowl',
    name: 'Slow-Brewed Peach Iced Tea (350ml Bottle) – Retail MRP: ₹60',
    description: 'Black tea steeped with real peach extract and crushed mint, served ice chilled at official retail price.',
    price: 60,
    category: 'Beverages',
    isVegetarian: true,
    isVegan: true,
    isSpicy: false,
    preparationTime: 5,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    thermalOptimalTemp: 4,
    qualityScore: 98,
    hotProbability: 99
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const existingItemIds = new Set((parsed.menuItems || []).map((m: any) => m.id));
        const mergedItems = [...(parsed.menuItems || [])];
        for (const initItem of INITIAL_MENU_ITEMS) {
          if (!existingItemIds.has(initItem.id)) {
            mergedItems.push(initItem);
          }
        }

        return {
          restaurants: parsed.restaurants?.length ? parsed.restaurants : INITIAL_RESTAURANTS,
          menuItems: mergedItems.length ? mergedItems : INITIAL_MENU_ITEMS,
          orders: parsed.orders || [],
          customMeals: parsed.customMeals || [],
          foodMemories: parsed.foodMemories || [],
          users: parsed.users || [],
          complaints: parsed.complaints || []
        };
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing fresh store:', err);
    }

    const initial: DatabaseSchema = {
      restaurants: INITIAL_RESTAURANTS,
      menuItems: INITIAL_MENU_ITEMS,
      complaints: [],
      orders: [
        {
          id: 'ord_sample_1',
          userId: 'guest-user',
          userEmail: 'guest@dreamfood.ai',
          restaurantId: 'rest-1',
          restaurantName: 'Moti Mahal Delights',
          dish: 'Smoked Spice Butter Chicken – Delhi Heritage',
          price: '₹280',
          rawPrice: 280,
          qualityScore: 98,
          hotProbability: 97,
          deliveryMode: 'fast',
          eta: '18 mins',
          status: 'OUT_FOR_DELIVERY',
          createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          deliveryAddress: 'Greenwood Heights, 4th Floor',
          telemetry: {
            currentTemp: 84.8,
            targetTemp: 80.0,
            ambientTemp: 27.5,
            batteryLevel: 91,
            riderLat: 28.634,
            riderLng: 77.219,
            insulationMode: 'Thermal Induction Seal active (89.2°C initial)',
            lastUpdated: new Date().toISOString()
          }
        }
      ],
      customMeals: [],
      foodMemories: [
        {
          id: 'mem_1',
          userId: 'guest-user',
          query: 'Spicy butter chicken under ₹300 with hot arrival guarantee',
          matchedDish: 'Smoked Spice Butter Chicken – Delhi Heritage',
          qualityScore: 98,
          createdAt: new Date().toISOString()
        }
      ],
      users: [
        {
          id: 'guest-user',
          email: 'guest@dreamfood.ai',
          firstName: 'Guest',
          lastName: 'Foodie',
          role: 'CUSTOMER'
        }
      ]
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  public save() {
    this.saveData(this.data);
  }

  // --- Restaurants ---
  public getRestaurants(): Restaurant[] {
    return this.data.restaurants;
  }

  public getRestaurantById(id: string): (Restaurant & { menuItems: MenuItem[] }) | null {
    const rest = this.data.restaurants.find(r => r.id === id);
    if (!rest) return null;
    const items = this.data.menuItems.filter(m => m.restaurantId === id);
    return { ...rest, menuItems: items };
  }

  // --- Menu Items ---
  public getMenuItems(): MenuItem[] {
    return this.data.menuItems;
  }

  public getMenuItemById(id: string): MenuItem | null {
    return this.data.menuItems.find(m => m.id === id) || null;
  }

  public addMenuItem(item: MenuItem): MenuItem {
    const existing = this.data.menuItems.find(m => m.id === item.id || m.name.toLowerCase() === item.name.toLowerCase());
    if (existing) return existing;
    this.data.menuItems.push(item);
    this.save();
    return item;
  }

  // --- Orders ---
  public getOrders(userId?: string): Order[] {
    if (userId) {
      return this.data.orders.filter(o => o.userId === userId);
    }
    return this.data.orders;
  }

  public getOrderById(id: string): Order | null {
    return this.data.orders.find(o => o.id === id) || null;
  }

  public createOrder(order: Omit<Order, 'id' | 'createdAt' | 'telemetry'>): Order {
    const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date().toISOString(),
      chefInitialTemp: 91.5,
      isReadyForPickup: false,
      chefNotes: 'Induction vessel pre-heated. Organic spice crust applied.',
      preparationSteps: [
        {
          id: `step-${id}-1`,
          stepNumber: 1,
          title: 'Ingredient Selection & Mise en Place',
          description: 'Selecting premium farm-fresh ingredients and artisanal spices.',
          status: 'completed',
          completedAt: new Date().toISOString()
        },
        {
          id: `step-${id}-2`,
          stepNumber: 2,
          title: 'High-Heat Culinary Crafting',
          description: 'Sautéing and roasting in clay hearth to lock in aromatics.',
          status: 'in_progress'
        },
        {
          id: `step-${id}-3`,
          stepNumber: 3,
          title: 'Vacuum Induction Thermal Packaging',
          description: 'Sealing in double-wall thermal insulation at 91.5°C dispatch temp.',
          status: 'pending'
        },
        {
          id: `step-${id}-4`,
          stepNumber: 4,
          title: 'Thermal Quality Check & Ready for Drone',
          description: 'Final digital probe verification & dispatch readiness.',
          status: 'pending'
        }
      ],
      droneDetails: {
        droneId: 'DR-402',
        speedKmh: 42,
        altitudeMeters: 75,
        etaMins: 16,
        shortestRouteDistanceKm: 3.2,
        batteryPct: 98,
        flightStatus: 'standby',
        currentCoordinates: { lat: 28.6315, lng: 77.2167 }
      },
      payment: {
        method: 'ONLINE',
        status: 'PENDING',
        amount: order.rawPrice || 280
      },
      complaints: [],
      telemetry: {
        currentTemp: order.hotProbability > 90 ? 91.5 : 86.0,
        targetTemp: 78.0,
        ambientTemp: 26.5,
        batteryLevel: 98,
        riderLat: 28.6315 + (Math.random() - 0.5) * 0.01,
        riderLng: 77.2167 + (Math.random() - 0.5) * 0.01,
        insulationMode: order.deliveryMode === 'fast' 
          ? 'Thermal Induction Shield (Priority Drone/Rider)' 
          : order.deliveryMode === 'green'
          ? 'Zero-Emission Insulated Cargo Carrier'
          : 'Smart Multi-Stop Thermal Consolidation',
        lastUpdated: new Date().toISOString()
      }
    };

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  public updateOrderStatus(id: string, status: OrderStatus, telemetryUpdates?: Partial<OrderTelemetry>): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;

    order.status = status;
    if (telemetryUpdates) {
      order.telemetry = { ...order.telemetry, ...telemetryUpdates, lastUpdated: new Date().toISOString() };
    }
    this.save();
    return order;
  }

  // --- Chef Terminal Updates ---
  public updateOrderChef(id: string, updates: { 
    preparationSteps?: PreparationStep[]; 
    chefInitialTemp?: number; 
    chefNotes?: string; 
    isReadyForPickup?: boolean; 
  }): Order | null {
    const order = this.data.orders.find(o => o.id === id);
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
        order.telemetry.insulationMode = '👨‍🍳 Chef Order Ready: Passed Thermal Quality Gate. Awaiting Drone Pickup.';
      }
    }
    order.telemetry.lastUpdated = new Date().toISOString();
    this.save();
    return order;
  }

  // --- Delivery / Drone Pilot Updates ---
  public updateOrderDelivery(id: string, updates: Partial<DroneDetails> & { eta?: string }): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;

    if (!order.droneDetails) {
      order.droneDetails = {
        droneId: 'DR-402',
        speedKmh: 45,
        altitudeMeters: 75,
        etaMins: 15,
        shortestRouteDistanceKm: 3.2,
        batteryPct: 95,
        flightStatus: 'standby'
      };
    }

    Object.assign(order.droneDetails, updates);
    if (updates.eta) {
      order.eta = updates.eta;
    }
    if (updates.speedKmh) {
      order.telemetry.insulationMode = `🚁 Drone #${order.droneDetails.droneId} Airborne: Speed ${updates.speedKmh} km/h • Altitude ${order.droneDetails.altitudeMeters || 80}m`;
    }
    if (updates.flightStatus === 'airborne' && order.status !== 'OUT_FOR_DELIVERY') {
      order.status = 'OUT_FOR_DELIVERY';
    } else if (updates.flightStatus === 'delivered' && order.status !== 'DELIVERED') {
      order.status = 'DELIVERED';
    }

    order.telemetry.lastUpdated = new Date().toISOString();
    this.save();
    return order;
  }

  // --- Payment Submission ---
  public updateOrderPayment(id: string, payment: PaymentInfo): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;

    order.payment = {
      ...payment,
      paidAt: new Date().toISOString()
    };
    this.save();
    return order;
  }

  // --- Customer Rating & Feedback ---
  public updateOrderRating(id: string, rating: RatingInfo): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;

    order.rating = {
      ...rating,
      ratedAt: new Date().toISOString()
    };
    this.save();
    return order;
  }

  // --- Customer Bad Food Complaints with Camera Photos ---
  public addOrderComplaint(id: string, complaint: { customerMessage: string; photoUrl?: string }): FoodComplaint | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;

    const newComplaint: FoodComplaint = {
      id: `complaint_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId: id,
      customerMessage: complaint.customerMessage,
      photoUrl: complaint.photoUrl,
      createdAt: new Date().toISOString(),
      status: 'INVESTIGATING'
    };

    if (!order.complaints) order.complaints = [];
    order.complaints.unshift(newComplaint);

    if (!this.data.complaints) this.data.complaints = [];
    this.data.complaints.unshift(newComplaint);

    this.save();
    return newComplaint;
  }

  // --- Chef Feedback Reply ---
  public updateOrderChefFeedbackReply(id: string, reply: string): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;

    order.chefFeedbackReply = reply;
    if (order.rating) {
      order.rating.chefResponse = reply;
      order.rating.chefRespondedAt = new Date().toISOString();
    }
    if (order.complaints && order.complaints.length > 0) {
      for (const comp of order.complaints) {
        comp.chefResponse = reply;
        comp.status = 'RESOLVED';
      }
    }
    if (this.data.complaints) {
      for (const comp of this.data.complaints) {
        if (comp.orderId === id) {
          comp.chefResponse = reply;
          comp.status = 'RESOLVED';
        }
      }
    }

    this.save();
    return order;
  }

  public getAllComplaints(): FoodComplaint[] {
    return this.data.complaints || [];
  }

  // --- Custom Meals ---
  public saveCustomMeal(meal: Omit<CustomMeal, 'id' | 'createdAt'>): CustomMeal {
    const newMeal: CustomMeal = {
      ...meal,
      id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    this.data.customMeals.unshift(newMeal);
    this.save();
    return newMeal;
  }

  public getCustomMeals(userId?: string): CustomMeal[] {
    if (userId) {
      return this.data.customMeals.filter(m => m.userId === userId);
    }
    return this.data.customMeals;
  }

  // --- Food Memory ---
  public saveFoodMemory(memory: Omit<FoodMemory, 'id' | 'createdAt'>): FoodMemory {
    const newMem: FoodMemory = {
      ...memory,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    this.data.foodMemories.unshift(newMem);
    this.save();
    return newMem;
  }

  public getFoodMemories(userId?: string): FoodMemory[] {
    if (userId) {
      return this.data.foodMemories.filter(m => m.userId === userId);
    }
    return this.data.foodMemories;
  }

  // --- Users ---
  public getOrCreateUser(email: string, firstName?: string, lastName?: string): User {
    let user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email,
        firstName: firstName || 'Dream',
        lastName: lastName || 'Foodie',
        role: 'CUSTOMER'
      };
      this.data.users.push(user);
      this.save();
    }
    return user;
  }
}

export const db = new Database();
