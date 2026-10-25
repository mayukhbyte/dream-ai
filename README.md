# Dream Food Delivery App

A next-generation AI-powered food delivery application that acts as an AI Food Concierge.

## Overview

This application reimagines food delivery by using AI to understand what users want rather than making them search through restaurants. It integrates AI deeply into the core product experience, influencing recommendations, quality scoring, delivery routing, pricing, and personalization.

## Features

- **AI Food Concierge**: Natural language interface for food recommendations
- **Personalized Home Screen**: Contextual greetings and intelligent suggestions
- **Real-Time Food Quality Score**: Dynamic 0-100 scoring based on multiple factors
- **"Will My Food Arrive Hot?" Prediction**: AI-powered temperature probability
- **AI Traffic-Aware Delivery Routing**: Optimized routes considering real-time conditions
- **Real-Time Delivery Tracking**: Detailed order status with live updates
- **Multi-Order Delivery Optimization**: Intelligent order grouping for efficiency
- **Smart Delivery Fee**: Transparent, breakdown-based pricing
- **Smart Saver Delivery**: Choice between speed and price
- **AI Predictive Ordering**: Contextual reminders based on user patterns
- **Group Ordering 2.0**: AI-powered group recommendations
- **Build My Meal**: Customizable meal builder with restaurant matching
- **Eco Delivery Mode**: Environmentally optimized delivery options
- **Smart Restaurant Discovery**: Context-aware restaurant ranking
- **AI Explanations**: Transparent reasoning behind recommendations
- **User Profile & Food Memory**: Continuous learning from user behavior
- **Natural Language Search/Chat**: Conversational food discovery
- **Comprehensive Order History**: Insights and pattern recognition
- **Useful Notification System**: Relevant, non-spammy alerts
- **Restaurant Dashboard**: Analytics and insights for restaurant owners
- **Delivery Rider App**: Optimized routing and order management
- **Admin Dashboard**: System-wide oversight and controls

## Technology Stack

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Authentication
- **Real-time**: Socket.io for live updates
- **AI/ML**: Python microservices (placeholder for actual ML implementation)

### Frontend
- **Mobile**: React Native with Expo (cross-platform iOS/Android)
- **State Management**: React Context and custom hooks
- **UI Components**: Custom styling with vector icons

### DevOps
- **Containerization**: Docker and Docker Compose
- **Environment Configuration**: Environment-specific configs

## Project Structure

```
dream-food-delivery/
├── package.json                  # Root package with workspaces
├── docker-compose.yml            # Docker Compose configuration
├── .env.example                  # Environment variables template
│
├── apps/
│   ├── mobile/                   # React Native mobile application
│   └── web/                      # Admin dashboard (React) - placeholder
│
└── packages/
    ├── api/                      # Node.js/Express backend API
    ├── ml/                       # Python AI/ML services - placeholder
    └── shared/                   # Shared TypeScript types and utilities
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL (if not using Docker)
- Firebase project (for authentication)

### Backend Setup

1. Install dependencies:
   ```bash
   cd packages/api
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp ../../.env.example ../../.env
   # Edit .env with your Firebase and database credentials
   ```

3. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Mobile App Setup

1. Install dependencies:
   ```bash
   cd apps/mobile
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web version

### Docker Setup

1. Build and start all services:
   ```bash
   docker-compose up --build
   ```

2. The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register/link user after Firebase auth
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/auth/verify` - Verify auth token (protected)

### Restaurants
- `GET /api/restaurants` - Get all restaurants (with filtering)
- `GET /api/restaurants/:id` - Get restaurant by ID
- `GET /api/restaurants/search` - Search restaurants
- `GET /api/restaurants/:id/menu` - Get restaurant menu
- `POST /api/restaurants` - Create restaurant (protected)
- `PUT /api/restaurants/:id` - Update restaurant (protected)
- `DELETE /api/restaurants/:id` - Delete restaurant (protected)
- `POST /api/restaurants/:id/menu` - Add menu item (protected)

### Orders
- `GET /api/orders/cart` - Get user's cart (protected)
- `POST /api/orders/cart` - Add item to cart (protected)
- `PUT /api/orders/cart/:itemId` - Update cart item (protected)
- `DELETE /api/orders/cart/:itemId` - Remove item from cart (protected)
- `DELETE /api/orders/cart` - Clear cart (protected)
- `POST /api/orders` - Create order from cart (protected)
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order by ID (protected)
- `PUT /api/orders/:id/status` - Update order status (protected)

### AI Features
- `POST /api/ai/recommendations` - Get AI recommendations (protected)
- `GET /api/ai/home` - Get personalized home content (protected)
- `POST /api/ai/quality-score` - Get food quality score (protected)
- `POST /api/ai/hot-arrival-prediction` - Get hot arrival prediction (protected)
- `POST /api/ai/explain` - Get AI explanation (protected)

## Environment Variables

See `.env.example` for required variables:

- Database connection: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- Firebase: Service account credentials (via `GOOGLE_APPLICATION_CREDENTIALS` or direct config)
- JWT: `JWT_SECRET` (for backward compatibility during transition)
- Frontend URL: `FRONTEND_URL` (for CORS)
- Node environment: `NODE_ENV`
- Port: `PORT`

## Development

### Backend
- The API runs on `http://localhost:5000` in development
- API documentation available via endpoints
- Prisma Studio available at `http://localhost:5555` (when running `npx prisma studio`)

### Mobile App
- Expo development server provides QR code for device testing
- Hot reloading enabled during development
- Console logs visible in terminal

## Deployment

The application is designed for easy deployment using Docker Compose. For production deployment:

1. Set appropriate environment variables in `.env` (not `.env.example`)
2. Build Docker images: `docker-compose build`
3. Start services: `docker-compose up -d`
4. Monitor logs: `docker-compose logs -f`

For cloud deployment (AWS, GCP, Azure), the Docker Compose file can be adapted to use managed services:
- Replace PostgreSQL with managed database service
- Replace manual Docker hosting with container service (ECS, Cloud Run, Container Instances)
- Use managed Redis for caching if needed
- Configure appropriate scaling and load balancing

## Testing

### Backend
```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Mobile App
```bash
# Run Jest tests
npm test

# Note: For React Native testing, additional setup may be needed
# for Jest with React Native
```

## Future Enhancements

1. **Actual ML Services**: Replace placeholder recommendation/logic with real ML models
2. **Advanced Analytics**: Implement comprehensive analytics dashboard
3. **Push Notifications**: Add Firebase Cloud Messaging for real-time alerts
4. **Payment Integration**: Integrate with payment gateways (Stripe, PayPal, etc.)
5. **Offline Support**: Add local caching for improved offline experience
6. **Accessibility**: Improve accessibility compliance (WCAG 2.1)
7. **Internationalization**: Add support for multiple languages
8. **Advanced Filtering**: Enhance restaurant and food discovery filters
9. **Loyalty Program**: Implement rewards and loyalty system
10. **Social Features**: Add food sharing and social recommendations

## License

This project is proprietary and confidential. All rights reserved.

## Contact

For questions or support, please contact the development team.