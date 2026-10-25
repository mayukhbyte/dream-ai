import type { NextApiRequest, NextApiResponse } from 'next';
import { store, startOrderLifecycle } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/orders  or  GET /api/orders?userId=xxx
  if (req.method === 'GET') {
    const { userId } = req.query;
    const orders = store.getOrders(userId as string | undefined);
    return res.status(200).json({ orders });
  }

  // POST /api/orders  — create a new order
  if (req.method === 'POST') {
    const {
      userId = 'guest-user',
      userEmail = '',
      restaurantId,
      restaurantName = '',
      dish = '',
      price = '₹0',
      rawPrice = 0,
      qualityScore = 95,
      hotProbability = 95,
      deliveryMode = 'fast',
      eta = '25 mins',
      deliveryAddress = 'Default Address'
    } = req.body || {};

    // Resolve restaurantId from name if not provided
    const restaurants = store.getRestaurants();
    const restaurant = restaurants.find(r => r.id === restaurantId || r.name === restaurantName) || restaurants[0];

    const order = store.createOrder({
      userId,
      userEmail,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      dish,
      price,
      rawPrice,
      qualityScore,
      hotProbability,
      deliveryMode,
      eta,
      status: 'PREPARING',
      deliveryAddress
    });

    // Kick off lifecycle simulation
    startOrderLifecycle(order.id);

    return res.status(201).json({ order });
  }

  return res.status(405).end();
}
