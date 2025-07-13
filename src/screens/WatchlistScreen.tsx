import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Surface,
  Text,
  Avatar,
  useTheme,
  IconButton,
  Chip,
  ActivityIndicator,
  Badge,
  FAB,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import FlightService, { WatchlistItem } from '../services/FlightService';
import NotificationService from '../services/NotificationService';
import { spacing, typography } from '../theme/theme';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

const WatchlistScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadWatchlist();
    }, [])
  );

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const items = await FlightService.getWatchlist();
      setWatchlistItems(items);
    } catch (error) {
      console.error('Error loading watchlist:', error);
      Alert.alert('Hata', 'Takip listesi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await FlightService.checkPriceUpdates();
      await loadWatchlist();
    } catch (error) {
      console.error('Error refreshing watchlist:', error);
      Alert.alert('Hata', 'Fiyatlar güncellenirken bir hata oluştu');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    Alert.alert(
      'Takipten Çıkar',
      'Bu uçuşu takip listesinden çıkarmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkar',
          style: 'destructive',
          onPress: async () => {
            try {
              await FlightService.removeFromWatchlist(id);
              await loadWatchlist();
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Hata', 'Öğe kaldırılırken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await FlightService.updateWatchlistItem(id, { isActive: !isActive });
      await loadWatchlist();
    } catch (error) {
      console.error('Error toggling active state:', error);
      Alert.alert('Hata', 'Durum güncellenirken bir hata oluştu');
    }
  };

  const generateMockPriceData = (targetPrice: number, currentPrice: number) => {
    const data = [];
    const days = 7;
    const basePrice = targetPrice * 1.2;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      let price = basePrice;
      if (i === 0) {
        price = currentPrice;
      } else {
        const variation = (Math.random() - 0.5) * 0.1;
        price = basePrice * (1 + variation);
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
      });
    }
    
    return data;
  };

  const renderPriceChart = (item: WatchlistItem) => {
    const priceData = generateMockPriceData(item.targetPrice, item.currentPrice);
    const prices = priceData.map(d => d.price);
    const labels = priceData.map(d => format(new Date(d.date), 'dd/MM'));

    return (
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: prices,
              color: (opacity = 1) => theme.colors.primary,
              strokeWidth: 2,
            },
            {
              data: [item.targetPrice],
              color: (opacity = 1) => theme.colors.error,
              strokeWidth: 1,
              withDots: false,
            },
          ],
        }}
        width={width - 64}
        height={150}
        yAxisSuffix=" TRY"
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => theme.colors.primary,
          labelColor: (opacity = 1) => theme.colors.onSurface,
          style: {
            borderRadius: 8,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: theme.colors.primary,
          },
        }}
        bezier
        style={styles.chart}
      />
    );
  };

  const renderWatchlistItem = ({ item }: { item: WatchlistItem }) => {
    const priceChange = item.currentPrice - item.targetPrice;
    const isTargetReached = item.currentPrice <= item.targetPrice;
    
    return (
      <Card style={styles.watchlistCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.routeInfo}>
              <Text style={styles.routeText}>
                {item.searchParams.from} → {item.searchParams.to}
              </Text>
              <Text style={styles.dateText}>
                {format(new Date(item.searchParams.departureDate), 'dd MMM yyyy')}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <IconButton
                icon={item.isActive ? 'bell' : 'bell-off'}
                size={20}
                onPress={() => handleToggleActive(item.id, item.isActive)}
                iconColor={item.isActive ? theme.colors.primary : theme.colors.outline}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleRemoveItem(item.id)}
                iconColor={theme.colors.error}
              />
            </View>
          </View>

          <View style={styles.priceInfo}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Hedef Fiyat:</Text>
              <Text style={styles.targetPrice}>{item.targetPrice} TRY</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Güncel Fiyat:</Text>
              <Text style={[
                styles.currentPrice,
                { color: isTargetReached ? theme.colors.primary : theme.colors.error }
              ]}>
                {item.currentPrice} TRY
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Fark:</Text>
              <Text style={[
                styles.priceDifference,
                { color: priceChange <= 0 ? theme.colors.primary : theme.colors.error }
              ]}>
                {priceChange > 0 ? '+' : ''}{priceChange} TRY
              </Text>
            </View>
          </View>

          {isTargetReached && (
            <Badge style={styles.targetBadge}>
              🎯 Hedef fiyata ulaşıldı!
            </Badge>
          )}

          <View style={styles.statusRow}>
            <Chip
              icon={item.isActive ? 'bell' : 'bell-off'}
              style={[
                styles.statusChip,
                { backgroundColor: item.isActive ? theme.colors.primaryContainer : theme.colors.surfaceVariant }
              ]}
            >
              {item.isActive ? 'Aktif' : 'Pasif'}
            </Chip>
            <Text style={styles.lastChecked}>
              Son kontrol: {format(new Date(item.lastChecked), 'HH:mm')}
            </Text>
          </View>

          {renderPriceChart(item)}

          <View style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Search', item.searchParams)}
              style={styles.actionButton}
            >
              Tekrar Ara
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                // Navigate to flight details or booking
                Alert.alert('Yakında', 'Rezervasyon özelliği yakında eklenecek!');
              }}
              style={styles.actionButton}
            >
              Rezervasyon
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <Surface style={styles.emptyState} elevation={1}>
      <Avatar.Icon
        size={80}
        icon="heart-outline"
        style={[styles.emptyIcon, { backgroundColor: theme.colors.surfaceVariant }]}
      />
      <Title style={styles.emptyTitle}>Takip listesi boş</Title>
      <Paragraph style={styles.emptyDescription}>
        Uçuş fiyatlarını takip etmek için arama yapın ve favori uçuşlarınızı ekleyin.
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Search')}
        style={styles.emptyButton}
        icon="magnify"
      >
        Uçuş Ara
      </Button>
    </Surface>
  );

  const renderHeader = () => (
    <Surface style={styles.header} elevation={2}>
      <Title style={styles.headerTitle}>Fiyat Takip Listesi</Title>
      <Paragraph style={styles.headerDescription}>
        Favori uçuşlarınızın fiyatlarını takip edin ve hedef fiyata ulaştığında bildirim alın.
      </Paragraph>
      <View style={styles.headerActions}>
        <Button
          mode="outlined"
          onPress={handleRefresh}
          loading={refreshing}
          disabled={refreshing}
          icon="refresh"
          style={styles.refreshButton}
        >
          Fiyatları Güncelle
        </Button>
      </View>
    </Surface>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Takip listesi yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {watchlistItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={watchlistItems}
          renderItem={renderWatchlistItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Search')}
        label="Uçuş Ekle"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.bodyMedium.fontSize,
    color: '#666',
  },
  header: {
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: typography.headlineSmall.fontSize,
    fontWeight: typography.headlineSmall.fontWeight,
    marginBottom: spacing.xs,
  },
  headerDescription: {
    fontSize: typography.bodyMedium.fontSize,
    color: '#666',
    marginBottom: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
  },
  refreshButton: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
  },
  watchlistCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  routeInfo: {
    flex: 1,
  },
  routeText: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  priceInfo: {
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  priceLabel: {
    fontSize: typography.bodyMedium.fontSize,
    color: '#666',
  },
  targetPrice: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
    color: '#333',
  },
  currentPrice: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
  },
  priceDifference: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
  },
  targetBadge: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusChip: {
    // Styles applied dynamically
  },
  lastChecked: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
  },
  chart: {
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    margin: spacing.md,
    padding: spacing.xl,
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.titleLarge.fontSize,
    fontWeight: typography.titleLarge.fontWeight,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: typography.bodyMedium.fontSize,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyButton: {
    // Default styles
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});

export default WatchlistScreen;