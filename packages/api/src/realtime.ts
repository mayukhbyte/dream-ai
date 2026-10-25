import { Server } from 'socket.io';
import { db, Order, OrderStatus } from './db';

let ioInstance: Server | null = null;
const activeSimulations = new Map<string, NodeJS.Timeout[]>();

export function setupRealtime(io: Server) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('⚡ Socket client connected:', socket.id);

    // Initial state push with latest active order if any
    const allOrders = db.getOrders();
    const latestActive = allOrders.find(o => o.status !== 'DELIVERED') || allOrders[0] || null;

    socket.emit('connection:ack', {
      connected: true,
      timestamp: new Date().toISOString(),
      activeOrdersCount: allOrders.filter(o => o.status !== 'DELIVERED').length,
      activeOrder: latestActive
    });

    // Immediately push latest active order to this socket
    if (latestActive) {
      socket.emit('order:active_order', latestActive);
      socket.emit('order:status_update', latestActive);
    }

    socket.on('join-user-room', (userId: string) => {
      const room = `user-${userId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);

      // Immediately send this user's active orders
      const userOrders = db.getOrders(userId);
      const userActive = userOrders.find(o => o.status !== 'DELIVERED') || null;
      if (userActive) {
        socket.emit('order:active_order', userActive);
        socket.emit('order:status_update', userActive);
      }
    });

    socket.on('join-order-room', (orderId: string) => {
      const room = `order-${orderId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
      
      const order = db.getOrderById(orderId);
      if (order) {
        socket.emit('order:status_update', order);
      }
    });

    // Customer / Chef trigger handover to drone
    socket.on('chef:ready_handover', (orderId: string) => {
      handoverToDrone(orderId);
    });

    socket.on('disconnect', () => {
      console.log('Socket client disconnected:', socket.id);
    });
  });
}

export function broadcastOrderUpdate(order: Order) {
  if (!ioInstance) return;

  // Broadcast globally to all connected customer dashboards
  ioInstance.emit('order:status_update', order);
  ioInstance.emit('order:active_order', order);
  ioInstance.to(`order-${order.id}`).emit('order:status_update', order);
  ioInstance.to(`user-${order.userId}`).emit('order:status_update', order);
  ioInstance.to(`user-${order.userId}`).emit('order:active_order', order);
  ioInstance.emit('orders:list_update', {
    orderId: order.id,
    status: order.status,
    dish: order.dish,
    telemetry: order.telemetry,
    updatedAt: new Date().toISOString()
  });
}

export function broadcastTelemetry(orderId: string, telemetry: any) {
  if (!ioInstance) return;
  const payload = { orderId, telemetry };
  // Broadcast on ALL channels so all frontend listeners catch it
  ioInstance.emit('order:thermal_telemetry', payload);
  ioInstance.emit('drone:telemetry', payload);
  ioInstance.emit('live-telemetry', payload);
  ioInstance.to(`order-${orderId}`).emit('order:thermal_telemetry', payload);
}

/**
 * Manually or programmatically hand over order from Chef to Drone
 */
export function handoverToDrone(orderId: string): Order | null {
  const order = db.getOrderById(orderId);
  if (!order) return null;

  const updated = db.updateOrderStatus(orderId, 'OUT_FOR_DELIVERY', {
    currentTemp: 87.2,
    targetTemp: 80.0,
    ambientTemp: 27.0,
    batteryLevel: 96,
    riderLat: 28.6340,
    riderLng: 77.2185,
    insulationMode: '🚁 3D Drone #DR-402 Connected & Airborne • 38 km/h • 87.2°C',
    lastUpdated: new Date().toISOString()
  });

  if (updated) {
    broadcastOrderUpdate(updated);
    broadcastTelemetry(orderId, updated.telemetry);
  }
  return updated;
}

export function notifyDeliveryPickupReady(order: Order) {
  if (!ioInstance) return;
  ioInstance.emit('delivery:pickup_alert', {
    orderId: order.id,
    dish: order.dish,
    restaurantName: order.restaurantName,
    temperature: order.telemetry.currentTemp,
    pickupAddress: order.restaurantName,
    message: `👨‍🍳 Food is Ready! Chef completed "${order.dish}". Pick it up for drone dispatch!`,
    timestamp: new Date().toISOString()
  });
}

