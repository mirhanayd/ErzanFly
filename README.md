# ErzanFly - React Native Flight Tracking App

ErzanFly is a modern React Native application that helps users track flight prices from Turkish airlines (Pegasus and AJet) and get notified when prices drop to their desired levels.

## Features

### 🛫 Flight Search
- Search flights from Pegasus and AJet airlines
- Filter by departure/arrival airports, dates, and passenger count
- Real-time price comparison
- One-way and round-trip options
- Detailed flight information including duration, stops, and baggage

### 📱 Modern UI/UX
- Material Design 3 components
- Smooth animations and transitions
- Responsive design for all screen sizes
- Dark and light theme support
- Linear gradients for enhanced visual appeal

### 💰 Price Tracking
- Add flights to watchlist with target prices
- Real-time price monitoring
- Price history tracking
- Push notifications for price drops
- Price change alerts with percentage calculations

### 🔔 Smart Notifications
- Push notifications for price drops
- Background price monitoring
- Customizable notification preferences
- Notification history management
- Rich notification content with flight details

### 👤 User Profile
- Personalized user settings
- Notification preferences
- Currency selection (TRY, USD, EUR, GBP)
- Multi-language support (English, Turkish)
- Theme customization

## Technical Architecture

### Technology Stack
- **React Native 0.73.0** - Latest stable version
- **TypeScript** - Type-safe development
- **React Navigation 6** - Navigation management
- **React Native Paper** - Material Design components
- **AsyncStorage** - Local data persistence
- **React Native Push Notification** - Push notification system
- **React Native Linear Gradient** - Gradient backgrounds
- **React Native Reanimated** - Smooth animations
- **React Native Vector Icons** - Icon library

### Project Structure
```
ErzanFly/
├── src/
│   ├── screens/           # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── WatchlistScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── FlightDetailsScreen.tsx
│   ├── services/          # Business logic
│   │   ├── FlightService.ts
│   │   └── NotificationService.ts
│   ├── theme/             # Theme configuration
│   │   └── theme.ts
│   ├── types/             # TypeScript definitions
│   │   └── index.ts
│   └── components/        # Reusable components
├── App.tsx               # Main app component
├── index.js              # Entry point
├── package.json          # Dependencies
└── README.md            # This file
```

### Key Components

#### FlightService
- Handles API integration with Pegasus and AJet
- Mock data implementation for demonstration
- Real-time price tracking
- Airport data management

#### NotificationService
- Push notification configuration
- Background job scheduling
- Notification history management
- Price alert system

#### Theme System
- Material Design 3 theming
- Light and dark theme support
- Custom color palette
- Consistent typography

## Installation

### Prerequisites
- Node.js (≥16.0.0)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/mirhanayd/ErzanFly.git
   cd ErzanFly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (iOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Android Setup**
   - Open Android Studio
   - Configure Android SDK
   - Create virtual device or connect physical device

5. **Run the app**
   ```bash
   # For Android
   npm run android

   # For iOS
   npm run ios
   ```

## Configuration

### API Integration
Currently, the app uses mock data for demonstration. To integrate with real APIs:

1. **Pegasus API Configuration**
   - Update `FlightService.ts` with Pegasus API credentials
   - Implement actual API calls in `callPegasusAPI` method

2. **AJet API Configuration**
   - Update `FlightService.ts` with AJet API credentials
   - Implement actual API calls in `callAJetAPI` method

### Push Notifications
1. **Android Configuration**
   - Add `google-services.json` to `android/app/`
   - Configure Firebase Cloud Messaging

2. **iOS Configuration**
   - Add APNs certificates
   - Configure push notification capabilities

## Usage

### Home Screen
- Quick access to flight search
- Popular flight recommendations
- Travel tips and recommendations
- Direct navigation to watchlist and profile

### Flight Search
- Select departure and arrival airports
- Choose travel dates
- Set passenger count
- View search results with price comparison
- Sort by price, duration, or airline

### Watchlist Management
- Add flights to watchlist with target prices
- Monitor price changes in real-time
- Enable/disable notifications per flight
- Edit target prices
- Remove flights from watchlist

### Flight Details
- Comprehensive flight information
- Price history tracking
- Add to watchlist functionality
- Share flight details
- Book directly with airline

### Profile Settings
- Edit personal information
- Configure notification preferences
- Select currency and language
- Theme customization
- View notification history

## Development

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- TypeScript for type safety
- Material Design guidelines

### Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Build
```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios
```

## Features in Detail

### Search Functionality
- **Multi-airline Search**: Compare prices across Pegasus and AJet
- **Flexible Dates**: Easy date selection with calendar picker
- **Passenger Management**: Support for multiple passengers
- **Airport Selection**: Comprehensive Turkish airport database
- **Real-time Results**: Live price updates

### Price Tracking
- **Watchlist Management**: Add/remove flights from watchlist
- **Target Price Alerts**: Set custom price thresholds
- **Price History**: Track price changes over time
- **Smart Notifications**: Intelligent price drop alerts
- **Background Monitoring**: Automatic price checking

### User Experience
- **Intuitive Navigation**: Bottom tab navigation
- **Smooth Animations**: Powered by Reanimated
- **Offline Support**: AsyncStorage for data persistence
- **Responsive Design**: Works on all screen sizes
- **Material Design**: Modern and consistent UI

## API Integration

### Mock Implementation
The current implementation uses mock data to demonstrate functionality:
- Generates realistic flight data
- Simulates price changes
- Provides comprehensive airport information
- Includes baggage and timing details

### Real API Integration
To integrate with actual airline APIs:

1. **Authentication**: Implement OAuth or API key authentication
2. **Rate Limiting**: Handle API rate limits appropriately
3. **Error Handling**: Robust error handling for API failures
4. **Data Transformation**: Convert API responses to app data format
5. **Caching**: Implement caching for better performance

## Performance Optimization

### Memory Management
- Efficient state management
- Proper cleanup of async operations
- Optimized image loading
- Background task management

### Battery Optimization
- Intelligent background job scheduling
- Efficient notification handling
- Optimized network requests
- Smart refresh intervals

## Security Considerations

### Data Protection
- Secure storage of user preferences
- Encrypted notification data
- Safe API key management
- Privacy-compliant data handling

### Network Security
- HTTPS for all API communications
- Certificate pinning for production
- Request validation and sanitization
- Secure token management

## Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use Material Design components
3. Implement proper error handling
4. Add unit tests for new features
5. Update documentation

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and merge

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## Changelog

### Version 1.0.0
- Initial release
- Flight search functionality
- Price tracking and watchlist
- Push notification system
- User profile management
- Material Design UI

---

**ErzanFly** - Making flight tracking simple and efficient for Turkish travelers.