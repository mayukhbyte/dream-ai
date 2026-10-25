import { Router, Request, Response } from 'express';
import { db, OrderStatus } from '../db';
import { broadcastOrderUpdate, startOrderLifecycleSimulation } from '../realtime';

const router = Router();

// Get orders (all or by userId)
router.get('/', (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const orders = db.getOrders(userId ? String(userId) : undefined);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single order with live telemetry
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = db.getOrderById(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Place new order
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      userId = 'guest-user',
      userEmail = 'guest@dreamfood.ai',
      restaurantId = 'rest-1',
      restaurantName = 'Delhi Heritage Kitchen',
      dish,
      price = '₹280',
      rawPrice = 280,
      qualityScore = 98,
      hotProbability = 96,
      deliveryMode = 'fast',
      eta = '18 mins',
      deliveryAddress = 'Greenwood Heights, 4th Floor'
    } = req.body;

    if (!dish) {
      return res.status(400).json({ error: 'Dish name is required to place an order' });
    }

    const newOrder = db.createOrder({
      userId,
      userEmail,
      restaurantId,
      restaurantName,
      dish,
      price,
      rawPrice: typeof rawPrice === 'number' ? rawPrice : parseInt(String(rawPrice).replace(/[^0-9]/g, '')) || 280,
      qualityScore,
      hotProbability,
      deliveryMode,
      eta,
      status: 'PREPARING',
      deliveryAddress
    });

    // Broadcast to real-time WebSockets
    broadcastOrderUpdate(newOrder);

    // Trigger real-time lifecycle progression & telemetry stream
    startOrderLifecycleSimulation(newOrder.id);

    res.status(201).json({
      success: true,
      message: 'Order created and assigned to thermal route',
      order: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status (manual or automated control)
router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, telemetry } = req.body;

    const validStatuses: OrderStatus[] = ['PREPARING', 'QUALITY_CHECK', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = db.updateOrderStatus(id, status, telemetry);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Broadcast immediately over Socket.IO
    broadcastOrderUpdate(updated);

    res.status(200).json({
      success: true,
      order: updated
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handover to 3D Drone endpoint
router.post('/:id/handover-drone', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { handoverToDrone } = require('../realtime');
    const updated = handoverToDrone(id);

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Drone handover initiated and airborne',
      order: updated
    });
  } catch (error) {
    console.error('Handover drone error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chef Terminal update (steps, initial cooking temp, notes, ready for pickup)
router.patch('/:id/chef-update', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { preparationSteps, chefInitialTemp, chefNotes, isReadyForPickup } = req.body;
    const { notifyDeliveryPickupReady } = require('../realtime');

    const updated = db.updateOrderChef(id, {
      preparationSteps,
      chefInitialTemp: typeof chefInitialTemp === 'number' ? chefInitialTemp : undefined,
      chefNotes,
      isReadyForPickup: typeof isReadyForPickup === 'boolean' ? isReadyForPickup : undefined
    });

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    broadcastOrderUpdate(updated);
    if (isReadyForPickup) {
      notifyDeliveryPickupReady(updated);
    }

    res.status(200).json({
      success: true,
      message: 'Chef preparation features updated',
      order: updated
    });
  } catch (error) {
    console.error('Chef update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delivery Drone Pilot update (speed, altitude, eta, shortest route, flight status)
router.patch('/:id/delivery-update', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { speedKmh, altitudeMeters, etaMins, shortestRouteDistanceKm, flightStatus, eta } = req.body;
    const { broadcastTelemetry } = require('../realtime');

    const updated = db.updateOrderDelivery(id, {
      speedKmh: typeof speedKmh === 'number' ? speedKmh : undefined,
      altitudeMeters: typeof altitudeMeters === 'number' ? altitudeMeters : undefined,
      etaMins: typeof etaMins === 'number' ? etaMins : undefined,
      shortestRouteDistanceKm: typeof shortestRouteDistanceKm === 'number' ? shortestRouteDistanceKm : undefined,
      flightStatus,
      eta
    });

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    broadcastOrderUpdate(updated);
    broadcastTelemetry(id, updated.telemetry);

    res.status(200).json({
      success: true,
      message: 'Delivery drone flight telemetry updated',
      order: updated
    });
  } catch (error) {
    console.error('Delivery update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer payment submission (COD or ONLINE)
router.post('/:id/payment', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { method = 'ONLINE', amount, transactionId } = req.body;

    const updated = db.updateOrderPayment(id, {
      method: method as any,
      status: 'PAID',
      amount: typeof amount === 'number' ? amount : 280,
      transactionId: transactionId || `PAY-${Date.now().toString().slice(-6)}`
    });

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    broadcastOrderUpdate(updated);

    res.status(200).json({
      success: true,
      message: `Payment successful via ${method}`,
      order: updated
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer food rating & feedback submission
router.post('/:id/rate', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stars, review, feedbackTags } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Stars rating must be between 1 and 5' });
    }

    const updated = db.updateOrderRating(id, {
      stars,
      review: review || 'Delicious and delivered steaming hot!',
      feedbackTags: feedbackTags || ['Hot Arrival', 'Great Packaging'],
      ratedAt: new Date().toISOString()
    });

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    broadcastOrderUpdate(updated);

    res.status(200).json({
      success: true,
      message: 'Rating and feedback submitted successfully',
      order: updated
    });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer bad food complaint upload (with camera photo)
router.post('/:id/complaint', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { customerMessage, photoUrl } = req.body;
    const { notifyChefComplaint } = require('../realtime');

    if (!customerMessage) {
      return res.status(400).json({ error: 'Customer complaint message is required' });
    }

    const order = db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const complaint = db.addOrderComplaint(id, { customerMessage, photoUrl });
    if (!complaint) {
      return res.status(500).json({ error: 'Failed to record complaint' });
    }

    // Immediately alert Chef Dashboard with real-time notification & photo
    notifyChefComplaint(order, complaint);
    broadcastOrderUpdate(order);

    res.status(201).json({
      success: true,
      message: 'Quality complaint logged and forwarded to Chef Terminal',
      complaint,
      helpline: '1800-200-3732',
      supportSite: 'https://help.dreamfood.ai/support'
    });
  } catch (error) {
    console.error('Complaint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List all complaints for Chef Dashboard
router.get('/complaints/all', (req: Request, res: Response) => {
  try {
    const complaints = db.getAllComplaints();
    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chef reply to customer feedback/complaint
router.patch('/:id/chef-reply', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply || typeof reply !== 'string' || !reply.trim()) {
      return res.status(400).json({ error: 'Chef reply message is required' });
    }

    const updated = db.updateOrderChefFeedbackReply(id, reply.trim());

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Chef reply sent to customer successfully',
      order: updated
    });
  } catch (error) {
    console.error('Chef reply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Custom Meal Endpoints
router.post('/custom-meal', (req: Request, res: Response) => {
  try {
    const {
      userId = 'guest-user',
      userEmail = 'guest@dreamfood.ai',
      base,
      protein,
      side,
      drink,
      price = '₹320'
    } = req.body;

    if (!base || !protein) {
      return res.status(400).json({ error: 'Base and protein are required for custom meal' });
    }

    const saved = db.saveCustomMeal({
      userId,
      userEmail,
      base,
      protein,
      side: side || 'None',
      drink: drink || 'None',
      price
    });

    res.status(201).json({
      success: true,
      message: 'Custom meal configuration saved',
      meal: saved
    });
  } catch (error) {
    console.error('Save custom meal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/custom-meals/list', (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const meals = db.getCustomMeals(userId ? String(userId) : undefined);

    res.status(200).json({
      success: true,
      count: meals.length,
      meals
    });
  } catch (error) {
    console.error('Get custom meals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Food Memory Endpoints
router.get('/food-memory/list', (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const memories = db.getFoodMemories(userId ? String(userId) : undefined);

    res.status(200).json({
      success: true,
      count: memories.length,
      memories
    });
  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;