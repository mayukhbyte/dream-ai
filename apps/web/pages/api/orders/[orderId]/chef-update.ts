import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.query;
  const { preparationSteps, chefInitialTemp, chefNotes, isReadyForPickup } = req.body || {};

  const updated = store.updateOrderChef(String(orderId), {
    preparationSteps,
    chefInitialTemp: typeof chefInitialTemp === 'number' ? chefInitialTemp : undefined,
    chefNotes,
    isReadyForPickup: typeof isReadyForPickup === 'boolean' ? isReadyForPickup : undefined
  });

  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Chef preparation features updated',
    order: updated
  });
}
