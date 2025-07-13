import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  Share,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Surface,
  IconButton,
  Dialog,
  Portal,
  TextInput,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useRoute, useNavigation} from '@react-navigation/native';

import {theme} from '../theme/theme';
import {FlightService} from '../services/FlightService';
import {NotificationService} from '../services/NotificationService';
import {Flight, WatchlistItem} from '../types';

const {width} = Dimensions.get('window');

const FlightDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {flight} = route.params as {flight: Flight};

  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(flight.price);
  const [priceHistory, setPriceHistory] = useState<number[]>([flight.price]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dialog state
  const [showWatchlistDialog, setShowWatchlistDialog] = useState(false);
  const [targetPrice, setTargetPrice] = useState(flight.price.toString());

  const flightService = FlightService.getInstance();
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    checkWatchlistStatus();
    loadPriceHistory();
  }, []);

  const checkWatchlistStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem('erzanfly_watchlist');
      if (stored) {
        const watchlist: WatchlistItem[] = JSON.parse(stored);
        const exists = watchlist.some(item => item.flight.id === flight.id);
        setIsInWatchlist(exists);
      }
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    }
  };

  const loadPriceHistory = async () => {
    try {
      // Mock price history - in real app, this would come from API
      const mockHistory = [
        flight.price + 50,
        flight.price + 20,
        flight.price - 10,
        flight.price,
      ];
      setPriceHistory(mockHistory);
    } catch (error) {
      console.error('Error loading price history:', error);
    }
  };

  const refreshPrice = async () => {
    setRefreshing(true);
    try {
      const newPrice = await flightService.trackPriceChanges(flight.id);
      setCurrentPrice(newPrice);
      setPriceHistory(prev => [...prev, newPrice]);
    } catch (error) {
      console.error('Error refreshing price:', error);
      Alert.alert('Error', 'Failed to refresh price');
    } finally {
      setRefreshing(false);
    }
  };

  const addToWatchlist = async () => {
    const targetPriceNum = parseFloat(targetPrice);
    if (isNaN(targetPriceNum) || targetPriceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid target price');
      return;
    }

    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('erzanfly_watchlist');
      const watchlist: WatchlistItem[] = stored ? JSON.parse(stored) : [];
      
      const newItem: WatchlistItem = {
        id: Date.now().toString(),
        flight: {...flight, price: currentPrice},
        targetPrice: targetPriceNum,
        currentPrice,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        notifications: true,
      };

      const updatedWatchlist = [...watchlist, newItem];
      await AsyncStorage.setItem('erzanfly_watchlist', JSON.stringify(updatedWatchlist));
      
      setIsInWatchlist(true);
      setShowWatchlistDialog(false);
      
      // Send confirmation notification
      await notificationService.sendGeneralNotification(
        'Added to Watchlist',
        `${flight.flightNumber} has been added to your watchlist. You'll be notified when price drops to ${targetPriceNum} ${flight.currency}.`
      );
      
      Alert.alert('Success', 'Flight added to watchlist!');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      Alert.alert('Error', 'Failed to add to watchlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('erzanfly_watchlist');
      if (stored) {
        const watchlist: WatchlistItem[] = JSON.parse(stored);
        const updatedWatchlist = watchlist.filter(item => item.flight.id !== flight.id);
        await AsyncStorage.setItem('erzanfly_watchlist', JSON.stringify(updatedWatchlist));
        setIsInWatchlist(false);
        Alert.alert('Success', 'Flight removed from watchlist');
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      Alert.alert('Error', 'Failed to remove from watchlist');
    }
  };

  const handleWatchlistAction = () => {
    if (isInWatchlist) {
      Alert.alert(
        'Remove from Watchlist',
        'Are you sure you want to remove this flight from your watchlist?',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Remove', style: 'destructive', onPress: removeFromWatchlist},
        ]
      );
    } else {
      setTargetPrice(currentPrice.toString());
      setShowWatchlistDialog(true);
    }
  };

  const shareFlightDetails = async () => {
    try {
      const message = `Check out this flight deal!\n\n${flight.airline} ${flight.flightNumber}\n${flight.departure.city} → ${flight.arrival.city}\nPrice: ${currentPrice} ${flight.currency}\nDate: ${flight.departure.date}\n\nShared via ErzanFly`;
      
      await Share.share({
        message,
        title: 'Flight Deal',
      });
    } catch (error) {
      console.error('Error sharing flight:', error);
    }
  };

  const calculatePriceChange = () => {
    if (priceHistory.length < 2) return null;
    
    const previousPrice = priceHistory[priceHistory.length - 2];
    const change = currentPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;
    
    return {
      amount: change,
      percentage: changePercent,
      isIncrease: change > 0,
    };
  };

  const priceChange = calculatePriceChange();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Flight Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          style={styles.headerGradient}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.airlineInfo}>
                <Icon name="flight" size={32} color={theme.colors.onPrimary} />
                <View style={styles.airlineDetails}>
                  <Title style={styles.airlineName}>{flight.airline}</Title>
                  <Paragraph style={styles.flightNumber}>{flight.flightNumber}</Paragraph>
                </View>
              </View>
              <View style={styles.headerActions}>
                <IconButton
                  icon="refresh"
                  size={24}
                  iconColor={theme.colors.onPrimary}
                  onPress={refreshPrice}
                  disabled={refreshing}
                />
                <IconButton
                  icon="share"
                  size={24}
                  iconColor={theme.colors.onPrimary}
                  onPress={shareFlightDetails}
                />
              </View>
            </View>
            
            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <Title style={styles.airportCode}>{flight.departure.airport}</Title>
                <Paragraph style={styles.cityName}>{flight.departure.city}</Paragraph>
                <Paragraph style={styles.timeText}>{flight.departure.time}</Paragraph>
              </View>
              
              <View style={styles.routeMiddle}>
                <Icon name="arrow-forward" size={24} color={theme.colors.onPrimary} />
                <Paragraph style={styles.durationText}>{flight.duration}</Paragraph>
              </View>
              
              <View style={styles.routePoint}>
                <Title style={styles.airportCode}>{flight.arrival.airport}</Title>
                <Paragraph style={styles.cityName}>{flight.arrival.city}</Paragraph>
                <Paragraph style={styles.timeText}>{flight.arrival.time}</Paragraph>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Price Information */}
        <Card style={styles.priceCard}>
          <Card.Content>
            <View style={styles.priceHeader}>
              <View style={styles.priceMain}>
                <Title style={styles.currentPriceTitle}>Current Price</Title>
                <Title style={styles.currentPriceAmount}>
                  {refreshing ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    `${currentPrice} ${flight.currency}`
                  )}
                </Title>
              </View>
              
              {priceChange && (
                <Chip
                  style={[
                    styles.priceChangeChip,
                    {
                      backgroundColor: priceChange.isIncrease
                        ? theme.colors.errorContainer
                        : theme.colors.tertiaryContainer,
                    },
                  ]}>
                  {priceChange.isIncrease ? '↗' : '↘'} {priceChange.amount >= 0 ? '+' : ''}
                  {priceChange.amount.toFixed(0)} {flight.currency} ({priceChange.percentage.toFixed(1)}%)
                </Chip>
              )}
            </View>
            
            <View style={styles.priceActions}>
              <Button
                mode={isInWatchlist ? 'outlined' : 'contained'}
                onPress={handleWatchlistAction}
                loading={loading}
                disabled={loading}
                style={styles.watchlistButton}
                icon={isInWatchlist ? 'heart' : 'heart-outline'}>
                {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Flight Details */}
        <Card style={styles.detailsCard}>
          <Card.Title title="Flight Details" />
          <Card.Content>
            <View style={styles.detailsRow}>
              <View style={styles.detailsColumn}>
                <Paragraph style={styles.detailsLabel}>Departure Date</Paragraph>
                <Title style={styles.detailsValue}>{flight.departure.date}</Title>
              </View>
              <View style={styles.detailsColumn}>
                <Paragraph style={styles.detailsLabel}>Arrival Date</Paragraph>
                <Title style={styles.detailsValue}>{flight.arrival.date}</Title>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.detailsRow}>
              <View style={styles.detailsColumn}>
                <Paragraph style={styles.detailsLabel}>Duration</Paragraph>
                <Title style={styles.detailsValue}>{flight.duration}</Title>
              </View>
              <View style={styles.detailsColumn}>
                <Paragraph style={styles.detailsLabel}>Stops</Paragraph>
                <Title style={styles.detailsValue}>
                  {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                </Title>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.detailsRow}>
              <View style={styles.detailsColumn}>
                <Paragraph style={styles.detailsLabel}>Cabin Baggage</Paragraph>
                <Title style={styles.detailsValue}>{flight.baggage?.cabin || 'N/A'}</Title>
              </View>
              <View style={styles.detailsColumn}>
                <Paragraph style={styles.detailsLabel}>Checked Baggage</Paragraph>
                <Title style={styles.detailsValue}>{flight.baggage?.checked || 'N/A'}</Title>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.availabilityContainer}>
              <Paragraph style={styles.detailsLabel}>Availability</Paragraph>
              <Chip
                style={[
                  styles.availabilityChip,
                  {
                    backgroundColor: flight.available
                      ? theme.colors.tertiaryContainer
                      : theme.colors.errorContainer,
                  },
                ]}>
                {flight.available ? 'Available' : 'Not Available'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Price History */}
        <Card style={styles.historyCard}>
          <Card.Title title="Price History" />
          <Card.Content>
            <View style={styles.historyContainer}>
              {priceHistory.map((price, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyPoint}>
                    <Surface style={styles.historyDot} />
                  </View>
                  <View style={styles.historyContent}>
                    <Title style={styles.historyPrice}>{price} {flight.currency}</Title>
                    <Paragraph style={styles.historyDate}>
                      {index === priceHistory.length - 1
                        ? 'Current'
                        : `${priceHistory.length - index} day${priceHistory.length - index > 1 ? 's' : ''} ago`}
                    </Paragraph>
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Booking Info */}
        <Surface style={styles.bookingInfo}>
          <Title style={styles.bookingTitle}>Ready to Book?</Title>
          <Paragraph style={styles.bookingText}>
            Visit {flight.airline}'s official website or app to complete your booking.
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => Alert.alert('Booking', `Redirect to ${flight.airline} booking page`)}
            style={styles.bookingButton}>
            Book on {flight.airline}
          </Button>
        </Surface>
      </ScrollView>

      {/* Watchlist Dialog */}
      <Portal>
        <Dialog visible={showWatchlistDialog} onDismiss={() => setShowWatchlistDialog(false)}>
          <Dialog.Title>Add to Watchlist</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.dialogText}>
              Set a target price to get notified when this flight drops to your desired price.
            </Paragraph>
            <TextInput
              label="Target Price"
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="numeric"
              right={<TextInput.Affix text={flight.currency} />}
              style={styles.targetPriceInput}
            />
            <Paragraph style={styles.dialogHint}>
              Current price: {currentPrice} {flight.currency}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowWatchlistDialog(false)}>Cancel</Button>
            <Button onPress={addToWatchlist} loading={loading}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airlineDetails: {
    marginLeft: 12,
  },
  airlineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  flightNumber: {
    fontSize: 16,
    color: theme.colors.onPrimary,
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
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
    paddingHorizontal: 20,
  },
  airportCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  cityName: {
    fontSize: 14,
    color: theme.colors.onPrimary,
    opacity: 0.8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.onPrimary,
    marginTop: 4,
  },
  durationText: {
    fontSize: 14,
    color: theme.colors.onPrimary,
    opacity: 0.8,
    marginTop: 4,
  },
  priceCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 3,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceMain: {
    flex: 1,
  },
  currentPriceTitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  currentPriceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  priceChangeChip: {
    borderRadius: 20,
  },
  priceActions: {
    alignItems: 'center',
  },
  watchlistButton: {
    minWidth: 200,
    borderRadius: 8,
  },
  detailsCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailsColumn: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 16,
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityChip: {
    borderRadius: 20,
  },
  historyCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  historyContainer: {
    paddingVertical: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyPoint: {
    width: 20,
    alignItems: 'center',
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    elevation: 1,
  },
  historyContent: {
    flex: 1,
    marginLeft: 16,
  },
  historyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  bookingInfo: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 1,
    alignItems: 'center',
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bookingText: {
    textAlign: 'center',
    marginBottom: 16,
    color: theme.colors.onSurfaceVariant,
  },
  bookingButton: {
    minWidth: 200,
    borderRadius: 8,
  },
  dialogText: {
    marginBottom: 16,
    color: theme.colors.onSurfaceVariant,
  },
  targetPriceInput: {
    marginBottom: 8,
  },
  dialogHint: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});

export default FlightDetailsScreen;