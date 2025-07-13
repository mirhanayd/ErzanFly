import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Chip,
  ActivityIndicator,
  Switch,
  IconButton,
  Surface,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import {theme} from '../theme/theme';
import {FlightService} from '../services/FlightService';
import {NotificationService} from '../services/NotificationService';
import {WatchlistItem, Flight} from '../types';

const WatchlistScreen = () => {
  const navigation = useNavigation();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Dialog state
  const [showTargetPriceDialog, setShowTargetPriceDialog] = useState(false);
  const [selectedWatchlistItem, setSelectedWatchlistItem] = useState<WatchlistItem | null>(null);
  const [targetPrice, setTargetPrice] = useState('');

  const flightService = FlightService.getInstance();
  const notificationService = NotificationService.getInstance();

  useFocusEffect(
    React.useCallback(() => {
      loadWatchlist();
    }, [])
  );

  const loadWatchlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('erzanfly_watchlist');
      if (stored) {
        const items: WatchlistItem[] = JSON.parse(stored);
        setWatchlist(items);
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWatchlist = async (items: WatchlistItem[]) => {
    try {
      await AsyncStorage.setItem('erzanfly_watchlist', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving watchlist:', error);
    }
  };

  const addToWatchlist = async (flight: Flight, targetPrice: number) => {
    const newItem: WatchlistItem = {
      id: Date.now().toString(),
      flight,
      targetPrice,
      currentPrice: flight.price,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      notifications: true,
    };

    const updatedWatchlist = [...watchlist, newItem];
    setWatchlist(updatedWatchlist);
    await saveWatchlist(updatedWatchlist);
  };

  const removeFromWatchlist = async (id: string) => {
    const updatedWatchlist = watchlist.filter(item => item.id !== id);
    setWatchlist(updatedWatchlist);
    await saveWatchlist(updatedWatchlist);
  };

  const toggleWatchlistItem = async (id: string) => {
    const updatedWatchlist = watchlist.map(item =>
      item.id === id ? {...item, isActive: !item.isActive} : item
    );
    setWatchlist(updatedWatchlist);
    await saveWatchlist(updatedWatchlist);
  };

  const toggleNotifications = async (id: string) => {
    const updatedWatchlist = watchlist.map(item =>
      item.id === id ? {...item, notifications: !item.notifications} : item
    );
    setWatchlist(updatedWatchlist);
    await saveWatchlist(updatedWatchlist);
  };

  const updateTargetPrice = async (id: string, newTargetPrice: number) => {
    const updatedWatchlist = watchlist.map(item =>
      item.id === id ? {...item, targetPrice: newTargetPrice} : item
    );
    setWatchlist(updatedWatchlist);
    await saveWatchlist(updatedWatchlist);
  };

  const refreshPrices = async () => {
    setRefreshing(true);
    try {
      const updatedWatchlist = await Promise.all(
        watchlist.map(async (item) => {
          if (!item.isActive) return item;
          
          try {
            const newPrice = await flightService.trackPriceChanges(item.flight.id);
            const updatedItem = {
              ...item,
              currentPrice: newPrice,
              lastChecked: new Date().toISOString(),
            };

            // Check if price dropped below target
            if (item.notifications && newPrice <= item.targetPrice && newPrice < item.currentPrice) {
              await notificationService.sendPriceDropAlert(
                item.flight.flightNumber,
                item.currentPrice,
                newPrice,
                item.flight.currency
              );
            }

            return updatedItem;
          } catch (error) {
            console.error(`Error updating price for ${item.flight.flightNumber}:`, error);
            return item;
          }
        })
      );

      setWatchlist(updatedWatchlist);
      await saveWatchlist(updatedWatchlist);
    } catch (error) {
      console.error('Error refreshing prices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const updateSinglePrice = async (id: string) => {
    const item = watchlist.find(w => w.id === id);
    if (!item) return;

    setUpdating(id);
    try {
      const newPrice = await flightService.trackPriceChanges(item.flight.id);
      const updatedWatchlist = watchlist.map(w =>
        w.id === id
          ? {
              ...w,
              currentPrice: newPrice,
              lastChecked: new Date().toISOString(),
            }
          : w
      );

      setWatchlist(updatedWatchlist);
      await saveWatchlist(updatedWatchlist);

      // Check if price dropped below target
      if (item.notifications && newPrice <= item.targetPrice && newPrice < item.currentPrice) {
        await notificationService.sendPriceDropAlert(
          item.flight.flightNumber,
          item.currentPrice,
          newPrice,
          item.flight.currency
        );
      }
    } catch (error) {
      console.error('Error updating price:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleTargetPriceSubmit = async () => {
    if (!selectedWatchlistItem || !targetPrice) return;

    const newTargetPrice = parseFloat(targetPrice);
    if (isNaN(newTargetPrice) || newTargetPrice <= 0) {
      Alert.alert('Error', 'Please enter a valid target price');
      return;
    }

    await updateTargetPrice(selectedWatchlistItem.id, newTargetPrice);
    setShowTargetPriceDialog(false);
    setSelectedWatchlistItem(null);
    setTargetPrice('');
  };

  const handleFlightPress = (flight: Flight) => {
    navigation.navigate('FlightDetails', {flight});
  };

  const renderWatchlistItem = (item: WatchlistItem) => {
    const priceChange = item.currentPrice - item.targetPrice;
    const priceChangePercent = ((item.currentPrice - item.targetPrice) / item.targetPrice) * 100;
    const isBelow = item.currentPrice <= item.targetPrice;

    return (
      <Card
        key={item.id}
        style={[
          styles.watchlistCard,
          !item.isActive && styles.inactiveCard,
        ]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.flightInfo}>
              <View style={styles.airlineContainer}>
                <Icon name="flight" size={20} color={theme.colors.primary} />
                <Paragraph style={styles.airlineText}>
                  {item.flight.airline} {item.flight.flightNumber}
                </Paragraph>
              </View>
              <Paragraph style={styles.routeText}>
                {item.flight.departure.airport} → {item.flight.arrival.airport}
              </Paragraph>
            </View>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleWatchlistItem(item.id)}
            />
          </View>

          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <View style={styles.priceColumn}>
                <Paragraph style={styles.priceLabel}>Current Price</Paragraph>
                <Title style={styles.currentPrice}>
                  {item.currentPrice} {item.flight.currency}
                </Title>
              </View>
              <View style={styles.priceColumn}>
                <Paragraph style={styles.priceLabel}>Target Price</Paragraph>
                <Title style={styles.targetPrice}>
                  {item.targetPrice} {item.flight.currency}
                </Title>
              </View>
            </View>

            <View style={styles.priceChangeContainer}>
              <Chip
                style={[
                  styles.priceChangeChip,
                  {
                    backgroundColor: isBelow
                      ? theme.colors.tertiaryContainer
                      : theme.colors.errorContainer,
                  },
                ]}>
                {isBelow ? '✓' : '✗'} {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(0)} {item.flight.currency}
                ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
              </Chip>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              onPress={() => handleFlightPress(item.flight)}
              style={styles.actionButton}>
              View Details
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedWatchlistItem(item);
                setTargetPrice(item.targetPrice.toString());
                setShowTargetPriceDialog(true);
              }}
              style={styles.actionButton}>
              Edit Target
            </Button>
            <IconButton
              icon="refresh"
              size={20}
              onPress={() => updateSinglePrice(item.id)}
              disabled={updating === item.id}
              style={styles.refreshButton}
            />
            <IconButton
              icon={item.notifications ? 'notifications' : 'notifications-off'}
              size={20}
              onPress={() => toggleNotifications(item.id)}
              style={styles.notificationButton}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => {
                Alert.alert(
                  'Remove from Watchlist',
                  'Are you sure you want to remove this flight from your watchlist?',
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () => removeFromWatchlist(item.id),
                    },
                  ]
                );
              }}
              style={styles.deleteButton}
            />
          </View>

          <View style={styles.metaContainer}>
            <Paragraph style={styles.metaText}>
              Added: {new Date(item.createdAt).toLocaleDateString()}
            </Paragraph>
            <Paragraph style={styles.metaText}>
              Last checked: {new Date(item.lastChecked).toLocaleString()}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Paragraph style={styles.loadingText}>Loading watchlist...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshPrices} />
        }>
        {watchlist.length === 0 ? (
          <Surface style={styles.emptyContainer}>
            <Icon name="favorite-border" size={64} color={theme.colors.onSurfaceVariant} />
            <Title style={styles.emptyTitle}>No flights in watchlist</Title>
            <Paragraph style={styles.emptyText}>
              Add flights to your watchlist to track price changes and get notified when prices drop.
            </Paragraph>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Search')}
              style={styles.searchButton}>
              Search Flights
            </Button>
          </Surface>
        ) : (
          <>
            <View style={styles.headerContainer}>
              <Title style={styles.headerTitle}>
                {watchlist.length} flight{watchlist.length > 1 ? 's' : ''} in watchlist
              </Title>
              <Paragraph style={styles.headerSubtitle}>
                {watchlist.filter(item => item.isActive).length} active
              </Paragraph>
            </View>
            {watchlist.map(renderWatchlistItem)}
          </>
        )}
      </ScrollView>

      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={refreshPrices}
        loading={refreshing}
        disabled={refreshing}
        label="Refresh Prices"
      />

      {/* Target Price Dialog */}
      <Portal>
        <Dialog visible={showTargetPriceDialog} onDismiss={() => setShowTargetPriceDialog(false)}>
          <Dialog.Title>Set Target Price</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Target Price"
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="numeric"
              right={<TextInput.Affix text={selectedWatchlistItem?.flight.currency || 'TRY'} />}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTargetPriceDialog(false)}>Cancel</Button>
            <Button onPress={handleTargetPriceSubmit}>Save</Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.onBackground,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 40,
    borderRadius: 12,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
    color: theme.colors.onSurfaceVariant,
  },
  searchButton: {
    borderRadius: 8,
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  watchlistCard: {
    margin: 12,
    borderRadius: 12,
    elevation: 2,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  flightInfo: {
    flex: 1,
  },
  airlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  airlineText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  routeText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  priceContainer: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceColumn: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  targetPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  priceChangeContainer: {
    alignItems: 'center',
  },
  priceChangeChip: {
    borderRadius: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  refreshButton: {
    margin: 0,
  },
  notificationButton: {
    margin: 0,
  },
  deleteButton: {
    margin: 0,
  },
  metaContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    paddingTop: 12,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default WatchlistScreen;