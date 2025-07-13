import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  Modal,
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
  Badge,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import FlightService, { Flight } from '../services/FlightService';
import { spacing, typography } from '../theme/theme';
import { format, differenceInMinutes } from 'date-fns';

const { width } = Dimensions.get('window');

const FlightDetailsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = route.params as { flight: Flight };
    if (params?.flight) {
      setFlight(params.flight);
      setTargetPrice(params.flight.price.toString());
    }
  }, [route.params]);

  const handleAddToWatchlist = async () => {
    if (!flight) return;
    
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir fiyat girin');
      return;
    }

    try {
      setLoading(true);
      
      const searchParams = {
        from: flight.from.code,
        to: flight.to.code,
        departureDate: format(new Date(flight.departureTime), 'yyyy-MM-dd'),
        passengers: 1,
        tripType: 'oneWay' as const,
      };

      await FlightService.addToWatchlist(searchParams, price);
      
      Alert.alert(
        'Başarılı',
        'Uçuş takip listesine eklendi. Fiyat hedef seviyeye ulaştığında bildirim alacaksınız.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              setShowPriceAlert(false);
              navigation.navigate('Watchlist');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      Alert.alert('Hata', 'Takip listesine eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = () => {
    Alert.alert(
      'Rezervasyon',
      'Bu uçuşu rezerve etmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Rezerve Et',
          onPress: () => {
            Alert.alert(
              'Yönlendiriliyor',
              `${flight?.airline} web sitesine yönlendiriliyorsunuz...`
            );
          },
        },
      ]
    );
  };

  const renderPriceChart = () => {
    if (!flight) return null;

    const prices = flight.priceHistory.map(p => p.price);
    const labels = flight.priceHistory.map(p => format(new Date(p.date), 'dd/MM'));

    return (
      <Surface style={styles.chartContainer} elevation={1}>
        <Title style={styles.chartTitle}>Fiyat Geçmişi (Son 30 Gün)</Title>
        <LineChart
          data={{
            labels: labels.filter((_, index) => index % 5 === 0), // Show every 5th label
            datasets: [
              {
                data: prices,
                color: (opacity = 1) => theme.colors.primary,
                strokeWidth: 2,
              },
            ],
          }}
          width={width - 64}
          height={220}
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
              r: '3',
              strokeWidth: '1',
              stroke: theme.colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
        <View style={styles.priceStats}>
          <View style={styles.priceStat}>
            <Text style={styles.priceStatLabel}>En Düşük</Text>
            <Text style={styles.priceStatValue}>
              {Math.min(...prices)} TRY
            </Text>
          </View>
          <View style={styles.priceStat}>
            <Text style={styles.priceStatLabel}>En Yüksek</Text>
            <Text style={styles.priceStatValue}>
              {Math.max(...prices)} TRY
            </Text>
          </View>
          <View style={styles.priceStat}>
            <Text style={styles.priceStatLabel}>Ortalama</Text>
            <Text style={styles.priceStatValue}>
              {Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)} TRY
            </Text>
          </View>
        </View>
      </Surface>
    );
  };

  const renderFlightHeader = () => {
    if (!flight) return null;

    return (
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.flightHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.airlineInfo}>
            <Avatar.Icon
              size={48}
              icon="airplane"
              style={[styles.airlineIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            />
            <View style={styles.airlineDetails}>
              <Text style={[styles.airlineName, { color: theme.colors.onPrimary }]}>
                {flight.airline}
              </Text>
              <Text style={[styles.flightNumber, { color: theme.colors.onPrimary }]}>
                {flight.flightNumber}
              </Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceText, { color: theme.colors.onPrimary }]}>
              {flight.price} {flight.currency}
            </Text>
            <Text style={[styles.priceLabel, { color: theme.colors.onPrimary }]}>
              Kişi başı
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderFlightInfo = () => {
    if (!flight) return null;

    const departureDate = new Date(flight.departureTime);
    const arrivalDate = new Date(flight.arrivalTime);
    const flightDuration = differenceInMinutes(arrivalDate, departureDate);

    return (
      <Surface style={styles.flightInfo} elevation={2}>
        <Title style={styles.sectionTitle}>Uçuş Bilgileri</Title>
        
        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <Text style={styles.routeTime}>
              {format(departureDate, 'HH:mm')}
            </Text>
            <Text style={styles.routeCode}>{flight.from.code}</Text>
            <Text style={styles.routeCity}>{flight.from.city}</Text>
            <Text style={styles.routeName}>{flight.from.name}</Text>
          </View>
          
          <View style={styles.routeConnector}>
            <Text style={styles.routeDuration}>{flight.duration}</Text>
            <View style={styles.routeLine} />
            <Avatar.Icon
              size={32}
              icon="airplane"
              style={[styles.routeIcon, { backgroundColor: theme.colors.primary }]}
            />
          </View>
          
          <View style={styles.routePoint}>
            <Text style={styles.routeTime}>
              {format(arrivalDate, 'HH:mm')}
            </Text>
            <Text style={styles.routeCode}>{flight.to.code}</Text>
            <Text style={styles.routeCity}>{flight.to.city}</Text>
            <Text style={styles.routeName}>{flight.to.name}</Text>
          </View>
        </View>
        
        <View style={styles.flightDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tarih:</Text>
            <Text style={styles.detailValue}>
              {format(departureDate, 'dd MMMM yyyy')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Uçak:</Text>
            <Text style={styles.detailValue}>{flight.aircraft}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Müsait Koltuk:</Text>
            <Text style={styles.detailValue}>{flight.availableSeats}</Text>
          </View>
        </View>
      </Surface>
    );
  };

  const renderBaggageInfo = () => {
    if (!flight) return null;

    return (
      <Surface style={styles.baggageInfo} elevation={1}>
        <Title style={styles.sectionTitle}>Bagaj Bilgileri</Title>
        
        <View style={styles.baggageRow}>
          <View style={styles.baggageItem}>
            <Avatar.Icon
              size={40}
              icon="bag-carry-on"
              style={[styles.baggageIcon, { backgroundColor: theme.colors.primaryContainer }]}
            />
            <Text style={styles.baggageLabel}>Kabin Bagajı</Text>
            <Text style={styles.baggageValue}>{flight.baggage.cabin}</Text>
          </View>
          
          <View style={styles.baggageItem}>
            <Avatar.Icon
              size={40}
              icon="bag-suitcase"
              style={[styles.baggageIcon, { backgroundColor: theme.colors.secondaryContainer }]}
            />
            <Text style={styles.baggageLabel}>Bagaj</Text>
            <Text style={styles.baggageValue}>{flight.baggage.checked}</Text>
          </View>
        </View>
        
        <Text style={styles.baggageNote}>
          * Bagaj ağırlık limitleri standart ekonomi sınıfı için geçerlidir.
        </Text>
      </Surface>
    );
  };

  const renderActions = () => {
    if (!flight) return null;

    return (
      <Surface style={styles.actions} elevation={2}>
        <Button
          mode="outlined"
          onPress={() => setShowPriceAlert(true)}
          style={styles.actionButton}
          icon="heart"
        >
          Fiyat Takibi
        </Button>
        
        <Button
          mode="contained"
          onPress={handleBookFlight}
          style={styles.actionButton}
          icon="airplane"
        >
          Rezervasyon
        </Button>
      </Surface>
    );
  };

  const renderPriceAlertModal = () => (
    <Modal
      visible={showPriceAlert}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPriceAlert(false)}
    >
      <View style={styles.modalOverlay}>
        <Surface style={styles.modalContent} elevation={4}>
          <View style={styles.modalHeader}>
            <Title style={styles.modalTitle}>Fiyat Alarmı Oluştur</Title>
            <IconButton
              icon="close"
              onPress={() => setShowPriceAlert(false)}
            />
          </View>
          
          <Paragraph style={styles.modalDescription}>
            Bu uçuşun fiyatı belirlediğiniz seviyeye düştüğünde bildirim alacaksınız.
          </Paragraph>
          
          <TextInput
            label="Hedef Fiyat (TRY)"
            value={targetPrice}
            onChangeText={setTargetPrice}
            keyboardType="numeric"
            style={styles.priceInput}
            right={<TextInput.Icon icon="currency-try" />}
          />
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowPriceAlert(false)}
              style={styles.modalButton}
            >
              İptal
            </Button>
            <Button
              mode="contained"
              onPress={handleAddToWatchlist}
              loading={loading}
              disabled={loading}
              style={styles.modalButton}
            >
              Alarm Oluştur
            </Button>
          </View>
        </Surface>
      </View>
    </Modal>
  );

  if (!flight) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Uçuş detayları yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderFlightHeader()}
        {renderFlightInfo()}
        {renderPriceChart()}
        {renderBaggageInfo()}
        {renderActions()}
      </ScrollView>
      
      {renderPriceAlertModal()}
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
  flightHeader: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airlineIcon: {
    marginRight: spacing.md,
  },
  airlineDetails: {
    // Default styles
  },
  airlineName: {
    fontSize: typography.titleLarge.fontSize,
    fontWeight: typography.titleLarge.fontWeight,
  },
  flightNumber: {
    fontSize: typography.bodyMedium.fontSize,
    opacity: 0.9,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: typography.displaySmall.fontSize,
    fontWeight: typography.displaySmall.fontWeight,
  },
  priceLabel: {
    fontSize: typography.bodySmall.fontSize,
    opacity: 0.8,
  },
  flightInfo: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
    marginBottom: spacing.md,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  routePoint: {
    flex: 1,
    alignItems: 'center',
  },
  routeTime: {
    fontSize: typography.headlineSmall.fontSize,
    fontWeight: typography.headlineSmall.fontWeight,
    marginBottom: spacing.xs,
  },
  routeCode: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
    marginBottom: spacing.xs,
  },
  routeCity: {
    fontSize: typography.bodyMedium.fontSize,
    color: '#666',
    marginBottom: spacing.xs,
  },
  routeName: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
    textAlign: 'center',
  },
  routeConnector: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  routeDuration: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
    marginBottom: spacing.xs,
  },
  routeLine: {
    height: 2,
    backgroundColor: '#e0e0e0',
    width: 60,
    marginBottom: spacing.xs,
  },
  routeIcon: {
    // Default styles
  },
  flightDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.bodyMedium.fontSize,
    color: '#666',
  },
  detailValue: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
  },
  chartContainer: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  priceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: spacing.md,
  },
  priceStat: {
    alignItems: 'center',
  },
  priceStatLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
    marginBottom: spacing.xs,
  },
  priceStatValue: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
  },
  baggageInfo: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: 12,
  },
  baggageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  baggageItem: {
    alignItems: 'center',
  },
  baggageIcon: {
    marginBottom: spacing.sm,
  },
  baggageLabel: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
    marginBottom: spacing.xs,
  },
  baggageValue: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
    color: '#666',
  },
  baggageNote: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 64,
    borderRadius: 12,
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.titleLarge.fontSize,
    fontWeight: typography.titleLarge.fontWeight,
  },
  modalDescription: {
    fontSize: typography.bodyMedium.fontSize,
    color: '#666',
    marginBottom: spacing.md,
  },
  priceInput: {
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default FlightDetailsScreen;