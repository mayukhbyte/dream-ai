import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { orderId } = req.query;
  const id = Array.isArray(orderId) ? orderId[0] : orderId || '';

  // PATCH /api/orders/[orderId]/status
  if (req.method === 'PATCH') {
    const { status } = req.body || {};
    const updated = store.updateOrderStatus(id, status);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    return res.status(200).json({ order: updated });
  }

  return res.status(405).end();
}
