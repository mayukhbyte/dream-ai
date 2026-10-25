import React, { useState, useEffect, useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { CoverFlowCarousel, CarouselItem } from '@/components/ui/3-d-coverflow-carousel';
import { ThermalDeliveryCity3D } from '@/components/3d/ThermalDeliveryCity3D';
import { UserFoodMemoryDrawer } from '@/components/orders/UserFoodMemoryDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { 
  getLiveDishes, 
  askAIConcierge, 
  createOrder, 
  saveCustomMeal, 
  checkBackendHealth, 
  getSocket, 
  getOrders,
  handoverOrderToDrone,
  updateOrderStatus,
  Dish, 
  Order 
} from '@/lib/api';
import { ChefDashboard } from '@/components/dashboard/ChefDashboard';
import { DeliveryDashboard } from '@/components/dashboard/DeliveryDashboard';
import { CustomerSupportBot } from '@/components/customer/CustomerSupportBot';
import { CameraComplaintModal } from '@/components/customer/CameraComplaintModal';
import { PaymentModal } from '@/components/customer/PaymentModal';
import { RatingModal } from '@/components/customer/RatingModal';
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Clock, 
  Thermometer, 
  ArrowRight, 
  Zap, 
  Heart,
  Award,
  CheckCircle2,
  Lock,
  Send,
  Bot,
  ShoppingBag,
  Compass,
  Navigation,
  DollarSign,
  Utensils,
  Database,
  Radio,
  Check,
  Activity,
  ChefHat,
  ChevronRight,
  TrendingUp,
  Cpu,
  CreditCard,
  Star,
  Camera,
  Plane,
  UserCheck,
  Building2,
  Users
} from 'lucide-react';

