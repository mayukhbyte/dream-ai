import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { search } = req.query;
  const restaurants = store.getRestaurants(search as string | undefined);
  return res.status(200).json({ restaurants });
}
