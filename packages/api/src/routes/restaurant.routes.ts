import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// Get all restaurants (with optional filters)
router.get('/', (req: Request, res: Response) => {
  try {
    const { cuisineType, search, minRating } = req.query;
    let restaurants = db.getRestaurants();

    if (cuisineType) {
      const typeStr = String(cuisineType).toLowerCase();
      restaurants = restaurants.filter(r => 
        r.cuisineType.some(c => c.toLowerCase().includes(typeStr))
      );
    }

    if (search) {
      const s = String(search).toLowerCase();
      restaurants = restaurants.filter(r => 
        r.name.toLowerCase().includes(s) || 
        r.description.toLowerCase().includes(s) ||
        r.cuisineType.some(c => c.toLowerCase().includes(s))
      );
    }

    if (minRating) {
      const rating = parseFloat(String(minRating));
      if (!isNaN(rating)) {
        restaurants = restaurants.filter(r => r.rating >= rating);
      }
    }

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all dishes across restaurants
router.get('/dishes/all', (req: Request, res: Response) => {
  try {
    const { category, isVegetarian } = req.query;
    let items = db.getMenuItems();

    if (category) {
      items = items.filter(i => i.category.toLowerCase() === String(category).toLowerCase());
    }

    if (isVegetarian !== undefined) {
      const isVeg = String(isVegetarian) === 'true';
      items = items.filter(i => i.isVegetarian === isVeg);
    }

    res.status(200).json({
      success: true,
      count: items.length,
      dishes: items
    });
  } catch (error) {
    console.error('Get dishes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get restaurant by ID with its menu
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = db.getRestaurantById(id);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json({
      success: true,
      restaurant
    });
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get restaurant menu
router.get('/:id/menu', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = db.getRestaurantById(id);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json({
      success: true,
      menuItems: restaurant.menuItems
    });
  } catch (error) {
    console.error('Get restaurant menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;