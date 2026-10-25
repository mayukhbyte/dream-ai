import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { AntDesign, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

// Types
type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  rating?: number;
};

type Restaurant = {
  id: string;
  name: string;
  imageUrl?: string;
  cuisineType?: string[];
  rating?: number;
  deliveryFee: number;
  minOrderValue: number;
};

type Recommendation = {
  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
  cuisineType?: string[];
  rating?: number;
  qualityScore?: number;
  deliveryFee: number;
  minOrderValue: number;
  menuItems: MenuItem[];
  matchScore: number;
};

type HomeContent = {
  greeting: string;
  prompt: string;
  userStats: {
    totalOrders: number;
    avgOrderValue: number;
    favoriteCuisine?: string;
    favoriteDish?: string;
  };
  quickActions: Array<{
    type: string;
    label: string;
    value: any;
    icon?: React.ComponentType<any>;
  }>;
  recommendations: Recommendation[];
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHomeContent();
  }, [user]);

  const loadHomeContent = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.ai.getHomeContent();
      setHomeContent(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load home content');
      setLoading(false);
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadHomeContent();
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAction = async (action: any) => {
    // Handle quick action presses by refining recommendations
    try {
      setLoading(true);
      const recommendations = await apiService.ai.getRecommendations(action.value, 10);

      // Update home content with new recommendations
      if (homeContent) {
        setHomeContent({
          ...homeContent,
          recommendations
        });
      }
    } catch (err) {
      console.error('Error getting recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (recommendation: any) => {
    // Add first menu item from recommendation to cart
    try {
      if (recommendation.menuItems.length > 0) {
        const item = recommendation.menuItems[0];
        await apiService.order.addToCart(item.id, 1, '');
        // In a real app, you'd show a success message or update cart badge
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadHomeContent}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!homeContent) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyState}>Loading your personalized recommendations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{homeContent.greeting}</Text>
        <Text style={styles.prompt}>{homeContent.prompt}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <AntDesign name="search" size={20} color="#999" />
        <TextInput
          placeholder="Tell me what you want..."
          value=""
          // In a real app, this would be connected to search state
          editable={false}
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.searchButton}>
          <MaterialCommunityIcons name="microphone" size={24} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsList}>
          {homeContent.quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={() => handleQuickAction(action)}
            >
              {action.icon ? (
                <action.icon size={20} color="#FF6B35" />
              ) : (
                <Text style={styles.actionText}>{action.label}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>Recommended for you</Text>
        {homeContent.recommendations.length > 0 ? (
          <FlatList
            data={homeContent.recommendations}
            keyExtractor={(item) => item.restaurantId}
            renderItem={({ item }) => (
              <View style={styles.recommendationCard}>
                <Image
                  source={{ uri: item.restaurantImage }}
                  style={styles.restaurantImage}
                  fallback={require('../assets/placeholder.png')}
                />
                <View style={styles.recommendationDetails}>
                  <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                  <View style={styles.ratingRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Text key={i} style={i < (item.rating || 0) ? styles.starActive : styles.starInactive}>
                        ★
                      </Text>
                    ))}
                    <Text style={styles.ratingText}>({item.rating || 0})</Text>
                  </View>
                  <View style={styles.qualityRow}>
                    <Text style={styles.qualityLabel}>Quality Score:</Text>
                    <Text style={styles.qualityValue}>{item.qualityScore}/100</Text>
                  </View>
                  <View style={styles.temperatureRow}>
                    <Text style={styles.tempLabel}>Hot Arrival:</Text>
                    <Text style={styles.tempValue}>🔥 92%</Text>
                  </View>
                  <View style={styles.timeRow}>
                    <Text style={styles.timeLabel}>Delivery:</Text>
                    <Text style={styles.timeValue}>⏱️ 24 min</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Starting at:</Text>
                    <Text style={styles.priceValue}>₹{item.menuItems[0]?.price}</Text>
                  </View>
                  <View style={styles.ecoRow}>
                    <Text style={styles.ecoLabel}>Eco Option:</Text>
                    <Text style={styles.ecoValue}>🌱 Available</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToCart(item)}
                  >
                    <Text style={styles.addButtonText}>ADD</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.flatListContent}
          />
        ) : (
          <Text style={styles.emptyState}>No recommendations available</Text>
        )}
      </View>
    </View>
  );
}

const TextInput = ({ placeholder, value, onChangeText, style }: any) => (
  <TextInput
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    style={[styles.searchInput, style]}
  />
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  prompt: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 16,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 20,
    fontSize: 16,
    paddingHorizontal: 12,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionsContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 16,
  },
  actionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
  recommendationsContainer: {
    padding: 16,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
  },
  restaurantImage: {
    width: 100,
    height: 120,
  },
  recommendationDetails: {
    flex: 1,
    padding: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starActive: {
    color: '#FFD700',
  },
  starInactive: {
    color: '#ddd',
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#999',
  },
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  qualityLabel: {
    fontSize: 12,
    color: '#666',
  },
  qualityValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
  },
  temperatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  tempLabel: {
    fontSize: 12,
    color: '#666',
  },
  tempValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF4500',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#32CD32',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E8B57',
  },
  ecoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  ecoLabel: {
    fontSize: 12,
    color: '#666',
  },
  ecoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E8B57',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  emptyState: {
    textAlign: 'center',
    padding: 40,
    color: '#999',
    fontStyle: 'italic',
  },
  error: {
    textAlign: 'center',
    padding: 40,
    color: '#ff0000',
  },
  retryButton: {
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FF6B35',
    fontWeight: '600'
  }
});