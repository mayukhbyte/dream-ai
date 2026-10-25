import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.query;
  const updated = store.handoverToDrone(String(orderId));

  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Drone handover initiated and airborne',
    order: updated
  });
}
