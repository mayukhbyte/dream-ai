import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// Register or get profile
router.post('/register', (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.getOrCreateUser(email, firstName, lastName);
    res.status(200).json({
      success: true,
      message: 'User authenticated successfully',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', (req: Request, res: Response) => {
  try {
    const email = req.query.email as string || 'guest@dreamfood.ai';
    const user = db.getOrCreateUser(email);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;