import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://your-backend-url.com'; // Update with actual backend URL

type TabType = 'active' | 'pending' | 'completed';

export default function RentalsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      if (!user?.id) return;

      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/rentals/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRentals(data);
    } catch (error) {
      console.error('Failed to load rentals', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRentals = () => {
    return rentals.filter((rental) => {
      if (activeTab === 'active') return rental.status === 'Active';
      if (activeTab === 'pending') return rental.status === 'Pending';
      if (activeTab === 'completed') return rental.status === 'Completed';
      return true;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return '#4caf50';
      case 'Pending':
        return '#ff9800';
      case 'Completed':
        return '#999';
      default:
        return '#1e3a8a';
    }
  };

  const filteredRentals = getFilteredRentals();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['active', 'pending', 'completed'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rentals List */}
      <FlatList
        data={filteredRentals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.rentalCard}
            onPress={() =>
              navigation.navigate('RentalDetail', { rentalId: item.id })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.itemName}>{item.item_name}</Text>
              <Text
                style={[
                  styles.status,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status}
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>From</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.start_date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>To</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.end_date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>Total</Text>
                <Text style={styles.detailValue}>${item.total_price}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.sellerName}>
                Renting from: {item.seller_name}
              </Text>
              {item.status === 'Active' && (
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Message Seller</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} rentals</Text>
            <Text style={styles.emptySubtext}>
              Start browsing items to rent
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
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#1e3a8a',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#1e3a8a',
  },
  rentalCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e1e1e',
    flex: 1,
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  detail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#1e1e1e',
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e1e1e',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
