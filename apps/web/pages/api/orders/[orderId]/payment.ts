import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.query;
  const { method = 'ONLINE', amount, transactionId } = req.body || {};

  const updated = store.updateOrderPayment(String(orderId), {
    method: method as any,
    status: 'PAID',
    amount: typeof amount === 'number' ? amount : 280,
    transactionId: transactionId || `PAY-${Date.now().toString().slice(-6)}`
  });

  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.status(200).json({
    success: true,
    message: `Payment successful via ${method}`,
    order: updated
  });
}
