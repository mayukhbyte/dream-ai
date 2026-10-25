import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { apiService } from '../services/apiService';

type CartItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  specialInstructions?: string;
};

type RestaurantInfo = {
  id: string;
  name: string;
  imageUrl?: string;
  deliveryFee: number;
  minOrderValue: number;
};

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await apiService.order.getCart();

      // Transform API response to match our CartItem type
      const transformedItems = data.cartItems.map((item: any) => ({
        id: item.id,
        name: item.menuItem.name,
        description: item.menuItem.description,
        price: item.menuItem.price,
        quantity: item.quantity,
        imageUrl: item.menuItem.imageUrl,
        isVegetarian: item.menuItem.isVegetarian,
        isVegan: item.menuItem.isVegan,
        isSpicy: item.menuItem.isSpicy,
        specialInstructions: item.specialInstructions || ''
      }));

      setCartItems(transformedItems);

      // Get restaurant info from first item (assuming all items are from same restaurant)
      if (transformedItems.length > 0) {
        const firstItem = transformedItems[0];
        // In a real app, we'd fetch restaurant details separately
        // For now, we'll create mock restaurant info
        setRestaurantInfo({
          id: 'rest-1', // This would come from the API
          name: "Restaurant Name", // This would come from the API
          imageUrl: firstItem.imageUrl || '',
          deliveryFee: 0, // This would come from the API
          minOrderValue: 150 // This would come from the API
        });
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Error loading cart:', err);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.05; // 5% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const deliveryFee = restaurantInfo?.deliveryFee || 0;
    return subtotal + tax + deliveryFee - appliedDiscount;
  };

  const handleQuantityChange = async (itemId: string, change: number) => {
    try {
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return;

      const newQuantity = Math.max(1, item.quantity + change);
      await apiService.order.updateCartItem(itemId, newQuantity, item.specialInstructions || '');
      await loadCart(); // Refresh cart
    } catch (err) {
      console.error('Error updating cart item:', err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await apiService.order.removeFromCart(itemId);
      await loadCart(); // Refresh cart
    } catch (err) {
      console.error('Error removing cart item:', err);
    }
  };

  const handleApplyDiscount = () => {
    // Simple discount logic - in real app, this would validate with backend
    if (discountCode.toUpperCase() === 'WELCOME10') {
      setAppliedDiscount(calculateSubtotal() * 0.1); // 10% off
    } else if (discountCode.toUpperCase() === 'SAVE50') {
      setAppliedDiscount(Math.min(calculateSubtotal(), 50)); // ₹50 off or subtotal, whichever is less
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Validate minimum order value
    const subtotal = calculateSubtotal();
    if (restaurantInfo && subtotal < restaurantInfo.minOrderValue) {
      alert(`Minimum order value is ₹${restaurantInfo.minOrderValue}`);
      return;
    }

    setPaymentModalVisible(true);
  };

  const handlePlaceOrder = async () => {
    try {
      // In real app, this would send order to backend
      // For now, we'll just clear the cart
      await apiService.order.clearCart();
      alert('Order placed successfully!');
      setPaymentModalVisible(false);
      // Clear cart after order
      setCartItems([]);
      setAppliedDiscount(0);
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
    }
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
        <TouchableOpacity style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Cart</Text>
      </View>

      {/* Restaurant Info */}
      {restaurantInfo && (
        <View style={styles.restaurantInfo}>
          <Image
            source={{ uri: restaurantInfo.imageUrl }}
            style={styles.restaurantImage}
            fallback={require('../assets/placeholder.png')}
          />
          <View style={styles.restaurantDetails}>
            <Text style={styles.restaurantName}>{restaurantInfo.name}</Text>
            <Text style={styles.restaurantStatus}>
              {restaurantInfo.deliveryFee === 0 ? 'Free' : `₹${restaurantInfo.deliveryFee}`} delivery
            </Text>
          </View>
        </View>
      )}

      {/* Cart Items */}
      {cartItems.length > 0 ? (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.itemImage}
                fallback={require('../assets/placeholder.png')}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
                <View style={styles.itemTags}>
                  {item.isVegetarian && (
                    <Text style={styles.vegTag}>🌱 Veg</Text>
                  )}
                  {item.isVegan && (
                    <Text style={styles.veganTag}>🌿 Vegan</Text>
                  )}
                  {item.isSpicy && (
                    <Text style={styles.spicyTag}>🌶️ Spicy</Text>
                  )}
                </View>
                {item.specialInstructions && (
                  <Text style={styles.specialInstructions}>
                    {item.specialInstructions}
                  </Text>
                )}
                <View style={styles.itemFooter}>
                  <View style={styles.priceQuantity}>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, -1)}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(item.id)}
                  >
                    <MaterialCommunityIcons name="delete" size={20} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyCart}>
          <MaterialCommunityIcons name="cart-outline" size={48} color="#ddd" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add some delicious food to get started!</Text>
        </View>
      )}

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>₹{calculateSubtotal().toFixed(0)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (5%):</Text>
          <Text style={styles.summaryValue}>₹{calculateTax().toFixed(0)}</Text>
        </View>
        {restaurantInfo && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
            <Text style={styles.summaryValue}>₹{restaurantInfo.deliveryFee}</Text>
          </View>
        )}
        {appliedDiscount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text style={styles.summaryValue discount}>−₹{appliedDiscount.toFixed(0)}</Text>
          </View>
        )}
        <View style={styles.summaryRow total}>
          <Text style={styles.summaryLabel total}>Total:</Text>
          <Text style={styles.summaryValue total}>₹{calculateTotal().toFixed(0)}</Text>
        </View>
      </View>

      {/* Discount Code Input */}
      <View style={styles.discountContainer}>
        <TextInput
          placeholder="Enter discount code"
          value={discountCode}
          onChangeText={setDiscountCode}
          style={styles.discountInput}
        />
        <TouchableOpacity style={styles.discountButton} onPress={handleApplyDiscount}>
          <Text style={styles.discountButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        style={[
          styles.checkoutButton,
          cartItems.length === 0 ? styles.buttonDisabled : null
        ]}
        onPress={handleCheckout}
      >
        <Text style={styles.checkoutButtonText}>
          PROCEED TO CHECKOUT
        </Text>
      </TouchableOpacity>

      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Payment Method</Text>
            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={styles.paymentOption}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="credit-card" size={24} color="#FF6B35" />
                <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.paymentOption}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="wallet" size={24} color="#FF6B35" />
                <Text style={styles.paymentOptionText}>Wallet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.paymentOption}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="bank" size={24} color="#FF6B35" />
                <Text style={styles.paymentOptionText}>UPI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.paymentOption}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="cash" size={24} color="#FF6B35" />
                <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handlePlaceOrder}
              >
                <Text style={styles.confirmButtonText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginTop: 12,
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
  restaurantStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  itemDetails: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  vegTag: {
    backgroundColor: '#d4edda',
    color: '#155724',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    marginRight: 6,
  },
  veganTag: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    marginRight: 6,
  },
  spicyTag: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    marginRight: 6,
  },
  specialInstructions: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  quantityControls: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  emptyCart: {
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
    textAlign: 'center',
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  discountContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    marginTop: 12,
  },
  discountInput: {
    flex: 1,
    height: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginRight: 8,
  },
  discountButton: {
    width: 60,
    height: 36,
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#ddd',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  paymentOptions: {
    marginBottom: 24,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  paymentOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});