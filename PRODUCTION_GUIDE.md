# Lendora - Production Grade Application

## Architecture Overview

This is a production-grade React Native application with professional-level error handling, logging, caching, and configuration management.

### Core Features

✅ **Robust Error Handling**
- Global Error Boundary component
- Graceful error recovery
- User-friendly error messages
- Development error details

✅ **Comprehensive Logging**
- Centralized logging system
- Multiple log levels (DEBUG, INFO, WARN, ERROR)
- Automatic error service integration ready
- Log export for debugging

✅ **Smart Caching**
- Request deduplication
- TTL-based cache expiration
- Cache statistics and management
- Network-aware caching

✅ **Advanced API Client**
- Automatic retry with exponential backoff
- Request/response logging
- Custom error handling
- Token management

✅ **Environment Configuration**
- Development, Staging, Production configs
- Environment-specific settings
- Runtime configuration updates
- Externalized secrets management

✅ **Input Validation**
- 12+ built-in validators
- Form validation helper
- User-friendly error messages
- Type-safe validation rules

✅ **Security Features**
- JWT token management
- Secure credential storage
- Password strength validation
- HTTPS enforced in production

## Project Structure

```
native-app/
├── src/
│   ├── components/
│   │   └── ErrorBoundary.tsx      # Global error handling
│   ├── context/
│   │   └── AuthContext.tsx         # Authentication state
│   ├── screens/                    # All app screens (8 total)
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ItemDetailScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── MessagesScreen.tsx
│   │   ├── RentalsScreen.tsx
│   │   └── MapScreen.tsx
│   ├── utils/
│   │   ├── apiClient.ts            # Enhanced API client with retries
│   │   ├── config.ts               # Environment configuration
│   │   ├── logger.ts               # Centralized logging
│   │   ├── validators.ts           # Input validation rules
│   │   └── firebase.ts             # Push notifications
│   └── types/
│       └── index.ts                # TypeScript type definitions
├── App.tsx                         # Root component with error boundary
├── app.json                        # App configuration
├── package.json
└── README.md
```

## Configuration Management

### Environment-Specific Settings

The app automatically loads configuration based on environment:

**Development:**
- Debug logging enabled
- Local API endpoints
- Analytics disabled
- Crash reporting disabled

**Staging:**
- Info logging
- Staging API endpoints
- Analytics enabled
- Crash reporting enabled

**Production:**
- Warning logging only
- Production API endpoints
- Analytics enabled
- Crash reporting enabled
- Extended cache TTL

### Customizing Configuration

Update API URL:

```typescript
import { config } from './src/utils/config';

config.setApiUrl('https://your-api.com');
```

Check current configuration:

```typescript
console.log(config.appConfig);
console.log(config.getAppInfo());
```

## Error Handling

### Error Boundary Component

Catches all React errors and displays user-friendly error UI:

```typescript
// Automatically wraps entire app in App.tsx
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

### API Error Handling

All API errors are handled consistently:

```typescript
try {
  const data = await apiClient.get('/api/items');
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.statusCode); // HTTP status
    console.log(error.message);    // Error message
  }
}
```

### Automatic Retry Logic

Network errors automatically retry with exponential backoff:
- Maximum 3 retries
- Delay: 1s → 2s → 4s
- Retries for: Connection errors, 5xx errors

## Logging System

### Using the Logger

```typescript
import { log } from './src/utils/logger';

log.debug('Debug message', data);
log.info('Info message');
log.warn('Warning message');
log.error('Error occurred', error, context);
```

### Accessing Logs

```typescript
// Get all logs
const allLogs = log.getLogs();

// Get specific level logs
const errorLogs = log.getLogs(LogLevel.ERROR);

// Export logs (for support/debugging)
const logsJson = log.exportLogs();

// Clear logs
log.clearLogs();
```

## Caching Strategy

### GET Request Caching

Enabled by default with 5-minute TTL:

```typescript
// Uses cache (default)
const data = await apiClient.get('/api/items');

// Skip cache
const data = await apiClient.get('/api/items', { useCache: false });

// Custom cache TTL (10 minutes)
const data = await apiClient.get('/api/items', { 
  cacheTtl: 10 * 60 * 1000 
});
```

### Cache Management

```typescript
// Check cache stats
const stats = apiClient.getCacheStats();

// Clear all cache
apiClient.clearCache();

// Clear specific pattern
apiClient.clearCache('GET:/api/items');
```

## Input Validation

### Using Validators

```typescript
import { validators, validationRules, validateForm } from './src/utils/validators';

// Single field validation
if (!validators.isValidEmail(email)) {
  // Show error
}

// Form validation with rules
const errors = validateForm(formData, {
  email: validationRules.email,
  password: validationRules.password,
  name: validationRules.name,
});