export function notifyChefComplaint(order: Order, complaint: any) {
  if (!ioInstance) return;
  ioInstance.emit('chef:complaint_alert', {
    orderId: order.id,
    dish: order.dish,
    customerMessage: complaint.customerMessage,
    photoUrl: complaint.photoUrl,
    createdAt: complaint.createdAt,
    message: `⚠️ Food Quality Issue: Customer uploaded camera photo for Order #${order.id.slice(-6)}`
  });
}

/**
 * Starts an automated live delivery telemetry simulation for placed orders
 */
export function startOrderLifecycleSimulation(orderId: string) {
  if (activeSimulations.has(orderId)) {
    const existing = activeSimulations.get(orderId)!;
    existing.forEach(t => clearTimeout(t));
  }

  const timers: NodeJS.Timeout[] = [];

  // Stage 1: Chef marks Ready & Quality Passed after 4 seconds
  const t1 = setTimeout(() => {
    const order = db.getOrderById(orderId);
    if (!order || order.status === 'DELIVERED') return;

    const initialT = order.chefInitialTemp || 91.5;
    const updated = db.updateOrderStatus(orderId, 'QUALITY_CHECK', {
      currentTemp: initialT,
      insulationMode: `👨‍🍳 Chef Order Ready: Passed Thermal Quality Inspection (${initialT}°C)`
    });
    if (updated) {
      updated.isReadyForPickup = true;
      if (updated.preparationSteps) {
        updated.preparationSteps.forEach(s => s.status = 'completed');
      }
      db.save();
      broadcastOrderUpdate(updated);
      broadcastTelemetry(orderId, updated.telemetry);
      notifyDeliveryPickupReady(updated);
    }
  }, 4000);
  timers.push(t1);

  // Stage 2: Handover to 3D Drone after 10 seconds
  const t2 = setTimeout(() => {
    const order = db.getOrderById(orderId);
    if (!order || order.status === 'DELIVERED') return;

    handoverToDrone(orderId);

    // Live Drone Telemetry stream ticks every 2.5 seconds
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
      const current = db.getOrderById(orderId);
      if (!current || current.status !== 'OUT_FOR_DELIVERY') {
        clearInterval(interval);
        return;
      }

      // Physics: temperature decreases by 0.1°C or 0.2°C per interval
      const decrement = (Math.random() < 0.5 ? 0.1 : 0.2);
      const newTemp = Math.max(76.0, parseFloat((current.telemetry.currentTemp - decrement).toFixed(1)));
      const newLat = 28.6340 + (tickCount * 0.0012);
      const newLng = 77.2185 + (tickCount * 0.0009);

      const updatedTelemetry = {
        currentTemp: newTemp,
        targetTemp: 80.0,
        ambientTemp: 27.0,
        batteryLevel: Math.max(82, 98 - tickCount),
        riderLat: newLat,
        riderLng: newLng,
        insulationMode: `🚁 Drone #DR-402 SkyRoute: Speed 44 km/h • Temp ${newTemp}°C (-${decrement}°C)`,
        lastUpdated: new Date().toISOString()
      };

      current.telemetry = updatedTelemetry;
      if (current.droneDetails) {
        current.droneDetails.speedKmh = 44 + (tickCount % 4);
        current.droneDetails.altitudeMeters = 78 + (tickCount % 5);
        current.droneDetails.etaMins = Math.max(2, (current.droneDetails.etaMins || 15) - 1);
        current.droneDetails.flightStatus = 'airborne';
      }
      db.save();
      broadcastTelemetry(orderId, updatedTelemetry);
      broadcastOrderUpdate(current);

      if (tickCount >= 12) {
        clearInterval(interval);
      }
    }, 2500);
  }, 10000);
  timers.push(t2);

  // Stage 3: Delivered after 35 seconds
  const t3 = setTimeout(() => {
    const order = db.getOrderById(orderId);
    if (!order || order.status === 'DELIVERED') return;

    const finalTemp = order.telemetry.currentTemp;
    const updated = db.updateOrderStatus(orderId, 'DELIVERED', {
      currentTemp: finalTemp,
      insulationMode: `📦 Delivered at Doorstep – Guaranteed Hot (${finalTemp}°C)`
    });
    if (updated) {
      if (updated.droneDetails) {
        updated.droneDetails.flightStatus = 'delivered';
        updated.droneDetails.etaMins = 0;
      }
      db.save();
      broadcastOrderUpdate(updated);
      broadcastTelemetry(orderId, updated.telemetry);
    }
    activeSimulations.delete(orderId);
  }, 35000);
  timers.push(t3);

  activeSimulations.set(orderId, timers);
}
