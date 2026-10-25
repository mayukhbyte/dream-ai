import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { apiService } from '../services/apiService';

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  placedAt: string; // ISO date string
  restaurant: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  orderItems: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
    isVegetarian?: boolean;
    isSpicy?: boolean;
  }>;
  deliveryInfo?: {
    estimatedDeliveryTime: string;
    riderName?: string;
    riderPhone?: string;
  };
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await apiService.order.getOrders({});

      // Transform API response to match our Order type
      const transformedOrders = data.orders.map((order: any) => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        placedAt: order.placedAt,
        restaurant: {
          id: order.restaurant.id,
          name: order.restaurant.name,
          imageUrl: order.restaurant.imageUrl
        },
        orderItems: order.orderItems.map((item: any) => ({
          id: item.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.menuItem.price,
          imageUrl: item.menuItem.imageUrl,
          isVegetarian: item.menuItem.isVegetarian,
          isSpicy: item.menuItem.isSpicy
        })),
        deliveryInfo: order.deliveryInfo ? {
          estimatedDeliveryTime: order.deliveryInfo.estimatedDeliveryTime,
          riderName: order.deliveryInfo.riderName,
          riderPhone: order.deliveryInfo.riderPhone
        } : undefined
      }));

      // Apply filters
      let filtered = [...transformedOrders];

      if (filter === 'active') {
        filtered = transformedOrders.filter(order =>
          ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(order.status)
        );
      } else if (filter === 'past') {
        filtered = transformedOrders.filter(order =>
          ['DELIVERED', 'CANCELLED'].includes(order.status)
        );
      }

      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

      setOrders(filtered);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Error loading orders:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'Pending', color: '#FFA500' },
      CONFIRMED: { label: 'Confirmed', color: '#1E90FF' },
      PREPARING: { label: 'Preparing', color: '#FF8C00' },
      READY_FOR_PICKUP: { label: 'Ready for Pickup', color: '#32CD32' },
      OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: '#FF6B35' },
      DELIVERED: { label: 'Delivered', color: '#2E8B57' },
      CANCELLED: { label: 'Cancelled', color: '#DC143C' }
    };

    return statusMap[status] || { label: status, color: '#666' };
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        <Text style={styles.title}>Your Orders</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'active' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('active')}
          >
            <Text style={styles.filterText}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'past' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('past')}
          >
            <Text style={styles.filterText}>Past</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => console.log('View order details:', item.id)}
          >
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>Order #{item.id.slice(-6)}</Text>
                <Text style={styles.orderDate}>{formatDate(item.placedAt)}</Text>
              </View>
              <View style={styles.orderStatus}>
                <View style={[
                  styles.statusBadge,
                  styles[`statusBadge${getStatusLabel(item.status).label.replace(/\s+/g, '')}`]
                ]}>
                  <Text style={styles.statusText}>{getStatusLabel(item.status).label}</Text>
                </View>
              </View>
            </View>

            <View style={styles.orderRestaurant}>
              <Image
                source={{ uri: item.restaurant.imageUrl }}
                style={styles.restaurantImage}
                fallback={require('../assets/placeholder.png')}
              />
              <View style={styles.restaurantDetails}>
                <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
                <Text style={styles.itemsCount}>
                  {item.orderItems.reduce((sum, i) => sum + i.quantity, 0)} items
                </Text>
              </View>
            </View>

            <View style={styles.orderItems}>
              {item.orderItems.map((item, index) => (
                <View key={index} style={styles.orderItemRow}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                    fallback={require('../assets/placeholder.png')}
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>×{item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(0)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.orderFooter}>
              <View style={styles.orderTotal}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
              </View>

              {item.deliveryInfo && (
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryLabel}>Estimated Delivery:</Text>
                  <Text style={styles.deliveryValue}>
                    {formatDate(item.deliveryInfo.estimatedDeliveryTime)}
                  </Text>
                </View>
              )}
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
            <MaterialCommunityIcons name="food-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>
              Start your first order to see it here!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
  },
  filterText: {
    color: filter === 'all' ? 'white' : '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderInfo: {
    flexDirection: 'column',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgePending: {
    backgroundColor: '#FFF8E1',
  },
  statusBadgeConfirmed: {
    backgroundColor: '#E3F2FD',
  },
  statusBadgePreparing: {
    backgroundColor: '#FFF3E0',
  },
  statusBadgeReadyForPickup: {
    backgroundColor: '#E8F5E8',
  },
  statusBadgeOutForDelivery: {
    backgroundColor: '#FFF3E0',
  },
  statusBadgeDelivered: {
    backgroundColor: '#E8F5E8',
  },
  statusBadgeCancelled: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderRestaurant: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  restaurantDetails: {
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemsCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  orderItems: {
    padding: 12,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderTotal: {
    flexDirection: 'column',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  deliveryInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  deliveryLabel: {
    fontSize: 12,
    color: '#666',
  },
  deliveryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
});