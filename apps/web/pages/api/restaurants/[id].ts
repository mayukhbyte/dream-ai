import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const restaurant = store.getRestaurantById(String(id));

  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  return res.status(200).json({
    success: true,
    restaurant
  });
}
