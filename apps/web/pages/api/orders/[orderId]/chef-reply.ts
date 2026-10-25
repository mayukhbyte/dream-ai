import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.query;
  const { reply } = req.body || {};

  if (!reply || typeof reply !== 'string' || !reply.trim()) {
    return res.status(400).json({ error: 'Chef reply message is required' });
  }

  const updated = store.updateOrderChefFeedbackReply(String(orderId), reply.trim());

  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Chef reply recorded and sent to customer',
    order: updated
  });
}
