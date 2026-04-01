import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setupFirebasePushNotifications = async () => {
  try {
    // Request permissions
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Auth status:', authStatus);

      // Get FCM token
      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      // Save token to AsyncStorage for later use
      await AsyncStorage.setItem('fcmToken', token);

      // Handle token refresh
      messaging().onTokenRefresh((token) => {
        console.log('Token refreshed:', token);
        AsyncStorage.setItem('fcmToken', token);
        // Send token to your backend
        saveTokenToBackend(token);
      });

      // Handle incoming messages
      messaging().onMessage(async (remoteMessage) => {
        console.log('New message received:', remoteMessage);
        handleNotification(remoteMessage);
      });

      // Handle notification when app is closed/in background
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background message:', remoteMessage);
      });

      return token;
    } else {
      console.log('User declined permissions');
    }
  } catch (error) {
    console.error('Firebase setup error:', error);
  }
};

const saveTokenToBackend = async (token: string) => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    // Call your backend API to save the token
    // await fetch(`${API_URL}/api/users/fcm-token`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${authToken}`,
    //   },
    //   body: JSON.stringify({ fcmToken: token }),
    // });
  } catch (error) {
    console.error('Error saving token to backend:', error);
  }
};

const handleNotification = (message: any) => {
  // Handle notification display
  // You can use react-native-push-notification or similar library
  console.log('Notification:', {
    title: message.notification?.title,
    body: message.notification?.body,
    data: message.data,
  });
};

export default {
  setupFirebasePushNotifications,
  saveTokenToBackend,
  handleNotification,
};
