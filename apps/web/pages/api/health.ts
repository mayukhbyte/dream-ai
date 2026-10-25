import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    status: 'ok',
    service: 'DreamFood AI API (Vercel Serverless)',
    timestamp: new Date().toISOString(),
    stats: store.stats()
  });
}
