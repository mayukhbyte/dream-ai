import type { NextApiRequest, NextApiResponse } from 'next';
import { store, MenuItem } from '@/lib/store';

// Curated authentic culinary photography
const CULINARY_IMAGES: Record<string, string> = {
  butter_chicken: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
  chicken_tikka: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
  tikka: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  tandoori: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  paneer: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
  paneer_butter: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
  dal_makhani: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  dal: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
  naan: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  roti: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
  mutton: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  kebab: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  chole: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  bhature: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
  dosa: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
  idli: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  thali: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
  samosa: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  chaat: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
  momo: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
  dumpling: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
  ramen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  noodle: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  fried_rice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  roll: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
  wrap: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
  shawarma: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  margherita: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  cheeseburger: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281729?auto=format&fit=crop&w=800&q=80',
  alfredo: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
  steak: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  wings: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
  fries: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  taco: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80',
  seafood: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
  fish: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  prawns: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
  healthy: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  quinoa: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  bowl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  dessert: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  brownie: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
  ice_cream: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80',
  gulab_jamun: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  smoothie: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80',
  coffee: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
  cold_coffee: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
  juice: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=800&q=80',
  lassi: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
  cold_drink: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
  coca_cola: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80',
  coke: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
  pepsi: 'https://images.unsplash.com/photo-1629203851288-7ececa5f05c4?auto=format&fit=crop&w=800&q=80',
  sprite: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=800&q=80',
  thums_up: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=800&q=80',
  soda: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  soft_drink: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
  iced_tea: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
  lemonade: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
};

