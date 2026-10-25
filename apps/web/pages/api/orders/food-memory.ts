import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/orders/food-memory?userId=xxx
  if (req.method === 'GET') {
    const { userId } = req.query;
    const memories = store.getFoodMemories(userId as string | undefined);
    return res.status(200).json({ memories });
  }

  return res.status(405).end();
}
