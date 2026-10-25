import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.query;
  const { customerMessage, photoUrl } = req.body || {};

  if (!customerMessage) {
    return res.status(400).json({ error: 'Customer complaint message is required' });
  }

  const order = store.getOrderById(String(orderId));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const complaint = store.addOrderComplaint(String(orderId), { customerMessage, photoUrl });
  if (!complaint) {
    return res.status(500).json({ error: 'Failed to record complaint' });
  }

  return res.status(201).json({
    success: true,
    message: 'Quality complaint logged and forwarded to Chef Terminal',
    complaint,
    helpline: '1800-200-3732',
    supportSite: 'https://help.dreamfood.ai/support'
  });
}
