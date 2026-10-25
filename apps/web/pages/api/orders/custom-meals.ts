import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '@/lib/store';

// Custom Meals sub-routes under /api/orders
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/orders/custom-meals?userId=xxx
  if (req.method === 'GET') {
    const { userId } = req.query;
    const meals = store.getCustomMeals(userId as string | undefined);
    return res.status(200).json({ meals });
  }

  // POST /api/orders/custom-meals  — save a custom meal
  if (req.method === 'POST') {
    const { userId = 'guest-user', userEmail = '', base, protein, side, drink, price = '₹0' } = req.body || {};
    const meal = store.saveCustomMeal({ userId, userEmail, base, protein, side, drink, price });
    return res.status(201).json({ meal });
  }

  return res.status(405).end();
}
