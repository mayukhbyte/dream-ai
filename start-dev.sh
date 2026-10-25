#!/bin/bash

echo "Starting Dream Food Delivery App development environment..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please install Docker to continue."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "docker-compose not found. Please install docker-compose to continue."
    exit 1
fi

# Start the backend services
echo "Starting backend services (API, database)..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check if API is healthy
echo "Checking API health..."
MAX_ATTEMPTS=10
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health || echo "000")
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo "API is healthy!"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo "Attempt $ATTEMPT/$MAX_ATTEMPTS: API not ready yet (HTTP $HTTP_CODE)..."
    sleep 5
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "Warning: API health check failed after $MAX_ATTEMPTS attempts"
    echo "You may need to check the logs: docker-compose logs api"
fi

echo ""
echo "=== Development Environment Started ==="
echo ""
echo "Backend API: http://localhost:5000"
echo "API Health Check: http://localhost:5000/health"
echo ""
echo "To start the mobile app:"
echo "  cd apps/mobile"
echo "  npm install (if first time)"
echo "  npm start"
echo ""
echo "Then:"
echo "  - Press 'a' for Android emulator"
echo "  - Press 'i' for iOS simulator"
echo "  - Press 'w' for web version"
echo ""
echo "To stop all services:"
echo "  docker-compose down"
echo ""