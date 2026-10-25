import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.query;
  const { stars, review, feedbackTags } = req.body || {};

  if (!stars || stars < 1 || stars > 5) {
    return res.status(400).json({ error: 'Stars rating must be between 1 and 5' });
  }

  const updated = store.updateOrderRating(String(orderId), {
    stars,
    review: review || 'Delicious and delivered steaming hot!',
    feedbackTags: feedbackTags || ['Hot Arrival', 'Great Packaging']
  });

  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Rating and feedback submitted successfully',
    order: updated
  });
}
