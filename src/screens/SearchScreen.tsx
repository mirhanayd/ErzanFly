import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Surface,
  Text,
  Avatar,
  useTheme,
  IconButton,
  Chip,
  ActivityIndicator,
  Badge,
} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import FlightService, { Airport, Flight, SearchParams } from '../services/FlightService';
import { spacing, typography } from '../theme/theme';
import { format } from 'date-fns';

const SearchScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  const [fromAirport, setFromAirport] = useState<Airport | null>(null);
  const [toAirport, setToAirport] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [passengers, setPassengers] = useState(1);
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>('oneWay');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'departure' | 'return'>('departure');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [showAirportSelector, setShowAirportSelector] = useState(false);
  const [airportSelectorType, setAirportSelectorType] = useState<'from' | 'to'>('from');
  const [airportSearchQuery, setAirportSearchQuery] = useState('');

  useEffect(() => {
    loadAirports();
    
    // Handle navigation params
    const params = route.params as any;
    if (params?.from) {
      const airport = airports.find(a => a.city === params.from);
      if (airport) setFromAirport(airport);
    }
    if (params?.to) {
      const airport = airports.find(a => a.city === params.to);
      if (airport) setToAirport(airport);
    }
  }, [route.params, airports]);

  const loadAirports = async () => {
    try {
      const airportData = await FlightService.getAirports();
      setAirports(airportData);
    } catch (error) {
      console.error('Error loading airports:', error);
    }
  };

  const handleSearch = async () => {
    if (!fromAirport || !toAirport) {
      Alert.alert('Hata', 'Lütfen kalkış ve varış noktalarını seçin');
      return;
    }

    if (fromAirport.code === toAirport.code) {
      Alert.alert('Hata', 'Kalkış ve varış noktaları aynı olamaz');
      return;
    }

    setIsSearching(true);
    
    try {
      const searchParams: SearchParams = {
        from: fromAirport.code,
        to: toAirport.code,
        departureDate: format(departureDate, 'yyyy-MM-dd'),
        returnDate: tripType === 'roundTrip' ? format(returnDate, 'yyyy-MM-dd') : undefined,
        passengers,
        tripType,
      };

      const results = await FlightService.searchFlights(searchParams);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching flights:', error);
      Alert.alert('Hata', 'Uçuş arama sırasında bir hata oluştu');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSwapAirports = () => {
    const temp = fromAirport;
    setFromAirport(toAirport);
    setToAirport(temp);
  };

  const handleDateSelection = (date: Date) => {
    if (datePickerType === 'departure') {
      setDepartureDate(date);
    } else {
      setReturnDate(date);
    }
    setShowDatePicker(false);
  };

  const handleAirportSelection = (airport: Airport) => {
    if (airportSelectorType === 'from') {
      setFromAirport(airport);
    } else {
      setToAirport(airport);
    }
    setShowAirportSelector(false);
    setAirportSearchQuery('');
  };

  const filteredAirports = airports.filter(airport =>
    airport.name.toLowerCase().includes(airportSearchQuery.toLowerCase()) ||
    airport.city.toLowerCase().includes(airportSearchQuery.toLowerCase()) ||
    airport.code.toLowerCase().includes(airportSearchQuery.toLowerCase())
  );

  const renderSearchForm = () => (
    <Surface style={styles.searchForm} elevation={2}>
      <Title style={styles.sectionTitle}>Uçuş Ara</Title>
      
      {/* Trip Type Selection */}
      <View style={styles.tripTypeContainer}>
        <Chip
          selected={tripType === 'oneWay'}
          onPress={() => setTripType('oneWay')}
          style={styles.tripTypeChip}
        >
          Tek Yön
        </Chip>
        <Chip
          selected={tripType === 'roundTrip'}
          onPress={() => setTripType('roundTrip')}
          style={styles.tripTypeChip}
        >
          Gidiş-Dönüş
        </Chip>
      </View>

      {/* Airport Selection */}
      <View style={styles.airportRow}>
        <TouchableOpacity
          style={[styles.airportInput, { flex: 1 }]}
          onPress={() => {
            setAirportSelectorType('from');
            setShowAirportSelector(true);
          }}
        >
          <Text style={styles.airportLabel}>Nereden</Text>
          <Text style={styles.airportText}>
            {fromAirport ? `${fromAirport.city} (${fromAirport.code})` : 'Şehir/Havaalanı seç'}
          </Text>
        </TouchableOpacity>
        
        <IconButton
          icon="swap-horizontal"
          size={24}
          onPress={handleSwapAirports}
          style={styles.swapButton}
        />
        
        <TouchableOpacity
          style={[styles.airportInput, { flex: 1 }]}
          onPress={() => {
            setAirportSelectorType('to');
            setShowAirportSelector(true);
          }}
        >
          <Text style={styles.airportLabel}>Nereye</Text>
          <Text style={styles.airportText}>
            {toAirport ? `${toAirport.city} (${toAirport.code})` : 'Şehir/Havaalanı seç'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Selection */}
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={[styles.dateInput, { flex: 1 }]}
          onPress={() => {
            setDatePickerType('departure');
            setShowDatePicker(true);
          }}
        >
          <Text style={styles.dateLabel}>Gidiş</Text>
          <Text style={styles.dateText}>{format(departureDate, 'dd MMM yyyy')}</Text>
        </TouchableOpacity>
        
        {tripType === 'roundTrip' && (
          <TouchableOpacity
            style={[styles.dateInput, { flex: 1, marginLeft: spacing.sm }]}
            onPress={() => {
              setDatePickerType('return');
              setShowDatePicker(true);
            }}
          >
            <Text style={styles.dateLabel}>Dönüş</Text>
            <Text style={styles.dateText}>{format(returnDate, 'dd MMM yyyy')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Passenger Selection */}
      <View style={styles.passengerRow}>
        <Text style={styles.passengerLabel}>Yolcu Sayısı</Text>
        <View style={styles.passengerCounter}>
          <IconButton
            icon="minus"
            size={20}
            onPress={() => setPassengers(Math.max(1, passengers - 1))}
            disabled={passengers <= 1}
          />
          <Text style={styles.passengerCount}>{passengers}</Text>
          <IconButton
            icon="plus"
            size={20}
            onPress={() => setPassengers(Math.min(9, passengers + 1))}
            disabled={passengers >= 9}
          />
        </View>
      </View>

      {/* Search Button */}
      <Button
        mode="contained"
        onPress={handleSearch}
        loading={isSearching}
        disabled={isSearching || !fromAirport || !toAirport}
        style={styles.searchButton}
        icon="magnify"
      >
        {isSearching ? 'Aranıyor...' : 'Uçuş Ara'}
      </Button>
    </Surface>
  );

  const renderFlightCard = ({ item }: { item: Flight }) => (
    <Card style={styles.flightCard} onPress={() => navigation.navigate('FlightDetails', { flight: item })}>
      <Card.Content>
        <View style={styles.flightHeader}>
          <Text style={styles.airline}>{item.airline}</Text>
          <Badge style={styles.priceBadge}>{item.price} {item.currency}</Badge>
        </View>
        
        <View style={styles.flightInfo}>
          <View style={styles.flightTime}>
            <Text style={styles.timeText}>
              {format(new Date(item.departureTime), 'HH:mm')}
            </Text>
            <Text style={styles.airportCode}>{item.from.code}</Text>
          </View>
          
          <View style={styles.flightDuration}>
            <Text style={styles.durationText}>{item.duration}</Text>
            <View style={styles.flightLine} />
            <Text style={styles.flightNumber}>{item.flightNumber}</Text>
          </View>
          
          <View style={styles.flightTime}>
            <Text style={styles.timeText}>
              {format(new Date(item.arrivalTime), 'HH:mm')}
            </Text>
            <Text style={styles.airportCode}>{item.to.code}</Text>
          </View>
        </View>
        
        <View style={styles.flightDetails}>
          <Text style={styles.aircraft}>{item.aircraft}</Text>
          <Text style={styles.seats}>{item.availableSeats} koltuk</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Uçuşlar aranıyor...</Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return null;
    }

    return (
      <Surface style={styles.resultsContainer} elevation={1}>
        <Title style={styles.resultsTitle}>
          {searchResults.length} uçuş bulundu
        </Title>
        <FlatList
          data={searchResults}
          renderItem={renderFlightCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </Surface>
    );
  };

  const renderAirportSelector = () => {
    if (!showAirportSelector) return null;

    return (
      <Surface style={styles.airportSelector} elevation={4}>
        <View style={styles.airportSelectorHeader}>
          <Title>
            {airportSelectorType === 'from' ? 'Nereden' : 'Nereye'}
          </Title>
          <IconButton
            icon="close"
            onPress={() => setShowAirportSelector(false)}
          />
        </View>
        
        <TextInput
          placeholder="Şehir veya havaalanı ara..."
          value={airportSearchQuery}
          onChangeText={setAirportSearchQuery}
          style={styles.airportSearch}
        />
        
        <FlatList
          data={filteredAirports}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.airportItem}
              onPress={() => handleAirportSelection(item)}
            >
              <Text style={styles.airportItemName}>{item.city}</Text>
              <Text style={styles.airportItemCode}>
                {item.name} ({item.code})
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.code}
          showsVerticalScrollIndicator={false}
        />
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderSearchForm()}
        {renderSearchResults()}
      </ScrollView>
      
      {renderAirportSelector()}
      
      <DatePicker
        modal
        open={showDatePicker}
        date={datePickerType === 'departure' ? departureDate : returnDate}
        mode="date"
        minimumDate={new Date()}
        onConfirm={handleDateSelection}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchForm: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: typography.titleLarge.fontSize,
    fontWeight: typography.titleLarge.fontWeight,
    marginBottom: spacing.md,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tripTypeChip: {
    flex: 1,
  },
  airportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  airportInput: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  airportLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
    marginBottom: spacing.xs,
  },
  airportText: {
    fontSize: typography.bodyMedium.fontSize,
    color: '#333',
  },
  swapButton: {
    marginHorizontal: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  dateInput: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dateLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: typography.bodyMedium.fontSize,
    color: '#333',
  },
  passengerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  passengerLabel: {
    fontSize: typography.bodyMedium.fontSize,
    color: '#333',
  },
  passengerCounter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerCount: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
    marginHorizontal: spacing.md,
  },
  searchButton: {
    marginTop: spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.bodyMedium.fontSize,
    color: '#666',
  },
  resultsContainer: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: 12,
  },
  resultsTitle: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
    marginBottom: spacing.md,
  },
  flightCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  airline: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
  },
  priceBadge: {
    backgroundColor: '#4CAF50',
  },
  flightInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  flightTime: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
  },
  airportCode: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
  },
  flightDuration: {
    alignItems: 'center',
    flex: 1,
  },
  durationText: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
  },
  flightLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: spacing.xs,
  },
  flightNumber: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aircraft: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
  },
  seats: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
  },
  airportSelector: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: spacing.md,
  },
  airportSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  airportSearch: {
    marginBottom: spacing.md,
  },
  airportItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  airportItemName: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
  },
  airportItemCode: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
  },
});

export default SearchScreen;