import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://your-backend-url.com'; // Update with actual backend URL

const CATEGORIES = ['Electronics', 'Sports', 'Outdoors', 'Books', 'Furniture'];

export default function CreateListingScreen({ navigation }: any) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [condition, setCondition] = useState('Like New');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets[0]) {
        setImage(response.assets[0]);
      }
    });
  };

  const handleCreateListing = async () => {
    if (!name || !description || !dailyPrice || !location) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (isNaN(parseFloat(dailyPrice))) {
      Alert.alert('Validation Error', 'Daily price must be a valid number');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      const formData = new FormData();

      formData.append('name', name);
      formData.append('description', description);
      formData.append('daily_price', dailyPrice);
      formData.append('category', category);
      formData.append('condition', condition);
      formData.append('location', location);

      if (image?.uri) {
        formData.append('image', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || 'listing.jpg',
        } as any);
      }

      const response = await fetch(`${API_URL}/api/items`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Success', 'Listing created successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to create listing');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create New Listing</Text>

        {/* Image Upload */}
        <TouchableOpacity style={styles.imageUpload} onPress={handleSelectImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadText}>📷</Text>
              <Text style={styles.uploadLabel}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Item Name */}
        <Text style={styles.label}>Item Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Mountain Bike"
          value={name}
          onChangeText={setName}
        />

        {/* Category */}
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  category === cat && styles.categoryButtonTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the condition, features, and why you recommend it"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Daily Price */}
        <Text style={styles.label}>Daily Price ($) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 25"
          value={dailyPrice}
          onChangeText={setDailyPrice}
          keyboardType="decimal-pad"
        />

        {/* Condition */}
        <Text style={styles.label}>Condition</Text>
        <View style={styles.conditionContainer}>
          {['Like New', 'Good', 'Fair'].map((cond) => (
            <TouchableOpacity
              key={cond}
              style={[
                styles.conditionButton,
                condition === cond && styles.conditionButtonActive,
              ]}
              onPress={() => setCondition(cond)}
            >
              <Text
                style={[
                  styles.conditionButtonText,
                  condition === cond && styles.conditionButtonTextActive,
                ]}
              >
                {cond}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location */}
        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Student Center, Building A"
          value={location}
          onChangeText={setLocation}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleCreateListing}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Listing</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e1e1e',
    marginBottom: 24,
  },
  imageUpload: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#1e3a8a',
  },
  uploadText: {
    fontSize: 48,
    marginBottom: 8,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e1e1e',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  conditionContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  conditionButtonActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  conditionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  conditionButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  cancelButton: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