function getDishImage(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('cold drink') || q.includes('soft drink') || q.includes('soda') || q.includes('coke') || q.includes('coca cola') || q.includes('pepsi') || q.includes('sprite') || q.includes('thums') || q.includes('fanta') || q.includes('dew')) {
    if (q.includes('coca cola') || q.includes('bottle')) return CULINARY_IMAGES.coca_cola;
    if (q.includes('pepsi')) return CULINARY_IMAGES.pepsi;
    if (q.includes('sprite') || q.includes('7up')) return CULINARY_IMAGES.sprite;
    return CULINARY_IMAGES.cold_drink;
  }
  if (q.includes('iced tea')) return CULINARY_IMAGES.iced_tea;
  if (q.includes('cold coffee') || q.includes('cold brew')) return CULINARY_IMAGES.cold_coffee;
  if (q.includes('lemonade') || q.includes('nimbu')) return CULINARY_IMAGES.lemonade;

  for (const [key, url] of Object.entries(CULINARY_IMAGES)) {
    const term = key.replace(/_/g, ' ');
    if (q.includes(term)) return url;
  }
  if (q.includes('chicken') || q.includes('murgh')) return CULINARY_IMAGES.chicken_tikka;
  if (q.includes('paneer') || q.includes('cheese')) return CULINARY_IMAGES.paneer;
  if (q.includes('rice') || q.includes('pulao')) return CULINARY_IMAGES.biryani;
  if (q.includes('bread') || q.includes('kulcha') || q.includes('paratha')) return CULINARY_IMAGES.naan;
  if (q.includes('sweet') || q.includes('dessert') || q.includes('halwa')) return CULINARY_IMAGES.dessert;
  if (q.includes('drink') || q.includes('beverage') || q.includes('shake')) return CULINARY_IMAGES.cold_drink;
  if (q.includes('curry') || q.includes('gravy')) return CULINARY_IMAGES.butter_chicken;
  return CULINARY_IMAGES.default;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, userId = 'guest-user', deliveryMode = 'fast' } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const q = prompt.toLowerCase();
    const dishes = store.getMenuItems();
    const restaurants = store.getRestaurants();

    // 1. Budget extraction
    let budgetCap: number | null = null;
    const priceMatch = q.match(/(?:under|below|less than|within|around|₹|rs\.?)\s*(\d+)/i) || q.match(/(\d+)\s*(?:rupees|rs|inr)/i);
    if (priceMatch && priceMatch[1]) {
      budgetCap = parseInt(priceMatch[1], 10);
    }

    // 2. Score existing dishes
    let bestDish: MenuItem | null = null;
    let maxMatchScore = 0;

    const isColdDrink = q.includes('cold drink') || q.includes('soft drink') || q.includes('coke') || q.includes('coca cola') || q.includes('pepsi') || q.includes('sprite') || q.includes('thums') || q.includes('fanta') || q.includes('dew') || q.includes('soda') || q.includes('iced tea') || q.includes('cold coffee') || q.includes('lemonade') || q.includes('beverage') || q.includes('drink');

    if (isColdDrink) {
      if (q.includes('sprite') || q.includes('lemon') || q.includes('7up')) {
        bestDish = dishes.find(d => d.id === 'dish-cold-drink-2') || null;
      } else if (q.includes('tea') || q.includes('peach')) {
        bestDish = dishes.find(d => d.id === 'dish-cold-drink-3') || null;
      } else {
        bestDish = dishes.find(d => d.id === 'dish-cold-drink-1') || null;
      }
      if (bestDish) {
        maxMatchScore = 100;
      }
    }

    if (!bestDish) {
      for (const dish of dishes) {
        if (isColdDrink && dish.price > 60) continue;
        let score = 0;
        const nameLower = dish.name.toLowerCase();
        const catLower = dish.category.toLowerCase();

        const stopwords = new Set(['with', 'under', 'delivered', 'mins', 'minutes', 'meal', 'guarantee', 'from', 'this', 'that', 'order', 'want', 'food', 'have', 'need', 'chef', 'curated']);
        const tokens = q.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
        const nameTokens = nameLower.split(/[\s\-–—,]+/);
        let hasNameMatch = false;

        for (const token of tokens) {
          if (nameTokens.some(nt => nt === token || (token.length >= 4 && nt.includes(token)))) {
            score += 15;
            hasNameMatch = true;
          }
          if (catLower.includes(token)) score += 3;
        }

        if ((q.includes('veg') || q.includes('paneer') || q.includes('vegan')) && dish.isVegetarian) {
          score += 5;
        }
        if ((q.includes('chicken') || q.includes('mutton') || q.includes('meat')) && !dish.isVegetarian) {
          score += 5;
        }
        if ((q.includes('spicy') || q.includes('hot') || q.includes('tikka') || q.includes('masala')) && dish.isSpicy) {
          score += 4;
        }

        if (budgetCap && dish.price <= budgetCap) {
          score += 4;
        } else if (budgetCap && dish.price > budgetCap) {
          score -= 10;
        }

        if (hasNameMatch && score > maxMatchScore) {
          maxMatchScore = score;
          bestDish = dish;
        }
      }
    }

    // 3. Synthesize if no direct match found
    let matchedDish: MenuItem;

    if (bestDish && maxMatchScore >= 18) {
      matchedDish = bestDish;
    } else {
      const isVeg = q.includes('veg') || q.includes('paneer') || q.includes('tofu') || q.includes('salad') || q.includes('quinoa');
      const isSpicy = q.includes('spicy') || q.includes('tikka') || q.includes('masala') || q.includes('chilli');

      let targetRest = restaurants[0];
      if (isColdDrink) {
        targetRest = restaurants.find(r => r.id === 'rest-2') || restaurants[0];
      } else if (isVeg && (q.includes('salad') || q.includes('bowl') || q.includes('detox') || q.includes('roll'))) {
        targetRest = restaurants.find(r => r.id === 'rest-2') || restaurants[1] || restaurants[0];
      } else if (q.includes('biryani') || q.includes('dum') || q.includes('kebab') || q.includes('mutton')) {
        targetRest = restaurants.find(r => r.id === 'rest-3') || restaurants[2] || restaurants[0];
      } else if (q.includes('ramen') || q.includes('noodles') || q.includes('asian') || q.includes('sushi') || q.includes('momo') || q.includes('dumpling')) {
        targetRest = restaurants.find(r => r.id === 'rest-4') || restaurants[3] || restaurants[0];
      } else if (q.includes('pizza') || q.includes('pasta') || q.includes('italian')) {
        targetRest = restaurants.find(r => r.id === 'rest-5') || restaurants[4] || restaurants[0];
      }

      let calculatedPrice = 240;
      if (isColdDrink) {
        calculatedPrice = 40;
        if (q.includes('tea') || q.includes('coffee') || q.includes('brew')) calculatedPrice = 60;
        if (budgetCap && budgetCap < calculatedPrice) calculatedPrice = budgetCap;
      } else if (budgetCap && budgetCap >= 50) {
        calculatedPrice = Math.min(budgetCap, Math.max(99, budgetCap - 10));
      } else if (q.includes('biryani') || q.includes('mutton')) {
        calculatedPrice = 340;
      } else if (isVeg) {
        calculatedPrice = 220;
      }

      let dishTitle = prompt
        .replace(/under\s*₹?\d+/gi, '')
        .replace(/with hot arrival guarantee/gi, '')
        .replace(/delivered in \d+ mins?/gi, '')
        .replace(/with spicy red dip/gi, 'with Spicy Red Dip')
        .replace(/give me (a )?/gi, '')
        .replace(/with a mrp price/gi, '')
        .replace(/with mrp/gi, '')
        .trim();

      dishTitle = dishTitle.charAt(0).toUpperCase() + dishTitle.slice(1);
      if (dishTitle.length > 50) dishTitle = dishTitle.slice(0, 50);

      const dishName = isColdDrink 
        ? `${dishTitle} (Chilled 330ml) – Official MRP: ₹${calculatedPrice}`
        : `${dishTitle} – Chef Curated`;

      const dishDesc = isColdDrink
        ? `Ice-chilled at 4.0°C: Sealed 330ml can/bottle dispatched at official Maximum Retail Price (MRP: ₹${calculatedPrice}). Cryo-insulated thermal sleeve preserves refreshing chill and fizz.`
        : `Handcrafted for your craving: fresh ingredients prepared at ${targetRest.name}. Verified thermodynamic packaging for maximum hot arrival retention.`;

      const newDish: MenuItem = {
        id: `dish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        restaurantId: targetRest.id,
        restaurantName: targetRest.name,
        name: dishName,
        description: dishDesc,
        price: calculatedPrice,
        category: isColdDrink ? 'Beverages' : (isVeg ? 'Bowls' : 'Main Course'),
        isVegetarian: isColdDrink || isVeg,
        isVegan: isColdDrink || q.includes('vegan'),
        isSpicy: !isColdDrink && isSpicy,
        preparationTime: isColdDrink ? 4 : 16,
        imageUrl: getDishImage(q),
        isAvailable: true,
        thermalOptimalTemp: isColdDrink ? 4 : 88,
        qualityScore: 99,
        hotProbability: isColdDrink ? 99 : 97
      };

      store.addMenuItem(newDish);
      matchedDish = newDish;
    }

    const restaurant = restaurants.find(r => r.id === matchedDish.restaurantId) || restaurants[0];

    // Thermodynamic Calculations
    const baseHotProb = matchedDish.hotProbability || 96;
    let finalHotProb = baseHotProb;
    let eta = '18 mins';
    const isColdItem = (matchedDish.thermalOptimalTemp && matchedDish.thermalOptimalTemp <= 10) || matchedDish.category === 'Beverages';
    let tempSealText = isColdItem 
      ? 'Cryo-Thermal Chamber: Sub-zero cold core maintaining ice chill at 4.1°C' 
      : 'Double-wall induction thermal pack delivering at 89.2°C';

    if (deliveryMode === 'fast') {
      finalHotProb = Math.min(99, baseHotProb + 2);
      eta = isColdItem ? '10-12 mins' : '16-18 mins';
      tempSealText = isColdItem
        ? 'Rapid Drone Cryo-Courier: Ice condensation preserved at 3.9°C'
        : 'Lightning Priority: Active heated compartment maintaining 89.5°C';
    } else if (deliveryMode === 'green') {
      finalHotProb = Math.min(98, baseHotProb + 1);
      eta = isColdItem ? '15-18 mins' : '22-25 mins';
      tempSealText = isColdItem
        ? 'Zero-Emission Cryo Pod: Insulated ice-pack holding at 4.4°C'
        : 'Eco Aerodynamic Bike: Zero-plastic insulated sugarcane casing at 85.8°C';
    } else {
      finalHotProb = Math.max(90, baseHotProb - 2);
      eta = isColdItem ? '20-22 mins' : '28-32 mins';
      tempSealText = isColdItem
        ? 'Consolidated Cold Chain: Multi-drop cold chest preserving at 5.0°C'
        : 'Smart Saver Route: Consolidated heat-core chamber at 83.4°C';
    }

    const explanation = `Matched for "${prompt}": Handcrafted at ${restaurant.name} (${restaurant.rating}★). ${matchedDish.description} Sealed in ${tempSealText}.`;

    store.saveFoodMemory({
      userId,
      query: prompt,
      matchedDish: matchedDish.name,
      qualityScore: matchedDish.qualityScore
    });

    return res.status(200).json({
      success: true,
      dish: matchedDish.name,
      dishId: matchedDish.id,
      restaurant: `${restaurant.name} (1.4 km)`,
      restaurantId: restaurant.id,
      price: `₹${matchedDish.price}`,
      rawPrice: matchedDish.price,
      qualityScore: matchedDish.qualityScore,
      hotProbability: finalHotProb,
      prepTime: `${matchedDish.preparationTime} mins`,
      eta,
      tasteRating: `${restaurant.rating}/5`,
      packagingRating: '4.9/5',
      orderAccuracy: '99.4%',
      imageUrl: matchedDish.imageUrl,
      explanation
    });
  } catch (error) {
    console.error('AI Concierge error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
