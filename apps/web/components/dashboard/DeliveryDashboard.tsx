import React, { useState, useEffect } from 'react';
import { 
  Order, 
  deliveryUpdateOrder, 
  getSocket 
} from '@/lib/api';
import { 
  Navigation, 
  Compass, 
  Gauge, 
  Wind, 
  Battery, 
  Clock, 
  CheckCircle2, 
  Radio, 
  Send, 
  Thermometer, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  Plane,
  BellRing,
  MapPin,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface DeliveryDashboardProps {
  orders: Order[];
  onOrderUpdated?: (order: Order) => void;
}

export const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ orders, onOrderUpdated }) => {
  const [activeOrder, setActiveOrder] = useState<Order | null>(orders[0] || null);
  const [speedKmh, setSpeedKmh] = useState<number>(activeOrder?.droneDetails?.speedKmh || 45);
  const [altitudeMeters, setAltitudeMeters] = useState<number>(activeOrder?.droneDetails?.altitudeMeters || 75);
  const [etaMins, setEtaMins] = useState<number>(activeOrder?.droneDetails?.etaMins || 14);
  const [shortestRouteDistanceKm, setShortestRouteDistanceKm] = useState<number>(activeOrder?.droneDetails?.shortestRouteDistanceKm || 3.2);
  const [pickupAlert, setPickupAlert] = useState<{ message: string; dish: string; restaurantName: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (orders.length > 0 && !activeOrder) {
      setActiveOrder(orders[0]);
      setSpeedKmh(orders[0].droneDetails?.speedKmh || 45);
      setAltitudeMeters(orders[0].droneDetails?.altitudeMeters || 75);
      setEtaMins(orders[0].droneDetails?.etaMins || 14);
      setShortestRouteDistanceKm(orders[0].droneDetails?.shortestRouteDistanceKm || 3.2);
    }
  }, [orders]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      // Listen for Chef's real-time pickup ready alert
      socket.on('delivery:pickup_alert', (data: any) => {
        setPickupAlert(data);
      });

      // Listen for order status updates
      socket.on('order:status_update', (updated: Order) => {
        if (activeOrder && updated.id === activeOrder.id) {
          setActiveOrder(updated);
        }
      });
    }
  }, [activeOrder]);

  const handleSelectOrder = (order: Order) => {
    setActiveOrder(order);
    setSpeedKmh(order.droneDetails?.speedKmh || 45);
    setAltitudeMeters(order.droneDetails?.altitudeMeters || 75);
    setEtaMins(order.droneDetails?.etaMins || 14);
    setShortestRouteDistanceKm(order.droneDetails?.shortestRouteDistanceKm || 3.2);
  };

  const handleUpdateFlightTelemetry = async () => {
    if (!activeOrder) return;
    setIsUpdating(true);
    try {
      const res = await deliveryUpdateOrder(activeOrder.id, {
        speedKmh,
        altitudeMeters,
        etaMins,
        shortestRouteDistanceKm,
        eta: `${etaMins} mins`
      });
      setActiveOrder(res);
      onOrderUpdated?.(res);
      setFeedbackMsg(`⚡ Drone flight telemetry synced! Speed: ${speedKmh} km/h • ETA: ${etaMins} mins`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLaunchDrone = async () => {
    if (!activeOrder) return;
    setIsUpdating(true);
    try {
      const res = await deliveryUpdateOrder(activeOrder.id, {
        speedKmh: Math.max(speedKmh, 50),
        altitudeMeters: Math.max(altitudeMeters, 85),
        flightStatus: 'airborne',
        etaMins: Math.max(5, etaMins - 3),
        eta: `${Math.max(5, etaMins - 3)} mins`
      });
      setActiveOrder(res);
      onOrderUpdated?.(res);
      setFeedbackMsg('🚀 3D Autonomous Drone Launched into Thermal Corridor!');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!activeOrder) return;
    setIsUpdating(true);
    try {
      const res = await deliveryUpdateOrder(activeOrder.id, {
        flightStatus: 'delivered',
        etaMins: 0,
        eta: 'Delivered'
      });
      setActiveOrder(res);
      onOrderUpdated?.(res);
      setFeedbackMsg('📦 Drone payload handed over to customer doorstep! Delivery complete.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Pilot Terminal Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-sky-950/80 via-zinc-900 to-indigo-950/80 border border-sky-500/30 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
                Airway Drone Cockpit
              </span>
              <span className="text-xs text-zinc-400">Strict Role: Drone Pilot & Delivery Operator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Autonomous Delivery Drone Fleet
            </h1>
            <p className="text-sm text-zinc-400">
              Control drone velocity, calculate shortest sky corridor, configure altitude & monitor thermal decay physics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 font-semibold">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>Fleet AI: DRONE-NETWORK ACTIVE</span>
        </div>
      </div>

      {/* Real-time Chef Ready Pickup Alert Banner */}
      {pickupAlert && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-zinc-900 border border-emerald-500/50 shadow-lg shadow-emerald-500/10 flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-bold">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Chef Dispatch Notification
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">{pickupAlert.message}</h4>
              <p className="text-xs text-zinc-300">
                Order for "{pickupAlert.dish}" is packed and ready for immediate drone hookup!
              </p>
            </div>
          </div>
          <button
            onClick={() => setPickupAlert(null)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition"
          >
            Acknowledge
          </button>
        </div>
      )}

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/40 text-sky-300 text-sm font-semibold flex items-center justify-between animate-fadeIn">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs underline text-sky-400">Dismiss</button>
        </div>
      )}

      {/* Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Delivery Orders */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-sky-400" />
              Delivery Payload Queue ({orders.length})
            </h2>
            <span className="text-xs text-zinc-400">Real-time GPS</span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800 text-zinc-400 text-sm">
                No active delivery missions assigned.
              </div>
            ) : (
              orders.map(order => {
                const isSelected = activeOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-sky-500/10 border-sky-500/60 shadow-lg shadow-sky-500/10' 
                        : 'bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono text-zinc-400">#{order.id.slice(-6)}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        order.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400' :
                        order.status === 'OUT_FOR_DELIVERY' ? 'bg-sky-500/20 text-sky-400 animate-pulse' :
                        order.status === 'QUALITY_CHECK' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm line-clamp-1">{order.dish}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Drop: {order.deliveryAddress}</p>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/60 text-xs">
                      <span className="text-sky-400 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        ETA: {order.droneDetails?.etaMins || 15} mins
                      </span>
                      <span className="text-orange-400 font-bold flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5" />
                        {order.telemetry.currentTemp}°C
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Drone Flight & Physics Flight Deck */}
        <div className="lg:col-span-8 space-y-6">
          {activeOrder ? (
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-6 shadow-xl">
              {/* Active Mission Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-950 text-sky-300 border border-sky-800">
                      DRONE ID: {activeOrder.droneDetails?.droneId || 'DR-402'}
                    </span>
                    <span className="text-xs text-zinc-400">Order #{activeOrder.id.slice(-6)}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {activeOrder.dish}
                  </h2>
                  <p className="text-xs text-sky-400 font-semibold mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Pickup: {activeOrder.restaurantName} ➔ Drop: {activeOrder.deliveryAddress}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {activeOrder.status !== 'OUT_FOR_DELIVERY' && activeOrder.status !== 'DELIVERED' && (
                    <button
                      onClick={handleLaunchDrone}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-sky-500/20 hover:scale-[1.02] transition"
                    >
                      <Plane className="w-4 h-4" />
                      Launch Drone!
                    </button>
                  )}

                  {activeOrder.status === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={handleMarkDelivered}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Delivery
                    </button>
                  )}

                  {activeOrder.status === 'DELIVERED' && (
                    <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      Mission Delivered
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Telemetry Physics Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block font-medium">Core Food Heat</span>
                  <div className="text-xl font-black text-orange-400 mt-1 flex items-center gap-1">
                    <Thermometer className="w-5 h-5" />
                    {activeOrder.telemetry.currentTemp}°C
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Decays by ~0.1°C - 0.2°C per interval
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block font-medium">Drone Airspeed</span>
                  <div className="text-xl font-black text-sky-400 mt-1 flex items-center gap-1">
                    <Gauge className="w-5 h-5" />
                    {speedKmh} km/h
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Vector throttle active
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block font-medium">Flight ETA</span>
                  <div className="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1">
                    <Clock className="w-5 h-5" />
                    {etaMins} mins
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Direct aerial vector
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block font-medium">Drone Battery</span>
                  <div className="text-xl font-black text-yellow-400 mt-1 flex items-center gap-1">
                    <Battery className="w-5 h-5" />
                    {activeOrder.telemetry.batteryLevel}%
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    LiFePO4 high-power cell
                  </span>
                </div>
              </div>

              {/* Drone Controls: Speed, ETA & Shortest Route */}
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-400" />
                  Flight Parameter Adjustments (Real Backend Synchronization)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Speed Adjustment */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                      <span className="text-zinc-300">Set Drone Speed:</span>
                      <span className="text-sky-400 font-mono">{speedKmh} km/h</span>
                    </div>
                    <input 
                      type="range"
                      min="25"
                      max="90"
                      value={speedKmh}
                      onChange={(e) => setSpeedKmh(parseInt(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                      <span>25 km/h (Eco)</span>
                      <span>60 km/h (Standard)</span>
                      <span>90 km/h (Max Throttle)</span>
                    </div>
                  </div>

                  {/* Flight Altitude Adjustment */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                      <span className="text-zinc-300">Flight Altitude:</span>
                      <span className="text-sky-400 font-mono">{altitudeMeters} meters</span>
                    </div>
                    <input 
                      type="range"
                      min="40"
                      max="150"
                      value={altitudeMeters}
                      onChange={(e) => setAltitudeMeters(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                      <span>40m (Low Urban)</span>
                      <span>80m (Optimal Sky Corridor)</span>
                      <span>150m (High Flyway)</span>
                    </div>
                  </div>

                  {/* ETA to Reach */}
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                      Time Taken to Reach (ETA in Minutes)
                    </label>
                    <input 
                      type="number"
                      min="1"
                      max="60"
                      value={etaMins}
                      onChange={(e) => setEtaMins(parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm font-bold focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  {/* Shortest Route Distance */}
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                      Shortest Aerial Route (Kilometers)
                    </label>
                    <input 
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="20"
                      value={shortestRouteDistanceKm}
                      onChange={(e) => setShortestRouteDistanceKm(parseFloat(e.target.value) || 3)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm font-bold focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleUpdateFlightTelemetry}
                    disabled={isUpdating}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Sync Speed & Shortest Route to Customer Dashboard
                  </button>
                </div>
              </div>

              {/* Shortest Airway Vector Visualizer */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white block">Shortest Sky Corridor Locked:</span>
                    <span className="text-zinc-400 font-mono">
                      Distance: {shortestRouteDistanceKm} km • Wind: 8 km/h NW • Air Temp: 27°C
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  OPTIMAL FLIGHT PATH
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-zinc-900/60 border border-zinc-800 text-zinc-400">
              Select an order from the queue to monitor drone telemetry and adjust speed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