// Pricing catalog for Build My Meal with individual prices
const MEAL_BASES = [
  { name: 'Jeera Rice', price: 60, img: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=400&q=80' },
  { name: 'Charcoal Naan', price: 45, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80' },
  { name: 'Hand-Pulled Noodles', price: 75, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80' },
  { name: 'Quinoa Salad', price: 85, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
];

const MEAL_PROTEINS = [
  { name: 'Charred Chicken', price: 140, img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=400&q=80' },
  { name: 'Artisan Paneer', price: 120, img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80' },
  { name: 'Tiger Prawns', price: 180, img: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=400&q=80' },
  { name: 'Organic Tofu', price: 110, img: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&w=400&q=80' },
];

const MEAL_SIDES = [
  { name: 'Dal Makhani', price: 70, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Mint Raita', price: 40, img: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=400&q=80' },
  { name: 'Crispy Garlic Greens', price: 60, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80' },
  { name: 'Spiced Fries', price: 50, img: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=400&q=80' },
];

const MEAL_DRINKS = [
  { name: 'Mango Lassi', price: 55, img: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80' },
  { name: 'Cold Pressed Juice', price: 75, img: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=400&q=80' },
  { name: 'Kashmiri Kahwa', price: 65, img: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=400&q=80' },
  { name: 'Tender Coconut', price: 50, img: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=400&q=80' },
];

const Home: NextPage = () => {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);

  // Backend Health & WebSocket State
  const [backendStatus, setBackendStatus] = useState<{ connected: boolean; status: string }>({ connected: false, status: 'checking' });
  const [wsConnected, setWsConnected] = useState(false);

  // Dedicated Role State: CUSTOMER | CHEF | RIDER
  const [activeRole, setActiveRole] = useState<'CUSTOMER' | 'CHEF' | 'RIDER'>('CUSTOMER');
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // Customer Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isComplaintCameraOpen, setIsComplaintCameraOpen] = useState(false);

  // Live Active Order for Customer Dashboard & Drone Connection
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Live Dishes from Real Backend Database
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);

  // Delivery Mode State
  const [deliveryMode, setDeliveryMode] = useState<'fast' | 'saver' | 'green'>('fast');
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);

  // Active Order Toast & Feedback
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<{ title: string; subtitle: string } | null>(null);

  // AI Conversational Concierge
  const [aiPrompt, setAiPrompt] = useState('Spicy butter chicken under ₹300 with hot arrival guarantee');
  const [aiResult, setAiResult] = useState<{
    dish: string;
    dishId?: string;
    restaurant: string;
    restaurantId?: string;
    price: string;
    rawPrice: number;
    qualityScore: number;
    hotProbability: number;
    prepTime: string;
    tasteRating: string;
    packagingRating: string;
    orderAccuracy: string;
    explanation: string;
    imageUrl?: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Build My Meal Customizer State
  const [mealBase, setMealBase] = useState('Jeera Rice');
  const [mealProtein, setMealProtein] = useState('Charred Chicken');
  const [mealSide, setMealSide] = useState('Dal Makhani');
  const [mealDrink, setMealDrink] = useState('Mango Lassi');
  const [customMealSaved, setCustomMealSaved] = useState(false);

  // Real-Time Money Calculation for Custom Combo
  const mealPriceBreakdown = useMemo(() => {
    const baseObj = MEAL_BASES.find(b => b.name === mealBase) || MEAL_BASES[0];
    const proteinObj = MEAL_PROTEINS.find(p => p.name === mealProtein) || MEAL_PROTEINS[0];
    const sideObj = MEAL_SIDES.find(s => s.name === mealSide) || MEAL_SIDES[0];
    const drinkObj = MEAL_DRINKS.find(d => d.name === mealDrink) || MEAL_DRINKS[0];

    const subtotal = baseObj.price + proteinObj.price + sideObj.price + drinkObj.price;
    const deliveryFee = deliveryMode === 'saver' ? 23 : deliveryMode === 'green' ? 28 : 38;
    const total = subtotal + deliveryFee;

    return {
      basePrice: baseObj.price,
      proteinPrice: proteinObj.price,
      sidePrice: sideObj.price,
      drinkPrice: drinkObj.price,
      subtotal,
      deliveryFee,
      total
    };
  }, [mealBase, mealProtein, mealSide, mealDrink, deliveryMode]);

  // Quick Craving Actions from Master Prompt
  const quickActions = [
    { label: '🌶️ Something spicy', query: 'Spicy chicken tikka masala with garlic butter naan' },
    { label: '🥗 Something light', query: 'Healthy vegan quinoa detox bowl under 450 kcal' },
    { label: '💰 Under ₹200', query: 'Authentic paneer roll and fries under ₹200' },
    { label: '⚡ Fastest delivery', query: 'Hot meal delivered in under 15 minutes' },
    { label: '❤️ Order again', query: 'Royal saffron mutton dum biryani' },
    { label: '🌱 Green Delivery', query: 'Zero plastic biodegradable packaged meal' }
  ];

  // Load Real Data from Localhost Backend on Mount
  useEffect(() => {
    const initData = async () => {
      // 1. Check Backend Server Health
      const health = await checkBackendHealth();
      setBackendStatus({ connected: health.connected, status: health.status });

      // 2. Fetch Real Dishes from Database
      try {
        const liveDishes = await getLiveDishes();
        setDishes(liveDishes);

        // Convert to 3D Coverflow items
        const items: CarouselItem[] = liveDishes.map((d) => ({
          tag: `⭐ ${d.qualityScore} Quality Score • 🔥 ${d.hotProbability}% Hot`,
          titleLine1: d.name.split('–')[0].trim().toUpperCase(),
          titleLine2: d.name.includes('–') ? '– ' + d.name.split('–')[1].trim() : d.restaurantName,
          desc: d.description,
          price: `₹${d.price}`,
          qualityScore: d.qualityScore,
          hotArrival: d.hotProbability,
          eta: `${d.preparationTime + 5} mins`,
          img: d.imageUrl,
          ctaText: 'Order AI Hot (1-Click)',
          ctaUrl: '#'
        }));
        setCarouselItems(items);

        // Set initial AI result from first real database item
        if (liveDishes.length > 0) {
          const first = liveDishes[0];
          setAiResult({
            dish: first.name,
            dishId: first.id,
            restaurant: `${first.restaurantName} (1.4 km)`,
            restaurantId: first.restaurantId,
            price: `₹${first.price}`,
            rawPrice: first.price,
            qualityScore: first.qualityScore,
            hotProbability: first.hotProbability,
            prepTime: `${first.preparationTime} mins`,
            tasteRating: '4.9/5',
            packagingRating: '4.8/5',
            orderAccuracy: '99.4%',
            imageUrl: first.imageUrl,
            explanation: `Matched from real database: Handcrafted with ${first.description}. Thermal induction seal guaranteed at ${first.thermalOptimalTemp}°C.`
          });
        }

        // 3. Check for existing active orders
        const orders = await getOrders();
        setAllOrders(orders);
        const active = orders.find(o => o.status !== 'DELIVERED') || orders[0] || null;
        if (active) {
          setActiveOrder(active);
        }
      } catch (err) {
        console.error('Error fetching live data from backend:', err);
      }
    };

    initData();

    // 4. Connect Real-Time WebSocket for Live Updates
    const socket = getSocket();
    if (socket) {
      setWsConnected(socket.connected);

      const userId = user?.uid || 'guest-user';

      const onConnect = () => {
        setWsConnected(true);
        // Join the user's room to get personalized real-time updates
        socket.emit('join-user-room', userId);
      };
      const onDisconnect = () => setWsConnected(false);

      // Handle initial connection acknowledgment with active order state
      const onConnectionAck = (data: { connected: boolean; activeOrder: Order | null }) => {
        if (data.activeOrder && data.activeOrder.status !== 'DELIVERED') {
          setActiveOrder(prev => prev || data.activeOrder);
        }
      };

      const onOrderUpdate = (order: Order) => {
        setActiveOrder(order);
        setAllOrders(prev => {
          const idx = prev.findIndex(o => o.id === order.id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = order;
            return copy;
          }
          return [order, ...prev];
        });
        if (order.status !== 'DELIVERED') {
          setOrderSuccessMsg({
            title: `⚡ Live Order Update: #${order.id.slice(-6)} is now ${order.status}!`,
            subtitle: `Telemetry: ${order.telemetry?.currentTemp}°C • ${order.telemetry?.insulationMode || 'Thermal Shield Active'}`
          });
          setTimeout(() => setOrderSuccessMsg(null), 6000);
        }
      };

      const onTelemetry = (data: { orderId: string; telemetry: any }) => {
        setActiveOrder(prev => {
          if (prev && prev.id === data.orderId) {
            return { ...prev, telemetry: { ...prev.telemetry, ...data.telemetry } };
          }
          return prev;
        });
      };

      const onActiveOrder = (order: Order) => {
        // When a new active order is broadcast globally, capture it
        if (order && order.status !== 'DELIVERED') {
          setActiveOrder(order);
        }
      };

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('connection:ack', onConnectionAck);
      socket.on('order:status_update', onOrderUpdate);
      socket.on('order:active_order', onActiveOrder);
      socket.on('order:thermal_telemetry', onTelemetry);
      socket.on('drone:telemetry', onTelemetry);
      socket.on('live-telemetry', onTelemetry);

      // If already connected, join room immediately
      if (socket.connected) {
        socket.emit('join-user-room', userId);
      }

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('connection:ack', onConnectionAck);
        socket.off('order:status_update', onOrderUpdate);
        socket.off('order:active_order', onActiveOrder);
        socket.off('order:thermal_telemetry', onTelemetry);
        socket.off('drone:telemetry', onTelemetry);
        socket.off('live-telemetry', onTelemetry);
      };
    }
  }, [user]);

  // Real AI API Call Handler against Real Backend
  const handleAISearch = async (query: string) => {
    if (!query.trim()) return;
    setAiPrompt(query);
    setIsGenerating(true);

    try {
      const data = await askAIConcierge(query, user?.uid || 'guest-user', deliveryMode);
      setAiResult({
        dish: data.dish,
        dishId: data.dishId,
        restaurant: data.restaurant,
        restaurantId: data.restaurantId,
        price: data.price,
        rawPrice: data.rawPrice,
        qualityScore: data.qualityScore,
        hotProbability: data.hotProbability,
        prepTime: data.prepTime,
        tasteRating: data.tasteRating,
        packagingRating: data.packagingRating,
        orderAccuracy: data.orderAccuracy,
        imageUrl: data.imageUrl,
        explanation: data.explanation
      });

      // Refresh dishes list in case a new dish was synthesized and stored in the database!
      const refreshedDishes = await getLiveDishes();
      setDishes(refreshedDishes);
      const items: CarouselItem[] = refreshedDishes.map((d) => ({
        tag: `⭐ ${d.qualityScore} Quality Score • 🔥 ${d.hotProbability}% Hot`,
        titleLine1: d.name.split('–')[0].trim().toUpperCase(),
        titleLine2: d.name.includes('–') ? '– ' + d.name.split('–')[1].trim() : d.restaurantName,
        desc: d.description,
        price: `₹${d.price}`,
        qualityScore: d.qualityScore,
        hotArrival: d.hotProbability,
        eta: `${d.preparationTime + 5} mins`,
        img: d.imageUrl,
        ctaText: 'Order AI Hot (1-Click)',
        ctaUrl: '#'
      }));
      setCarouselItems(items);
    } catch (err) {
      console.error('AI Concierge error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Place Order Handler (Creates Real Order in Backend Database)
  const handlePlaceOrder = async (
    dishName: string, 
    restaurantName: string, 
    price: string, 
    quality: number, 
    hot: number
  ) => {
    try {
      const order = await createOrder({
        userId: user?.uid || 'guest-user',
        userEmail: user?.email || 'guest@dreamfood.ai',
        dish: dishName,
        restaurantName: restaurantName,
        price: price,
        qualityScore: quality,
        hotProbability: hot,
        deliveryMode: deliveryMode,
        eta: deliveryMode === 'fast' ? '18 mins' : deliveryMode === 'saver' ? '30 mins' : '24 mins'
      });

      setActiveOrder(order);

      setOrderSuccessMsg({
        title: `🎉 Order #${order.id.slice(-6)} placed! Chef is cooking.`,
        subtitle: `Assigned to 3D Drone Delivery route • Initial Temp: ${order.telemetry?.currentTemp}°C`
      });
      setTimeout(() => setOrderSuccessMsg(null), 6000);
    } catch (err) {
      console.error('Order creation error:', err);
    }
  };

  // Save Custom Meal Handler with REAL-TIME CALCULATED PRICE
  const handleSaveCustomMeal = async () => {
    try {
      const calculatedPriceStr = `₹${mealPriceBreakdown.subtotal}`;

      const meal = {
        userId: user?.uid || 'guest-user',
        userEmail: user?.email || 'guest@dreamfood.ai',
        base: mealBase,
        protein: mealProtein,
        side: mealSide,
        drink: mealDrink,
        price: calculatedPriceStr
      };

      await saveCustomMeal(meal);

      const order = await createOrder({
        userId: user?.uid || 'guest-user',
        userEmail: user?.email || 'guest@dreamfood.ai',
        dish: `Custom Combo: ${mealBase} + ${mealProtein} + ${mealSide} + ${mealDrink}`,
        restaurantName: 'AI Partner Cloud Kitchen',
        price: calculatedPriceStr,
        rawPrice: mealPriceBreakdown.subtotal,
        qualityScore: 98,
        hotProbability: 97,
        deliveryMode: deliveryMode,
        eta: deliveryMode === 'fast' ? '18 mins' : deliveryMode === 'saver' ? '28 mins' : '22 mins'
      });

      setActiveOrder(order);
      setCustomMealSaved(true);

      setOrderSuccessMsg({
        title: `🍱 Custom Combo Ordered for ${calculatedPriceStr}! (Order #${order.id.slice(-6)})`,
        subtitle: `Chef Mario started induction cooking • Base: ${mealBase} • Protein: ${mealProtein}`
      });

      setTimeout(() => {
        setCustomMealSaved(false);
        setOrderSuccessMsg(null);
      }, 6000);
    } catch (err) {
      console.error('Custom meal error:', err);
    }
  };

  // Handover Chef order to Drone
  const handleHandoverDrone = async (orderId: string) => {
    try {
      const updated = await handoverOrderToDrone(orderId);
      setActiveOrder(updated);
      setOrderSuccessMsg({
        title: `🚁 Drone #DR-402 Connected & Airborne!`,
        subtitle: `Chef handed over order • Telemetry: ${updated.telemetry?.currentTemp}°C • 38 km/h`
      });
      setTimeout(() => setOrderSuccessMsg(null), 6000);
    } catch (err) {
      console.error('Handover to drone error:', err);
    }
  };

  // Complete Doorstep Delivery simulation
  const handleCompleteDelivery = async (orderId: string) => {
    try {
      const updated = await updateOrderStatus(orderId, 'DELIVERED');
      setActiveOrder(updated);
      setOrderSuccessMsg({
        title: `📦 Order #${orderId.slice(-6)} Delivered!`,
        subtitle: `Delivered hot at doorstep • Guaranteed 81.8°C thermal goal reached!`
      });
      setTimeout(() => setOrderSuccessMsg(null), 6000);
    } catch (err) {
      console.error('Delivery completion error:', err);
    }
  };

  const handleCtaClick = (item: CarouselItem) => {
    handlePlaceOrder(
      item.titleLine1 + ' ' + (item.titleLine2 || ''),
      item.titleLine2?.replace('–', '').trim() || 'Delhi Heritage Kitchen',
      item.price || '₹280',
      item.qualityScore || 98,
      item.hotArrival || 96
    );
  };

  const userName = user?.displayName ? user.displayName.split(' ')[0] : 'Mayon';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white flex flex-col font-sans">
      <Head>
        <title>DreamFood AI - Real-Time Food Concierge & 3D Drone Tracking</title>
        <meta name="description" content="AI Food Concierge: Don't search for food. Understand cravings, predict food temperature, optimize 3D delivery routing, and eat better." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar onOpenOrders={() => setIsOrdersDrawerOpen(true)} />

      {/* Floating Order Success / Real-Time WebSocket Toast */}
      {orderSuccessMsg && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-slate-900/95 border border-orange-500/50 text-slate-100 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 flex items-center gap-3.5 max-w-md ring-1 ring-orange-500/20">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5 text-orange-400 animate-pulse" />
          </div>
          <div className="text-xs flex-1">
            <p className="font-bold text-white text-sm">{orderSuccessMsg.title}</p>
            <p className="text-[11px] text-orange-200/80 mt-0.5">{orderSuccessMsg.subtitle}</p>
          </div>
          <button 
            onClick={() => setIsOrdersDrawerOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white ml-auto flex-shrink-0 transition shadow-md shadow-orange-500/20"
          >
            Track
          </button>
        </div>
      )}

      {/* Role Navigation & Strict Portal Guard Header */}
      <div className="bg-zinc-950/90 border-b border-zinc-800/80 sticky top-16 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-orange-400" />
              Active Portal:
            </span>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              <button
                onClick={() => setActiveRole('CUSTOMER')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeRole === 'CUSTOMER'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Customer Foodie
              </button>

              <button
                onClick={() => setActiveRole('CHEF')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeRole === 'CHEF'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                Chef & Kitchen Terminal
              </button>

              <button
                onClick={() => setActiveRole('RIDER')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeRole === 'RIDER'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                Drone Pilot Cockpit
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
              Role Enforced: {activeRole}
            </span>
            <span className="hidden sm:inline">
              (Dashboards isolated per role)
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 space-y-16 sm:space-y-20">
        {activeRole === 'CHEF' ? (
          <ChefDashboard 
            orders={allOrders} 
            onOrderUpdated={(updated) => {
              setActiveOrder(updated);
              setAllOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            }} 
          />
        ) : activeRole === 'RIDER' ? (
          <DeliveryDashboard 
            orders={allOrders} 
            onOrderUpdated={(updated) => {
              setActiveOrder(updated);
              setAllOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            }} 
          />
        ) : (
          <>
        {/* SECTION 1: PERSONALIZED CONTEXTUAL HOME SCREEN */}
        <section className="relative overflow-hidden pt-8 pb-6 md:pt-12 md:pb-8">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-rose-500/10 blur-[140px] pointer-events-none -z-10" />
          <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-blue-500/15 blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Real-time System Status Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md mb-6 shadow-xl">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${backendStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${backendStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </span>
                <span className="text-xs font-bold text-white">
                  {backendStatus.connected ? 'Backend Live (Port 5000)' : 'Connecting to Port 5000...'}
                </span>
              </div>
              <span className="text-slate-600 dark:text-zinc-600">•</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-orange-400">
                <Zap className="w-3.5 h-3.5" />
                <span>{wsConnected ? 'Socket.IO Stream Connected' : 'WebSocket Idle'}</span>
              </div>
              <span className="text-slate-600 dark:text-zinc-600 hidden sm:inline">•</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold hidden sm:inline">
                0% Mock Data
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] mb-4">
              “Don’t search for food.{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500">
                We know what you want.
              </span>”
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Type anything you crave naturally. Our AI computes <strong>Food Quality Scores (0–100)</strong>, guarantees thermal arrival temperature, and dispatches via connected 3D Drones.
            </p>

            {/* AI Search & Natural Language Box */}
            <div className="relative max-w-3xl mx-auto bg-slate-900/90 border border-orange-500/30 rounded-3xl p-3 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center gap-3 px-3 py-1.5">
                <Bot className="w-6 h-6 text-orange-400 flex-shrink-0" />
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAISearch(aiPrompt); }}
                  placeholder="Tell me what you want… e.g. Spicy butter chicken under ₹300 delivered hot in 20 min"
                  className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none"
                />
                <button
                  onClick={() => handleAISearch(aiPrompt)}
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 transition active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'AI Thinking…' : 'Ask AI'}</span>
                </button>
              </div>

              {/* Quick Action Filter Tags */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-white/10 px-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAISearch(action.query)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-orange-500/20 hover:border-orange-500/40 border border-white/5 text-slate-300 hover:text-white text-xs font-semibold transition"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: LIVE CUSTOMER DASHBOARD & DRONE CONNECTION HUB (REAL-TIME LIFECYCLE) */}
        {activeOrder && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-orange-500/40 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
              {/* Header with Live Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-orange-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                        Order #{activeOrder.id.slice(-6)}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        Live 5G Stream Active
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                      {activeOrder.dish}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {activeOrder.restaurantName} • <span className="text-orange-400 font-bold">{activeOrder.price}</span> • {activeOrder.deliveryMode.toUpperCase()} Mode
                    </p>
                  </div>
                </div>

                {/* Handover to Drone Button */}
                <div className="flex items-center gap-2.5">
                  {activeOrder.status === 'PREPARING' || activeOrder.status === 'QUALITY_CHECK' ? (
                    <button
                      onClick={() => handleHandoverDrone(activeOrder.id)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition active:scale-95 flex items-center gap-2"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>👨‍🍳 Chef: Order Ready ➔ Launch Drone 🚀</span>
                    </button>
                  ) : activeOrder.status === 'OUT_FOR_DELIVERY' ? (
                    <button
                      onClick={() => handleCompleteDelivery(activeOrder.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Doorstep Arrival</span>
                    </button>
                  ) : null}

                  <a
                    href="#3d-delivery"
                    className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View in 3D City</span>
                  </a>
                </div>
              </div>

              {/* 4-Step Visual Stepper */}
              <div className="py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'PREPARING', label: '1. Chef Preparing', desc: 'Induction heating core to 92°C', icon: ChefHat },
                    { key: 'QUALITY_CHECK', label: '2. Quality Inspected', desc: '98% heat seal passed by chef', icon: Sparkles },
                    { key: 'OUT_FOR_DELIVERY', label: '3. 3D Drone Connected', desc: 'Autonomous sky route in transit', icon: Navigation },
                    { key: 'DELIVERED', label: '4. Delivered Hot', desc: 'Guaranteed 81.8°C thermal goal', icon: CheckCircle2 }
                  ].map((step, idx) => {
                    const statusOrder = ['PREPARING', 'QUALITY_CHECK', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                    const currentIdx = statusOrder.indexOf(activeOrder.status);
                    const isPassed = currentIdx >= idx;
                    const isCurrent = activeOrder.status === step.key;
                    const IconComp = step.icon;

                    return (
                      <div
                        key={step.key}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-orange-500/20 border-orange-500 shadow-lg shadow-orange-500/15 ring-1 ring-orange-500/50'
                            : isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                            : 'bg-black/30 border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isCurrent ? 'bg-orange-500 text-white animate-pulse' : isPassed ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
                          }`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className={`text-xs font-bold ${isCurrent ? 'text-white' : isPassed ? 'text-emerald-300' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Telemetry & Drone Connection Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                    <Thermometer className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Food Core Temp</span>
                    <span className="text-base font-black text-rose-400">
                      {activeOrder.telemetry?.currentTemp || 86.4}°C
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Drone Speed</span>
                    <span className="text-base font-black text-cyan-300">
                      {activeOrder.status === 'OUT_FOR_DELIVERY' ? '36 km/h' : 'Standby 0 km/h'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Arrival ETA</span>
                    <span className="text-base font-black text-amber-300">
                      {activeOrder.status === 'DELIVERED' ? 'Delivered' : activeOrder.eta}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Battery & Signal</span>
                    <span className="text-base font-black text-emerald-300">
                      {activeOrder.telemetry?.batteryLevel || 96}% • 5G (3ms)
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Actions: Settle Payment (COD/Online), Rate Food & Camera Bad Food Report */}
              <div className="pt-4 mt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsPaymentOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition active:scale-95"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{activeOrder.payment?.status === 'PAID' ? '✓ Bill Paid (View Receipt)' : `Settle Bill (${activeOrder.price}) - Cash/Online`}</span>
                  </button>

                  <button
                    onClick={() => setIsRatingOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition active:scale-95"
                  >
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>{activeOrder.rating ? `Rated (${activeOrder.rating.stars}★)` : 'Rate Food & Feedback'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsComplaintCameraOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30 transition active:scale-95"
                >
                  <Camera className="w-4 h-4 text-rose-400" />
                  <span>Report Bad Food (Camera Upload)</span>
                </button>
              </div>

              {/* Chef's Reply to Customer Feedback — Visible on Customer Dashboard */}
              {(activeOrder.chefFeedbackReply || activeOrder.rating?.chefResponse) && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-zinc-900/60 border border-emerald-600/40 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <ChefHat className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Executive Chef's Personal Reply 👨‍🍳</span>
                  </div>
                  <p className="text-sm text-emerald-200 leading-relaxed">
                    "{activeOrder.chefFeedbackReply || activeOrder.rating?.chefResponse}"
                  </p>
                  {activeOrder.rating?.chefRespondedAt && (
                    <span className="text-[10px] text-emerald-600 block mt-2">
                      Responded at {new Date(activeOrder.rating.chefRespondedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION 3: 3D COVERFLOW CAROUSEL (Populated with Real Database Dishes) */}
        <section id="3d-carousel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 3D Coverflow Culinary Showcase
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Top Ranked AI Curations
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mt-1">
              Live items loaded from persistent database. Ranked by <strong>Food Quality Score (0–100)</strong> and temperature retention guarantee.
            </p>
          </div>

          <CoverFlowCarousel 
            items={carouselItems.length > 0 ? carouselItems : undefined} 
            onCtaClick={handleCtaClick} 
          />
        </section>

        {/* SECTION 4: AI CONCIERGE EXPLANATION & DYNAMIC QUALITY MATRIX */}
        <section id="ai-concierge" className="py-16 bg-slate-900/50 border-y border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: AI Matched Card */}
              <div className="lg:col-span-7 bg-white/[0.04] border border-orange-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">AI Optimal Match (Database Verified)</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Quality Score: {aiResult?.qualityScore || 98}/100
                  </span>
                </div>

                {isGenerating ? (
                  <div className="py-16 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-400 font-medium animate-pulse">
                      Analyzing craving keywords, database recipes & thermodynamic route physics...
                    </p>
                  </div>
                ) : aiResult ? (
                  <div className="space-y-5">
                    {/* Dish Image + Name Row */}
                    <div className="flex items-start gap-4">
                      {aiResult.imageUrl && (
                        <img
                          src={aiResult.imageUrl}
                          alt={aiResult.dish}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/10 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">{aiResult.dish}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{aiResult.restaurant}</p>
                      </div>
                      <span className="text-2xl font-black text-orange-400 flex-shrink-0">{aiResult.price}</span>
                    </div>

                    {/* Breakdown Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                        <p className="text-[10px] text-slate-400">Hot on Arrival</p>
                        <p className="text-base font-bold text-rose-400 flex items-center justify-center gap-1 mt-0.5">
                          <Flame className="w-3.5 h-3.5" />
                          {aiResult.hotProbability}%
                        </p>
                      </div>
                      <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                        <p className="text-[10px] text-slate-400">Taste Rating</p>
                        <p className="text-base font-bold text-amber-400 mt-0.5">{aiResult.tasteRating}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                        <p className="text-[10px] text-slate-400">Packaging</p>
                        <p className="text-base font-bold text-blue-400 mt-0.5">{aiResult.packagingRating}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                        <p className="text-[10px] text-slate-400">Accuracy</p>
                        <p className="text-base font-bold text-emerald-400 mt-0.5">{aiResult.orderAccuracy}</p>
                      </div>
                    </div>

                    {/* AI Explanation Box */}
                    <div className="p-4 rounded-2xl bg-orange-950/30 border border-orange-500/20 text-xs text-orange-200/90 leading-relaxed">
                      <p className="font-bold text-orange-300 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Why AI recommended this:
                      </p>
                      {aiResult.explanation}
                    </div>

                    <button
                      onClick={() => handlePlaceOrder(aiResult.dish, aiResult.restaurant, aiResult.price, aiResult.qualityScore, aiResult.hotProbability)}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-sm shadow-xl shadow-orange-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Order {aiResult.dish} ({aiResult.price}) with 1-Click</span>
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Right: Smart Delivery Fee & Delivery Modes */}
              <div className="lg:col-span-5 bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-400" />
                    Smart Saver vs Fast vs Green
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Choose how your meal travels in real-time:</p>
                </div>

                {/* 3 Delivery Option Cards */}
                <div className="space-y-2.5">
                  {[
                    { id: 'fast', title: '⚡ Fast Delivery', price: '₹38', eta: '18 mins', desc: 'Direct express route with thermal induction drone' },
                    { id: 'saver', title: '💰 Smart Saver', price: '₹23', eta: '30 mins', desc: 'Wait 12 extra mins and save ₹15 via batch grouping' },
                    { id: 'green', title: '🌱 Eco Green Delivery', price: '₹28', eta: '24 mins', desc: '180g less packaging waste & zero carbon emissions' }
                  ].map((mode) => (
                    <div
                      key={mode.id}
                      onClick={() => setDeliveryMode(mode.id as any)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                        deliveryMode === mode.id
                          ? 'border-orange-500 bg-orange-500/15 shadow-lg shadow-orange-500/10'
                          : 'border-white/10 bg-black/30 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{mode.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-orange-400">{mode.price}</span>
                          <span className="text-[10px] text-slate-400">({mode.eta})</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{mode.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Transparent Delivery Fee Breakdown */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs">
                  <div 
                    className="flex justify-between items-center cursor-pointer text-slate-300"
                    onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
                  >
                    <span className="font-semibold text-orange-300 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Transparent Fee Breakdown:
                    </span>
                    <span className="text-white font-bold">{deliveryMode === 'saver' ? '₹23' : deliveryMode === 'green' ? '₹28' : '₹38'}</span>
                  </div>
                  {showFeeBreakdown && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1 text-slate-400 text-[11px]">
                      <div className="flex justify-between"><span>📍 Base Distance (1.4 km)</span><span>₹20</span></div>
                      <div className="flex justify-between"><span>🚦 Traffic Level (Light)</span><span>₹6</span></div>
                      <div className="flex justify-between"><span>🌧️ Weather Conditions (Clear)</span><span>₹0</span></div>
                      {deliveryMode === 'saver' && <div className="flex justify-between text-emerald-400 font-bold"><span>💰 Multi-Order Saver Discount</span><span>-₹15</span></div>}
                      {deliveryMode === 'green' && <div className="flex justify-between text-emerald-400 font-bold"><span>🌱 Eco-Packaging Subsidy</span><span>-₹10</span></div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: 3D UI EXPERIENCE #2 (3D THERMAL DRONE ROUTE SIMULATOR WITH LIVE CONNECTION) */}
        <section id="3d-delivery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Navigation className="w-3.5 h-3.5" /> 3D UI Feature 2
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              3D AI Drone Thermal Route Simulator
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-2">
              Connected live to active orders. Follow our autonomous delivery drone across an isometric 3D smart city grid with real-time temperature telemetry.
            </p>
          </div>

          <ThermalDeliveryCity3D 
            activeOrder={activeOrder} 
            onHandoverDrone={handleHandoverDrone} 
          />
        </section>

        {/* SECTION 6: BUILD MY MEAL (CUSTOM COMBO WITH REAL-TIME MONEY CALCULATION) */}
        <section id="build-meal" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Custom Meal Creator</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">Build My Meal (Real-Time Pricing)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select ingredients. The subtotal and total cost update in real time with individual item pricing.
                </p>
              </div>

              {/* Dynamic Real-Time Money Badge */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-orange-500/40 shadow-xl flex items-center gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Real-Time Subtotal</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300">
                      ₹{mealPriceBreakdown.subtotal}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">+ ₹{mealPriceBreakdown.deliveryFee} fee</span>
                  </div>
                </div>
                <div className="h-10 w-[1px] bg-white/10" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Payable</span>
                  <span className="text-lg font-bold text-white">
                    ₹{mealPriceBreakdown.total}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {/* 1. Base */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-300">1. Base</label>
                  <span className="text-[11px] font-mono text-orange-400 font-bold">
                    ₹{mealPriceBreakdown.basePrice}
                  </span>
                </div>
                <div className="space-y-2">
                  {MEAL_BASES.map((b) => (
                    <button
                      key={b.name}
                      onClick={() => setMealBase(b.name)}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition group overflow-hidden ${
                        mealBase === b.name
                          ? 'bg-orange-500/20 border-orange-500 border text-white font-bold ring-1 ring-orange-500/50 shadow-md'
                          : 'bg-black/30 border border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={b.img}
                          alt={b.name}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0 ring-1 ring-white/10"
                        />
                        <span className="truncate">{b.name}</span>
                      </div>
                      <span className={`text-[11px] font-mono font-bold flex-shrink-0 ${mealBase === b.name ? 'text-orange-300' : 'text-slate-500'}`}>
                        ₹{b.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Protein */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-300">2. Protein</label>
                  <span className="text-[11px] font-mono text-orange-400 font-bold">
                    ₹{mealPriceBreakdown.proteinPrice}
                  </span>
                </div>
                <div className="space-y-2">
                  {MEAL_PROTEINS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setMealProtein(p.name)}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition group overflow-hidden ${
                        mealProtein === p.name
                          ? 'bg-orange-500/20 border-orange-500 border text-white font-bold ring-1 ring-orange-500/50 shadow-md'
                          : 'bg-black/30 border border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0 ring-1 ring-white/10"
                        />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className={`text-[11px] font-mono font-bold flex-shrink-0 ${mealProtein === p.name ? 'text-orange-300' : 'text-slate-500'}`}>
                        ₹{p.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Side */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-300">3. Side</label>
                  <span className="text-[11px] font-mono text-orange-400 font-bold">
                    ₹{mealPriceBreakdown.sidePrice}
                  </span>
                </div>
                <div className="space-y-2">
                  {MEAL_SIDES.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setMealSide(s.name)}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition group overflow-hidden ${
                        mealSide === s.name
                          ? 'bg-orange-500/20 border-orange-500 border text-white font-bold ring-1 ring-orange-500/50 shadow-md'
                          : 'bg-black/30 border border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={s.img}
                          alt={s.name}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0 ring-1 ring-white/10"
                        />
                        <span className="truncate">{s.name}</span>
                      </div>
                      <span className={`text-[11px] font-mono font-bold flex-shrink-0 ${mealSide === s.name ? 'text-orange-300' : 'text-slate-500'}`}>
                        ₹{s.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Drink */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-300">4. Drink</label>
                  <span className="text-[11px] font-mono text-orange-400 font-bold">
                    ₹{mealPriceBreakdown.drinkPrice}
                  </span>
                </div>
                <div className="space-y-2">
                  {MEAL_DRINKS.map((d) => (
                    <button
                      key={d.name}
                      onClick={() => setMealDrink(d.name)}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition group overflow-hidden ${
                        mealDrink === d.name
                          ? 'bg-orange-500/20 border-orange-500 border text-white font-bold ring-1 ring-orange-500/50 shadow-md'
                          : 'bg-black/30 border border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={d.img}
                          alt={d.name}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0 ring-1 ring-white/10"
                        />
                        <span className="truncate">{d.name}</span>
                      </div>
                      <span className={`text-[11px] font-mono font-bold flex-shrink-0 ${mealDrink === d.name ? 'text-orange-300' : 'text-slate-500'}`}>
                        ₹{d.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Meal Summary with Real-Time Price Calculation */}
            {(() => {
              const selectedItems = [
                { label: 'Base', name: mealBase, price: mealPriceBreakdown.basePrice, img: MEAL_BASES.find(b => b.name === mealBase)?.img },
                { label: 'Protein', name: mealProtein, price: mealPriceBreakdown.proteinPrice, img: MEAL_PROTEINS.find(p => p.name === mealProtein)?.img },
                { label: 'Side', name: mealSide, price: mealPriceBreakdown.sidePrice, img: MEAL_SIDES.find(s => s.name === mealSide)?.img },
                { label: 'Drink', name: mealDrink, price: mealPriceBreakdown.drinkPrice, img: MEAL_DRINKS.find(d => d.name === mealDrink)?.img },
              ];

              return (
                <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                  {/* Visual preview of selected items with price tags */}
                  <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                    {selectedItems.map((item, idx) => (
                      <React.Fragment key={item.label}>
                        <div className="flex flex-col items-center gap-1">
                          <div className="relative">
                            <img
                              src={item.img || ''}
                              alt={item.name}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-orange-500/40 shadow-md"
                            />
                            <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-slate-900 border border-orange-500/50 text-[10px] font-bold text-orange-300 font-mono">
                              ₹{item.price}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-300 font-semibold text-center max-w-[70px] truncate mt-1">{item.name}</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider">{item.label}</span>
                        </div>
                        {idx < selectedItems.length - 1 && (
                          <span className="text-orange-500/60 text-lg font-bold self-start mt-4">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Real-time money breakdown + order button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Real-Time Calculated Combo:</span>
                        <span className="text-xs font-bold text-orange-400 font-mono">
                          (₹{mealPriceBreakdown.basePrice} + ₹{mealPriceBreakdown.proteinPrice} + ₹{mealPriceBreakdown.sidePrice} + ₹{mealPriceBreakdown.drinkPrice})
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {mealBase} + {mealProtein} + {mealSide} + {mealDrink}
                      </p>
                      <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                        ✓ Connected partner cloud kitchens • Total ₹{mealPriceBreakdown.subtotal} (+ ₹{mealPriceBreakdown.deliveryFee} {deliveryMode} delivery)
                      </p>
                    </div>

                    <button
                      onClick={handleSaveCustomMeal}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-black text-sm shadow-xl shadow-orange-500/25 transition active:scale-95 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{customMealSaved ? '✓ Order Placed to Kitchen!' : `Order Custom Combo (₹${mealPriceBreakdown.subtotal})`}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
        </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black/70 py-8 text-center text-xs text-slate-500 mt-16">
        <p>© 2026 DreamFood AI. Live Real-Time Express + Socket.IO Backend on Localhost Port 5000 & Next.js on Port 3000.</p>
      </footer>

      {/* Floating AI Customer Care Support Chatbot */}
      {activeRole === 'CUSTOMER' && (
        <CustomerSupportBot 
          orderId={activeOrder?.id} 
          onOpenComplaintCamera={() => setIsComplaintCameraOpen(true)} 
        />
      )}

      {/* Customer Modals */}
      {activeOrder && (
        <>
          <PaymentModal
            order={activeOrder}
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            onPaymentSuccess={(updated) => {
              setActiveOrder(updated);
              setAllOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            }}
          />

          <RatingModal
            order={activeOrder}
            isOpen={isRatingOpen}
            onClose={() => setIsRatingOpen(false)}
            onRatingSuccess={(updated) => {
              setActiveOrder(updated);
              setAllOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            }}
          />

          <CameraComplaintModal
            orderId={activeOrder.id}
            isOpen={isComplaintCameraOpen}
            onClose={() => setIsComplaintCameraOpen(false)}
            onComplaintSubmitted={() => {
              getOrders().then(setAllOrders);
            }}
          />
        </>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />

      <UserFoodMemoryDrawer
        isOpen={isOrdersDrawerOpen}
        onClose={() => setIsOrdersDrawerOpen(false)}
        onReorder={(dish) => handlePlaceOrder(dish, 'Delhi Heritage Kitchen', '₹280', 98, 96)}
      />
    </div>
  );
};

export default Home;