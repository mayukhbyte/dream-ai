#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testHealthEndpoint() {
  try {
    const response = await axios.get(`${API_BASE_URL}/../health`);
    console.log('✅ Health endpoint:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health endpoint failed:', error.message);
    return false;
  }
}

async function testRestaurantsEndpoint() {
  try {
    const response = await axios.get(`${API_BASE_URL}/restaurants`);
    console.log('✅ Restaurants endpoint:', response.data.restaurants.length, 'restaurants found');
    return true;
  } catch (error) {
    console.error('❌ Restaurants endpoint failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');

  const tests = [
    testHealthEndpoint(),
    testRestaurantsEndpoint()
  ];

  const results = await Promise.all(tests);
  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\n📊 Test Results: ${passed}/${total} passed`);

  if (passed === total) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed');
    process.exit(1);
  }
}

runTests();