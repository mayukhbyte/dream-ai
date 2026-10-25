import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getOrders, 
  updateOrderStatus, 
  getFoodMemories, 
  getSocket, 
  Order, 
  FoodMemoryRecord 
} from '@/lib/api';
import { getUserCustomMeals, CustomMealRecord } from '@/lib/supabase';
import { 
  X, 
  ShoppingBag, 
  Clock, 
  Flame, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  ArrowRight,
  Utensils,
  History,
  Zap,
  Navigation,
  Thermometer,
  Layers,
  ChevronRight
} from 'lucide-react';

interface UserFoodMemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReorder?: (dishName: string) => void;
}

export const UserFoodMemoryDrawer: React.FC<UserFoodMemoryDrawerProps> = ({ isOpen, onClose, onReorder }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'memory' | 'meals'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [memories, setMemories] = useState<FoodMemoryRecord[]>([]);
  const [customMeals, setCustomMeals] = useState<CustomMealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  const userId = user?.uid || 'guest-user';

  // Fetch initial data from backend API
  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedOrders, fetchedMemories, fetchedMeals] = await Promise.all([
        getOrders(userId),
        getFoodMemories(userId),
        getUserCustomMeals(userId)
      ]);
      setOrders(fetchedOrders);
      setMemories(fetchedMemories);
      setCustomMeals(fetchedMeals);
    } catch (err) {
      console.error('Error loading real-time data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadData();

    // Setup real-time Socket.io listener
    const socket = getSocket();
    if (socket) {
      setWsConnected(socket.connected);

      const handleConnect = () => setWsConnected(true);
      const handleDisconnect = () => setWsConnected(false);

      const handleOrderUpdate = (updatedOrder: Order) => {
        setOrders(prev => {
          const index = prev.findIndex(o => o.id === updatedOrder.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = updatedOrder;
            return next;
          } else {
            return [updatedOrder, ...prev];
          }
        });
      };

      const handleTelemetry = (data: { orderId: string; telemetry: any }) => {
        setOrders(prev => prev.map(o => {
          if (o.id === data.orderId) {
            return { ...o, telemetry: { ...o.telemetry, ...data.telemetry } };
          }
          return o;
        }));
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('order:status_update', handleOrderUpdate);
      socket.on('order:thermal_telemetry', handleTelemetry);
      socket.emit('join-user-room', userId);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('order:status_update', handleOrderUpdate);
        socket.off('order:thermal_telemetry', handleTelemetry);
      };
    }
  }, [isOpen, userId]);

  // Advance stage helper for testing and live lifecycle demonstration
  const handleAdvanceStage = async (orderId: string, currentStatus: Order['status']) => {
    const nextMap: Record<Order['status'], Order['status']> = {
      'PREPARING': 'QUALITY_CHECK',
      'QUALITY_CHECK': 'OUT_FOR_DELIVERY',
      'OUT_FOR_DELIVERY': 'DELIVERED',
      'DELIVERED': 'PREPARING'
    };
    const nextStatus = nextMap[currentStatus];
    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (err) {
      console.error('Failed to advance order status:', err);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PREPARING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
            <Clock className="w-3 h-3 text-amber-400" />
            Kitchen Induction Cooking
          </span>
        );
      case 'QUALITY_CHECK':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            AI Thermal Check Passed (98%)
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 animate-pulse">
            <Navigation className="w-3 h-3 text-cyan-400" />
            3D Route in Transit
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Delivered Hot & Fresh
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Live Real-Time Concierge</h2>
                <p className="text-[11px] text-slate-400">Zero-Mock Direct Localhost Backend</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Status Banner */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="font-semibold text-slate-200">
              {wsConnected ? 'Socket.IO Real-Time Stream (Port 5000)' : 'Connecting to ws://localhost:5000...'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
            Active: {orders.filter(o => o.status !== 'DELIVERED').length} Orders
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-slate-950/60 p-2 gap-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Active Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'memory'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Food Memory ({memories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'meals'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Custom Meals ({customMeals.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400">Syncing real-time orders from backend...</p>
            </div>
          ) : activeTab === 'orders' ? (
            orders.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <ShoppingBag className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">No Orders Yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
                  Select a dish from the 3D menu or ask the AI Concierge to place your first live thermal order!
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-lg shadow-orange-500/20"
                >
                  Explore 3D Menu
                </button>
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.id} 
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/40 transition space-y-4 relative overflow-hidden group shadow-lg"
                >
                  {/* Status & Live Indicators */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider block">
                        Order #{order.id.slice(-6)}
                      </span>
                      <h4 className="text-base font-bold text-white leading-tight mt-0.5">
                        {order.dish}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {order.restaurantName} • <span className="text-slate-200 font-semibold">{order.price}</span>
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Real-Time Live Telemetry Box */}
                  {order.telemetry && (
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-orange-300 font-bold">
                          <Thermometer className="w-4 h-4 text-orange-400 animate-pulse" />
                          <span>{order.telemetry.currentTemp}°C</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            (Target: {order.telemetry.targetTemp}°C)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>ETA: {order.eta}</span>
                        </div>
                      </div>

                      {/* Temperature Progress Visual */}
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(30, (order.telemetry.currentTemp / 90) * 100))}%` }}
                        />
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span className="truncate pr-2 text-slate-300">
                          🛡️ {order.telemetry.insulationMode}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 shrink-0">
                          Bat: {order.telemetry.batteryLevel}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Advance Stage button for instant live WebSocket testing */}
                      <button
                        onClick={() => handleAdvanceStage(order.id, order.status)}
                        className="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/20 text-[11px] font-bold transition flex items-center gap-1"
                        title="Simulate advancing real-time lifecycle on backend"
                      >
                        <Zap className="w-3 h-3 text-orange-400" />
                        <span>Advance Stage ⚡</span>
                      </button>

                      {onReorder && (
                        <button
                          onClick={() => onReorder(order.dish)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <span>Reorder</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : activeTab === 'memory' ? (
            memories.length === 0 ? (
              <div className="text-center py-16 px-4">
                <History className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No AI food memories recorded yet.</p>
              </div>
            ) : (
              memories.map((mem) => (
                <div key={mem.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-orange-400">Prompt Query</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(mem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white italic">"{mem.query}"</p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
                    <span>Matched: <strong>{mem.matchedDish}</strong></span>
                    <span className="text-amber-400 font-bold">★ {mem.qualityScore} Quality</span>
                  </div>
                </div>
              ))
            )
          ) : (
            customMeals.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Utensils className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No custom meal combinations saved yet.</p>
              </div>
            ) : (
              customMeals.map((meal) => (
                <div key={meal.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Custom Meal Build</span>
                    <span className="text-xs font-bold text-orange-400">{meal.price}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>Base: <span className="text-white font-medium">{meal.base}</span></div>
                    <div>Protein: <span className="text-white font-medium">{meal.protein}</span></div>
                    <div>Side: <span className="text-white font-medium">{meal.side}</span></div>
                    <div>Drink: <span className="text-white font-medium">{meal.drink}</span></div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
