import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Surface,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

import {theme} from '../theme/theme';
import {FlightService} from '../services/FlightService';
import {NotificationService} from '../services/NotificationService';
import {Flight, Airport} from '../types';

const {width} = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [popularFlights, setPopularFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const flightService = FlightService.getInstance();
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    loadPopularFlights();
  }, []);

  const loadPopularFlights = async () => {
    setLoading(true);
    try {
      const airports = await flightService.getAirports();
      const istanbulAirports = airports.filter(a => a.city === 'Istanbul');
      const otherAirports = airports.filter(a => a.city !== 'Istanbul');
      
      if (istanbulAirports.length > 0 && otherAirports.length > 0) {
        const flights = await flightService.searchFlights({
          from: istanbulAirports[0],
          to: otherAirports[0],
          departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          passengers: 1,
          tripType: 'oneWay',
        });
        setPopularFlights(flights.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading popular flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPopularFlights();
    setRefreshing(false);
  };

  const handleFlightPress = (flight: Flight) => {
    navigation.navigate('FlightDetails', {flight});
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const quickActions = [
    {
      title: 'Search Flights',
      icon: 'search',
      onPress: () => navigation.navigate('Search'),
      color: theme.colors.primary,
    },
    {
      title: 'My Watchlist',
      icon: 'favorite',
      onPress: () => navigation.navigate('Watchlist'),
      color: theme.colors.secondary,
    },
    {
      title: 'Price Alerts',
      icon: 'notifications',
      onPress: () => navigation.navigate('Profile'),
      color: theme.colors.tertiary,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Header Gradient */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="flight" size={32} color={theme.colors.onPrimary} />
            <Title style={styles.welcomeText}>Welcome to ErzanFly</Title>
            <Paragraph style={styles.subtitleText}>
              Find the best flight deals and track prices
            </Paragraph>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Card
                key={index}
                style={[styles.quickActionCard, {backgroundColor: action.color}]}
                onPress={action.onPress}>
                <Card.Content style={styles.quickActionContent}>
                  <Icon name={action.icon} size={24} color="white" />
                  <Paragraph style={styles.quickActionText}>
                    {action.title}
                  </Paragraph>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Popular Flights */}
        <View style={styles.popularFlightsContainer}>
          <Title style={styles.sectionTitle}>Popular Flights</Title>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.loader}
            />
          ) : (
            popularFlights.map((flight, index) => (
              <Card
                key={flight.id}
                style={styles.flightCard}
                onPress={() => handleFlightPress(flight)}>
                <Card.Content>
                  <View style={styles.flightHeader}>
                    <View style={styles.airlineContainer}>
                      <Icon name="flight" size={20} color={theme.colors.primary} />
                      <Paragraph style={styles.airlineText}>
                        {flight.airline}
                      </Paragraph>
                    </View>
                    <Chip
                      style={[
                        styles.priceChip,
                        {backgroundColor: theme.colors.primaryContainer},
                      ]}>
                      {flight.price} {flight.currency}
                    </Chip>
                  </View>
                  
                  <View style={styles.routeContainer}>
                    <View style={styles.routePoint}>
                      <Title style={styles.airportCode}>
                        {flight.departure.airport}
                      </Title>
                      <Paragraph style={styles.cityName}>
                        {flight.departure.city}
                      </Paragraph>
                      <Paragraph style={styles.timeText}>
                        {flight.departure.time}
                      </Paragraph>
                    </View>
                    
                    <View style={styles.routeMiddle}>
                      <Icon name="arrow-forward" size={20} color={theme.colors.primary} />
                      <Paragraph style={styles.durationText}>
                        {flight.duration}
                      </Paragraph>
                    </View>
                    
                    <View style={styles.routePoint}>
                      <Title style={styles.airportCode}>
                        {flight.arrival.airport}
                      </Title>
                      <Paragraph style={styles.cityName}>
                        {flight.arrival.city}
                      </Paragraph>
                      <Paragraph style={styles.timeText}>
                        {flight.arrival.time}
                      </Paragraph>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>

        {/* Tips Section */}
        <Surface style={styles.tipsContainer}>
          <Title style={styles.sectionTitle}>💡 Travel Tips</Title>
          <Paragraph style={styles.tipText}>
            • Book flights 2-3 weeks in advance for better prices
          </Paragraph>
          <Paragraph style={styles.tipText}>
            • Set price alerts for your favorite routes
          </Paragraph>
          <Paragraph style={styles.tipText}>
            • Compare prices across different airlines
          </Paragraph>
          <Paragraph style={styles.tipText}>
            • Consider flying on weekdays for lower fares
          </Paragraph>
        </Surface>
      </ScrollView>

      {/* FAB for Quick Search */}
      <FAB
        icon="search"
        style={styles.fab}
        onPress={handleSearchPress}
        label="Search"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
    marginTop: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: theme.colors.onPrimary,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  quickActionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme.colors.onBackground,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickActionCard: {
    width: (width - 60) / 3,
    marginBottom: 10,
    borderRadius: 12,
  },
  quickActionContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  popularFlightsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  flightCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  airlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airlineText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  priceChip: {
    borderRadius: 20,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routePoint: {
    alignItems: 'center',
    flex: 1,
  },
  routeMiddle: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  airportCode: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cityName: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  durationText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  tipsContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 1,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
    color: theme.colors.onSurface,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default HomeScreen;