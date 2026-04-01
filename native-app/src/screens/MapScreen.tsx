import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://your-backend-url.com'; // Update with actual backend URL

export default function MapScreen({ navigation }: any) {
  const { user } = useAuth();
  const [region, setRegion] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      // Get user's current location
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          fetchNearbyItems(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to San Francisco
          setRegion({
            latitude: 37.7749,
            longitude: -122.4194,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          fetchNearbyItems(37.7749, -122.4194);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error('Failed to initialize map', error);
      setLoading(false);
    }
  };

  const fetchNearbyItems = async (latitude: number, longitude: number) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}/api/items?lat=${latitude}&lng=${longitude}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (item: any) => {
    setSelectedMarker(item);
    setShowDetails(true);
  };

  const handleViewItem = () => {
    if (selectedMarker) {
      setShowDetails(false);
      navigation.navigate('ItemDetail', { itemId: selectedMarker.id });
    }
  };

  if (!region) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChange={setRegion}
      >
        {items.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: parseFloat(item.latitude || '37.7749'),
              longitude: parseFloat(item.longitude || '-122.4194'),
            }}
            title={item.name}
            description={`$${item.daily_price}/day`}
            onPress={() => handleMarkerPress(item)}
          />
        ))}
      </MapView>

      {/* Item Details Modal */}
      <Modal
        visible={showDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Item Details</Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedMarker && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.itemName}>{selectedMarker.name}</Text>
                <Text style={styles.itemPrice}>
                  ${selectedMarker.daily_price}/day
                </Text>
                <Text style={styles.itemCategory}>
                  {selectedMarker.category}
                </Text>
                <Text style={styles.itemDescription}>
                  {selectedMarker.description}
                </Text>

                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>
                    {selectedMarker.seller_name}
                  </Text>
                  <Text style={styles.sellerRating}>
                    ★ {selectedMarker.seller_rating}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={handleViewItem}
                >
                  <Text style={styles.detailButtonText}>View Full Details</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Loading Indicator for first load */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e1e1e',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e1e1e',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  itemCategory: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  sellerInfo: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e1e1e',
  },
  sellerRating: {
    fontSize: 14,
    color: '#1e3a8a',
    marginTop: 4,
  },
  detailButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
