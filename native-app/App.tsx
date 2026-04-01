import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Text } from 'react-native';

// Error Boundary
import ErrorBoundary from './src/components/ErrorBoundary';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import RentalsScreen from './src/screens/RentalsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MapScreen from './src/screens/MapScreen';
import CreateListingScreen from './src/screens/CreateListingScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: '#1e3a8a',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: '700',
    fontSize: 18,
  },
  headerShadowVisible: false,
};

// Stack Navigators for each tab
function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ExploreHome"
        component={HomeScreen}
        options={{ title: 'Lendora' }}
      />
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{ title: 'Item Details' }}
      />
    </Stack.Navigator>
  );
}

function MapStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="MapHome"
        component={MapScreen}
        options={{ title: 'Nearby Items' }}
      />
      <Stack.Screen
        name="MapItemDetail"
        component={ItemDetailScreen}
        options={{ title: 'Item Details' }}
      />
    </Stack.Navigator>
  );
}

function SellStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="CreateListingHome"
        component={CreateListingScreen}
        options={{ title: 'Create Listing' }}
      />
      <Stack.Screen
        name="ListingDetail"
        component={ItemDetailScreen}
        options={{ title: 'Listing Details' }}
      />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="MessagesHome"
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen
        name="Chat"
        component={MessagesScreen}
        options={({ route }: any) => ({
          title: route.params?.otherUserName || 'Chat',
        })}
      />
    </Stack.Navigator>
  );
}

function RentalsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="RentalsHome"
        component={RentalsScreen}
        options={{ title: 'My Rentals' }}
      />
      <Stack.Screen
        name="RentalDetail"
        component={ItemDetailScreen}
        options={{ title: 'Rental Details' }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="ProfileMessages"
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen
        name="ProfileCreateListing"
        component={CreateListingScreen}
        options={{ title: 'New Listing' }}
      />
    </Stack.Navigator>
  );
}

// App Navigator (when logged in)
function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          borderTopWidth: 1,
          paddingBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="ExploreStack"
        component={ExploreStack}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }: any) => <Text style={{ fontSize: 20, color }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="MapStack"
        component={MapStack}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color }: any) => <Text style={{ fontSize: 20, color }}>📍</Text>,
        }}
      />
      <Tab.Screen
        name="SellStack"
        component={SellStack}
        options={{
          tabBarLabel: 'Sell',
          tabBarIcon: ({ color }: any) => <Text style={{ fontSize: 20, color }}>📤</Text>,
        }}
      />
      <Tab.Screen
        name="MessagesStack"
        component={MessagesStack}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color }: any) => <Text style={{ fontSize: 20, color }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="RentalsStack"
        component={RentalsStack}
        options={{
          tabBarLabel: 'Rentals',
          tabBarIcon: ({ color }: any) => <Text style={{ fontSize: 20, color }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }: any) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Navigator
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Replace with splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// App Component
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <RootNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}