if (Object.keys(errors).length > 0) {
  // Show errors
}
```

### Available Validators

- `isValidEmail(email)` - Email format
- `isValidPassword(password)` - Password strength (8+ chars, uppercase, lowercase, number)
- `isValidName(name)` - Name length (2-100 chars)
- `isValidPhoneNumber(phone)` - Phone number format
- `isValidUrl(url)` - URL format
- `isValidPrice(price)` - Price range (0-999,999)
- `isValidDate(date)` - Valid date
- `isFutureDate(date)` - Date is in future
- `isValidLength(value, min, max)` - String length
- `isRequired(value)` - Non-empty value
- `isNumeric(value)` - Numeric string
- `isAlphanumeric(value)` - Alphanumeric string

## API Error Handling

### Error Types

```typescript
// HTTP errors
const errors = {
  400: 'Bad Request - Invalid input',
  401: 'Unauthorized - Please login',
  403: 'Forbidden - Access denied',
  404: 'Not Found',
  500: 'Server Error',
  503: 'Service Unavailable',
};
```

### Handling Specific Errors

```typescript
try {
  await apiClient.post('/api/rentals', rentalData);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.statusCode === 400) {
      // Invalid input
      Alert.alert('Validation Error', error.message);
    } else if (error.statusCode === 401) {
      // Need re-auth
      navigation.navigate('Login');
    } else {
      // Generic error
      Alert.alert('Error', error.message);
    }
  }
}
```

## Performance Optimization

### Caching Strategy
- GET requests cached for 5 minutes
- Automatic cache invalidation
- Request deduplication

### Network Optimization
- Automatic retries for failed requests
- Exponential backoff to avoid overwhelming server
- Request timeouts (15 seconds)

### UI Optimization
- FlatList for efficient rendering
- Lazy loading for lists
- Modal animations
- Navigation optimization

## Security Considerations

### Authentication
- JWT tokens stored in AsyncStorage
- Automatic token refresh on 401
- Secure logout clears tokens

### Data Protection
- HTTPS required in production
- Input validation on frontend + backend
- No sensitive data in logs
- Error messages don't leak secrets

### Best Practices
- Never hardcode secrets
- Use environment variables
- Implement token rotation
- Regular security audits

## Testing Checklist

Before production:

- [ ] All screens render without errors
- [ ] Error boundary catches errors gracefully
- [ ] API client retries failed requests
- [ ] Caching works correctly
- [ ] Validation works for all forms
- [ ] Authentication flow works
- [ ] Logout clears all data
- [ ] Offline handling (cache) works
- [ ] Push notifications configured
- [ ] Analytics tracking works
- [ ] Crash reporting configured
- [ ] Build succeeds for iOS
- [ ] Build succeeds for Android

## Monitoring & Analytics

### Error Tracking
Configure Sentry or Crashlytics in `src/utils/logger.ts`:

```typescript
// In sendToService() method
import * as Sentry from "@sentry/react-native";
Sentry.captureException(entry);
```

### Performance Monitoring
Track API response times and cache hits:

```typescript
// Logs include timing information
log.debug('API Response:', { 
  status,
  url,
  duration, 
  fromCache 
});
```

### User Analytics
Event tracking for key flows:
- Login/Register
- Item browsing
- Rental requests
- Messaging

## Deployment Checklist

### Before Building for App Store

1. **Configuration**
   - [ ] Set production API URL
   - [ ] Enable crash reporting
   - [ ] Enable analytics
   - [ ] Configure Firebase

2. **Icons & Splash**
   - [ ] App icon (1024x1024)
   - [ ] Splash screen
   - [ ] Adaptive icons (Android)

3. **Signing**
   - [ ] iOS signing certificates
   - [ ] Android keystore
   - [ ] Provisioning profiles

4. **Testing**
   - [ ] Complete user flow
   - [ ] Error scenarios
   - [ ] Offline behavior
   - [ ] Push notifications

5. **Documentation**
   - [ ] Privacy Policy
   - [ ] Terms of Service
   - [ ] Support contact info

## Maintenance & Updates

### Regular Tasks

- Monitor error logs weekly
- Review analytics monthly
- Update dependencies quarterly
- Security patches immediately
- Performance optimization quarterly

### Version Management

Update in `app.json` and `package.json`:

```json
{
  "version": "1.0.0",
  "expo": {
    "version": "1.0.0",
    "ios": { "buildNumber": "1" },
    "android": { "versionCode": 1 }
  }
}
```

## Support & Troubleshooting

### Common Issues

**App crashes on startup**
- Check Error Boundary logs
- Review logger output
- Check configuration

**API calls fail**
- Check network connectivity
- Verify API URL
- Check authentication token
- Review API error logs

**Cache not working**
- Invalid cache keys
- TTL expired
- Cache cleared
- Check cache stats

### Debugging

```typescript
// Enable detailed logging
import { log } from './src/utils/logger';
const recentLogs = log.getRecentLogs(100);
console.log(JSON.stringify(recentLogs, null, 2));

// Export logs for analysis
const allLogs = log.exportLogs();
```

## Resources

- [Redux Documentation](https://redux.js.org) (future implementation)
- [React Navigation Docs](https://reactnavigation.org)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Sentry Error Tracking](https://sentry.io)
- [Expo Documentation](https://docs.expo.dev)

## License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0
**Last Updated**: April 2026
**Status**: Production Ready
