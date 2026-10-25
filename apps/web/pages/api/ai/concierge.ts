import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const backendRes = await fetch('http://localhost:5000/api/ai/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({}));
      return res.status(backendRes.status).json(err);
    }

    const data = await backendRes.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('API proxy error to backend port 5000:', error);
    return res.status(502).json({ 
      error: 'Backend API service unavailable', 
      message: error?.message 
    });
  }
}
