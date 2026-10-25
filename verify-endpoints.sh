#!/bin/bash

echo "Verifying API endpoints..."

API_BASE_URL="http://localhost:5000/api"

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "$API_BASE_URL/../health" -o /dev/null || echo "000")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Health endpoint: OK"
else
    echo "❌ Health endpoint: FAILED (HTTP $HEALTH_RESPONSE)"
fi

# Test restaurants endpoint
echo "Testing restaurants endpoint..."
RESTAURANTS_RESPONSE=$(curl -s -w "%{http_code}" "$API_BASE_URL/restaurants" -o /dev/null || echo "000")
if [ "$RESTAURANTS_RESPONSE" = "200" ]; then
    echo "✅ Restaurants endpoint: OK"
else
    echo "❌ Restaurants endpoint: FAILED (HTTP $RESTAURANTS_RESPONSE)"
fi

echo ""
echo "Verification complete."
echo "Note: For protected endpoints, you need to include a valid Firebase auth token."