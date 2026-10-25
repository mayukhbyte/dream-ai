import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const activeOrders = store.getOrders().filter(o => o.status !== 'DELIVERED');
  return res.status(200).json({
    success: true,
    activeOrdersCount: activeOrders.length,
    activeOrders: activeOrders.map(o => ({
      id: o.id,
      dish: o.dish,
      restaurant: o.restaurantName,
      status: o.status,
      telemetry: o.telemetry
    }))
  });
}
