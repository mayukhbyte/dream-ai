import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../services/apiService';

type Restaurant = {
  id: string;
  name: string;
  imageUrl?: string;
  cuisineType?: string[];
  rating?: number;
  deliveryFee: number;
  minOrderValue: number;
  qualityScore?: number;
};

export default function DiscoverScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params: any = {};
      if (searchQuery) {
        params.q = searchQuery;
      }
      // In a real app, we'd add cuisine filter to the API
      // For now, we'll filter client-side after getting all restaurants

      const data = await apiService.restaurant.getAll(params);

      // Apply cuisine filter client-side (in a real app, this would be done server-side)
      let filtered = data.restaurants || [];

      if (cuisineFilter) {
        filtered = filtered.filter(restaurant =>
          restaurant.cuisineType && restaurant.cuisineType.includes(cuisineFilter)
        );
      }

      setRestaurants(filtered);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Error loading restaurants:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRestaurants();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    loadRestaurants();
  };

  const handleCuisinePress = (cuisine: string) => {
    setCuisineFilter(cuisineFilter === cuisine ? null : cuisine);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover Restaurants</Text>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search restaurants..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <MaterialCommunityIcons name="magnify" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cuisine Filters */}
      {cuisines.length > 0 && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Cuisine:</Text>
          <View style={styles.filtersList}>
            {cuisines.map((cuisine, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterButton,
                  cuisineFilter === cuisine ? styles.filterButtonActive : null
                ]}
                onPress={() => handleCuisinePress(cuisine)}
              >
                <Text style={styles.filterText}>{cuisine}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Restaurants List */}
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.restaurantCard} onPress={() => console.log('Navigate to restaurant:', item.id)}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.restaurantImage}
              fallback={require('../assets/placeholder.png')}
            />
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantName}>{item.name}</Text>
              <View style={styles.restaurantMeta}>
                <Text style={styles.cuisineText}>
                  {item.cuisineType?.join(', ') || 'Various'}
                </Text>
                <Text style={styles.divider}>|</Text>
                <Text style={styles.ratingText}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Text key={i} style={i < (item.rating || 0) ? styles.starActive : styles.starInactive}>
                      ★
                    </Text>
                  ))}
                  {(item.rating || 0).toFixed(1)}
                </Text>
              </View>
              <View style={styles.qualityAndFee}>
                <Text style={styles.qualityText}>
                  Quality: {item.qualityScore || 0}/100
                </Text>
                <Text style={styles.feeText}>
                  Delivery: ₹{item.deliveryFee} (min ₹{item.minOrderValue})
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No restaurants found</Text>
          </View>
        }
      />
    </View>
  );
}

// Extract all unique cuisines from common types for filters
const cuisines = [
  "Indian", "Thai", "Healthy", "Salads", "Italian",
  "Fast Food", "Japanese", "Seafood", "American", "Chinese",
  "Mexican", "Mediterranean", "French", "Greek", "Lebanese"
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    height: 20,
    fontSize: 16,
    paddingHorizontal: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    marginLeft: 8,
  },
  filtersContainer: {
    padding: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filtersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
  },
  filterText: {
    color: cuisineFilter === null ? '#666' : 'white',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
  },
  restaurantImage: {
    width: 100,
    height: 100,
  },
  restaurantDetails: {
    flex: 1,
    padding: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  cuisineText: {
    fontSize: 14,
    color: '#666',
    flexShrink: 1,
  },
  divider: {
    marginHorizontal: 8,
    color: '#ddd',
    fontSize: 14,
  },
  ratingText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starActive: {
    color: '#FFD700',
  },
  starInactive: {
    color: '#ddd',
  },
  qualityAndFee: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  feeText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  }
});