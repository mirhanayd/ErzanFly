import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-push-notification', () => {
  return {
    configure: jest.fn(),
    localNotification: jest.fn(),
    localNotificationSchedule: jest.fn(),
    cancelLocalNotifications: jest.fn(),
    cancelAllLocalNotifications: jest.fn(),
    createChannel: jest.fn(),
    requestPermissions: jest.fn(),
  };
});

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

jest.mock('react-native-linear-gradient', () => 'LinearGradient');