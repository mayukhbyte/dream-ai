import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const complaints = store.getAllComplaints();
  return res.status(200).json({
    success: true,
    count: complaints.length,
    complaints
  });
}
