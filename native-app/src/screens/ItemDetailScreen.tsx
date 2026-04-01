import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://your-backend-url.com'; // Update with actual backend URL

export default function ItemDetailScreen({ route, navigation }: any) {
  const { itemId } = route.params;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [renting, setRenting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchItemDetails();
  }, [itemId]);

  const fetchItemDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/items/${itemId}`);
      const data = await response.json();
      setItem(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleRentItem = async () => {
    if (!user) return;

    setRenting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/rentals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Rental request sent to seller');
        navigation.navigate('Rentals');
      } else {
        Alert.alert('Error', 'Failed to send rental request');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setRenting(false);
    }
  };

  const handleContactSeller = () => {
    if (item?.seller_id) {
      navigation.navigate('Messages', { userId: item.seller_id });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{item.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>${item.daily_price}/day</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>★ {item.seller_rating}</Text>
          </View>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Condition</Text>
            <Text style={styles.detailValue}>{item.condition}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{item.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{item.category}</Text>
          </View>
        </View>

        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>About the Seller</Text>
          <View style={styles.sellerInfo}>
            <View>
              <Text style={styles.sellerName}>{item.seller_name}</Text>
              <Text style={styles.sellerRating}>
                {item.seller_reviews} reviews
              </Text>
            </View>
          </View>
        </View>

        {user?.id !== item.seller_id && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.contactButton]}
              onPress={handleContactSeller}
            >
              <Text style={styles.contactButtonText}>Message Seller</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rentButton, renting && styles.buttonDisabled]}
              onPress={handleRentItem}
              disabled={renting}
            >
              <Text style={styles.rentButtonText}>
                {renting ? 'Sending...' : 'Request to Rent'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e1e1e',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  ratingContainer: {
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ratingStars: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1e1e1e',
    fontWeight: '700',
  },
  sellerSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e1e1e',
    marginBottom: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e1e1e',
  },
  sellerRating: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButton: {
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  contactButtonText: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '600',
  },
  rentButton: {
    backgroundColor: '#1e3a8a',
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
  },
});
