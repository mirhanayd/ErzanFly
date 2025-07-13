import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Theme
import { lightTheme, darkTheme } from './src/theme/theme';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import WatchlistScreen from './src/screens/WatchlistScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FlightDetailsScreen from './src/screens/FlightDetailsScreen';

// Services
import NotificationService from './src/services/NotificationService';

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  FlightDetails: { flight: any };
};

export type TabParamList = {
  Home: undefined;
  Search: { query?: string; from?: string; to?: string } | undefined;
  Watchlist: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'magnify' : 'magnify';
              break;
            case 'Watchlist':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help-circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1976D2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          headerTitle: 'ErzanFly',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Ara',
          headerTitle: 'Uçuş Ara',
        }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          tabBarLabel: 'Takip',
          headerTitle: 'Takip Listesi',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          headerTitle: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize notification service
      await NotificationService.initialize();
      
      // Schedule price check background job
      await NotificationService.schedulePriceCheck();
      
      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsReady(true); // Continue even if initialization fails
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.primary}
        />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="MainTabs"
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: theme.colors.onPrimary,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="FlightDetails"
              component={FlightDetailsScreen}
              options={{
                headerTitle: 'Uçuş Detayları',
                headerBackTitle: 'Geri',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default App;