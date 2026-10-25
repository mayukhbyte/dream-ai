import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.query;
  const { speedKmh, altitudeMeters, etaMins, shortestRouteDistanceKm, flightStatus, eta } = req.body || {};

  const updated = store.updateOrderDelivery(String(orderId), {
    speedKmh: typeof speedKmh === 'number' ? speedKmh : undefined,
    altitudeMeters: typeof altitudeMeters === 'number' ? altitudeMeters : undefined,
    etaMins: typeof etaMins === 'number' ? etaMins : undefined,
    shortestRouteDistanceKm: typeof shortestRouteDistanceKm === 'number' ? shortestRouteDistanceKm : undefined,
    flightStatus,
    eta
  });

  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Delivery drone flight telemetry updated',
    order: updated
  });
}
