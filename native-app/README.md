# React Native App - Complete Setup Guide

## Project Structure

```
native-app/
├── src/
│   ├── screens/           # All app screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ItemDetailScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── MessagesScreen.tsx
│   │   ├── RentalsScreen.tsx
│   │   ├── MapScreen.tsx
│   │   └── CreateListingScreen.tsx
│   ├── context/           # State management
│   │   └── AuthContext.tsx
│   ├── utils/             # Utility files
│   │   ├── apiClient.ts   # API client with caching
│   │   └── firebase.ts    # Firebase push notifications
│   └── types/             # TypeScript types
│       └── index.ts
├── App.tsx                # Root component with navigation
├── package.json
├── .env.example           # Environment variables template
├── google-services.json   # Firebase Android config
└── GoogleService-Info.plist # Firebase iOS config
```

## Prerequisites

- Node.js 14+ and npm/yarn
- Xcode 13+ (for iOS development)
- Android Studio (for Android development)
- Watchman (for macOS, install via `brew install watchman`)
- CocoaPods (for iOS, install via `sudo gem install cocoapods`)

## Installation

### 1. Install Dependencies

```bash
cd native-app
npm install
# or
yarn install
```

### 2. Update Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `REACT_APP_API_URL` to point to your backend:

```
REACT_APP_API_URL=http://your-backend-url.com
```

### 3. iOS Setup

#### Install CocoaPods dependencies:

```bash
cd ios
pod install
cd ..
```

#### Configure Xcode:

1. Open `ios/Lendora.xcworkspace` in Xcode
2. Select the "Lendora" project in the Project Navigator
3. Go to Signing & Capabilities
4. Select your team from the dropdown
5. Ensure the bundle ID is `com.yourcompany.lendora`

#### Run iOS:

```bash
npm run ios
# or
react-native run-ios
```

### 4. Android Setup

#### Update Android package name:

1. Open `android/app/build.gradle`
2. Change `applicationId` to your app package name (e.g., `"com.yourcompany.lendora"`)

#### Add Android keystore (for release builds):

```bash
# Generate keystore
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

#### Run Android:

```bash
npm run android
# or
react-native run-android
```

## Firebase Setup (Push Notifications)

### 1. Create Firebase Project

- Go to [Firebase Console](https://console.firebase.google.com)
- Create a new project named "Lendora"
- Add iOS and Android apps

### 2. Download Configuration Files

**For Android:**
- Download `google-services.json` and place in `android/app/`

**For iOS:**
- Download `GoogleService-Info.plist` and add to Xcode project

### 3. Enable Cloud Messaging

- In Firebase Console: Project Settings → Cloud Messaging
- Copy your Server API Key
- Paste in backend `.env` as `FIREBASE_SERVER_KEY`

See detailed Firebase setup in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## Running the App

### Development Mode

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

### Metro Bundler

In a separate terminal, start the Metro bundler:
```bash
npm start
# or
react-native start
```

### Debug Mode

**iOS:** Shake device and select "Debug" from menu
**Android:** Press Ctrl+M (or Cmd+M on Mac) and select "Debug"

## Building for Release

### iOS Release Build

```bash
npm run build:ios
```

Or manually in Xcode:
1. Select Generic iOS Device
2. Product → Archive
3. Distribute App → Ad Hoc or App Store

### Android Release Build

```bash
npm run build:android
```

The release APK will be at: `android/app/build/outputs/bundle/release/app-release.aab`

## API Configuration

Update the API URL in `src/utils/apiClient.ts`:

```typescript
const API_URL = 'http://your-backend-url.com';
```

Or in your `.env`:

```
REACT_APP_API_URL=http://your-backend-url.com
```

## Screens Overview

### Authentication
- **LoginScreen**: Email/password login with test credentials
- **RegisterScreen**: New account creation with validation

### Main Navigation (Tab-based)

1. **Explore** - Browse available items
   - Item list with search and categories
   - Item detail view

2. **Map** - View nearby items on map
   - Geolocation-based item discovery
   - Map markers with preview

3. **Sell** - List items for rent
   - Create new listing form
   - Manage existing listings

4. **Messages** - Chat with users
   - Conversation list
   - Individual chat threads

5. **Rentals** - Track rental activity
   - Filter by status (Active/Pending/Completed)
   - Rental details

6. **Profile** - User profile and settings
   - User info and stats
   - My listings
   - Settings and logout

## Features

✅ Full authentication (login/register)
✅ Browse and search items
✅ Item details with images
✅ Map view with geolocation
✅ User profiles and ratings
✅ Rentals management
✅ In-app messaging
✅ Create and manage listings
✅ Offline support (data persistence)
✅ Firebase push notifications
✅ Caching and optimized API calls

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
npm start -- --reset-cache
```

### Pod Issues (iOS)
```bash
cd ios
rm -rf Pods
rm Podfile.lock
pod install
cd ..
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### JavaScript Errors
- Check console: `react-native log-ios` or `react-native log-android`
- Use Chrome DevTools: Global menu → Debug

## Testing

### Unit Tests
```bash
npm test
```

### Manual Testing Checklist
- [ ] Login/Register flow
- [ ] Browse items
- [ ] Send rental request
- [ ] Message seller
- [ ] View rentals
- [ ] Create new listing
- [ ] Update profile
- [ ] Logout

## Environment Variables

Set in `.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API endpoint | `http://localhost:3000` |
| `REACT_APP_FIREBASE_*` | Firebase config | See Firebase docs |
| `REACT_APP_ENV` | Environment (dev/prod) | `development` |

## Performance Optimization

- Images are cached
- API responses cached for 5 minutes
- Lazy loading for lists
- Gesture handler for smooth animations
- Map optimized for mobile

## Security

- Passwords hashed with bcryptjs on backend
- JWT tokens stored in secure AsyncStorage
- HTTPS enforced in production
- Input validation on frontend and backend
- CORS properly configured

## Deployment

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for:
- TestFlight beta testing (iOS)
- Google Play Store internal testing (Android)
- App Store and Play Store submission

## Support

For issues or questions:
1. Check [troubleshooting](#troubleshooting) section
2. Review React Navigation docs: https://reactnavigation.org
3. Check React Native docs: https://reactnative.dev
4. Firebase docs: https://firebase.google.com/docs

## License

MIT License - free to use and modify

## Next Steps

1. ✅ Complete app structure and screens
2. ⏳ Set up Firebase project (see Firebase Setup)
3. ⏳ Deploy backend to Railway/Render
4. ⏳ Update API URL in `.env`
5. ⏳ Test on iOS simulator/device
6. ⏳ Test on Android emulator/device
7. ⏳ Submit to App Store and Google Play
