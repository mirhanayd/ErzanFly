import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
  Surface,
  Switch,
  Menu,
  Divider,
  IconButton,
} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

import {theme} from '../theme/theme';
import {FlightService} from '../services/FlightService';
import {Flight, Airport, SearchParams} from '../types';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    from: null,
    to: null,
    departureDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    returnDate: null,
    passengers: 1,
    tripType: 'oneWay',
  });
  
  const [airports, setAirports] = useState<Airport[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  // UI state
  const [showDepartureDatePicker, setShowDepartureDatePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  const [fromMenuVisible, setFromMenuVisible] = useState(false);
  const [toMenuVisible, setToMenuVisible] = useState(false);
  const [passengersMenuVisible, setPassengersMenuVisible] = useState(false);

  const flightService = FlightService.getInstance();

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    setLoading(true);
    try {
      const airportData = await flightService.getAirports();
      setAirports(airportData);
    } catch (error) {
      console.error('Error loading airports:', error);
      Alert.alert('Error', 'Failed to load airports');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchParams.from || !searchParams.to) {
      Alert.alert('Error', 'Please select both departure and arrival airports');
      return;
    }

    if (searchParams.from.code === searchParams.to.code) {
      Alert.alert('Error', 'Departure and arrival airports cannot be the same');
      return;
    }

    setSearching(true);
    try {
      const results = await flightService.searchFlights(searchParams);
      setFlights(results);
    } catch (error) {
      console.error('Error searching flights:', error);
      Alert.alert('Error', 'Failed to search flights');
    } finally {
      setSearching(false);
    }
  };

  const handleFlightPress = (flight: Flight) => {
    navigation.navigate('FlightDetails', {flight});
  };

  const handleSwapAirports = () => {
    setSearchParams(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
  };

  const renderAirportSelector = (
    label: string,
    selectedAirport: Airport | null,
    onSelect: (airport: Airport) => void,
    menuVisible: boolean,
    setMenuVisible: (visible: boolean) => void
  ) => (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Surface style={styles.airportSelector}>
            <View style={styles.airportSelectorContent}>
              <Paragraph style={styles.airportLabel}>{label}</Paragraph>
              {selectedAirport ? (
                <View>
                  <Title style={styles.airportCode}>{selectedAirport.code}</Title>
                  <Paragraph style={styles.airportName}>{selectedAirport.city}</Paragraph>
                </View>
              ) : (
                <Paragraph style={styles.placeholderText}>Select airport</Paragraph>
              )}
            </View>
            <Icon name="arrow-drop-down" size={24} color={theme.colors.onSurface} />
          </Surface>
        </TouchableOpacity>
      }>
      <ScrollView style={styles.airportMenu}>
        {airports.map((airport) => (
          <Menu.Item
            key={airport.code}
            onPress={() => {
              onSelect(airport);
              setMenuVisible(false);
            }}
            title={`${airport.code} - ${airport.city}`}
            titleStyle={styles.menuItemTitle}
          />
        ))}
      </ScrollView>
    </Menu>
  );

  const renderFlightCard = (flight: Flight) => (
    <Card
      key={flight.id}
      style={styles.flightCard}
      onPress={() => handleFlightPress(flight)}>
      <Card.Content>
        <View style={styles.flightHeader}>
          <View style={styles.airlineContainer}>
            <Icon name="flight" size={20} color={theme.colors.primary} />
            <Paragraph style={styles.airlineText}>
              {flight.airline} {flight.flightNumber}
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
            <Title style={styles.airportCode}>{flight.departure.airport}</Title>
            <Paragraph style={styles.cityName}>{flight.departure.city}</Paragraph>
            <Paragraph style={styles.timeText}>{flight.departure.time}</Paragraph>
          </View>
          
          <View style={styles.routeMiddle}>
            <Icon name="arrow-forward" size={20} color={theme.colors.primary} />
            <Paragraph style={styles.durationText}>{flight.duration}</Paragraph>
            {flight.stops > 0 && (
              <Paragraph style={styles.stopsText}>
                {flight.stops} stop{flight.stops > 1 ? 's' : ''}
              </Paragraph>
            )}
          </View>
          
          <View style={styles.routePoint}>
            <Title style={styles.airportCode}>{flight.arrival.airport}</Title>
            <Paragraph style={styles.cityName}>{flight.arrival.city}</Paragraph>
            <Paragraph style={styles.timeText}>{flight.arrival.time}</Paragraph>
          </View>
        </View>
        
        <View style={styles.flightFooter}>
          <Paragraph style={styles.baggageText}>
            Cabin: {flight.baggage?.cabin} | Checked: {flight.baggage?.checked}
          </Paragraph>
          <Chip
            style={[
              styles.statusChip,
              {backgroundColor: flight.available ? theme.colors.tertiaryContainer : theme.colors.errorContainer},
            ]}>
            {flight.available ? 'Available' : 'Unavailable'}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Paragraph style={styles.loadingText}>Loading airports...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Search Form */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <Title style={styles.searchTitle}>Search Flights</Title>
            
            {/* Trip Type Toggle */}
            <View style={styles.tripTypeContainer}>
              <View style={styles.tripTypeOption}>
                <Paragraph>One Way</Paragraph>
                <Switch
                  value={searchParams.tripType === 'roundTrip'}
                  onValueChange={(value) =>
                    setSearchParams(prev => ({
                      ...prev,
                      tripType: value ? 'roundTrip' : 'oneWay',
                      returnDate: value ? prev.returnDate : null,
                    }))
                  }
                />
                <Paragraph>Round Trip</Paragraph>
              </View>
            </View>

            {/* Airport Selection */}
            <View style={styles.airportSelectionContainer}>
              <View style={styles.airportRow}>
                <View style={styles.airportColumn}>
                  {renderAirportSelector(
                    'From',
                    searchParams.from,
                    (airport) => setSearchParams(prev => ({...prev, from: airport})),
                    fromMenuVisible,
                    setFromMenuVisible
                  )}
                </View>
                
                <IconButton
                  icon="swap-horiz"
                  size={24}
                  onPress={handleSwapAirports}
                  style={styles.swapButton}
                />
                
                <View style={styles.airportColumn}>
                  {renderAirportSelector(
                    'To',
                    searchParams.to,
                    (airport) => setSearchParams(prev => ({...prev, to: airport})),
                    toMenuVisible,
                    setToMenuVisible
                  )}
                </View>
              </View>
            </View>

            {/* Date Selection */}
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDepartureDatePicker(true)}>
                <Paragraph style={styles.dateLabel}>Departure</Paragraph>
                <Title style={styles.dateText}>
                  {new Date(searchParams.departureDate).toLocaleDateString()}
                </Title>
              </TouchableOpacity>
              
              {searchParams.tripType === 'roundTrip' && (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowReturnDatePicker(true)}>
                  <Paragraph style={styles.dateLabel}>Return</Paragraph>
                  <Title style={styles.dateText}>
                    {searchParams.returnDate
                      ? new Date(searchParams.returnDate).toLocaleDateString()
                      : 'Select date'}
                  </Title>
                </TouchableOpacity>
              )}
            </View>

            {/* Passengers */}
            <Menu
              visible={passengersMenuVisible}
              onDismiss={() => setPassengersMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.passengersButton}
                  onPress={() => setPassengersMenuVisible(true)}>
                  <Paragraph style={styles.passengersLabel}>Passengers</Paragraph>
                  <Title style={styles.passengersText}>
                    {searchParams.passengers} passenger{searchParams.passengers > 1 ? 's' : ''}
                  </Title>
                  <Icon name="arrow-drop-down" size={24} color={theme.colors.onSurface} />
                </TouchableOpacity>
              }>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <Menu.Item
                  key={num}
                  onPress={() => {
                    setSearchParams(prev => ({...prev, passengers: num}));
                    setPassengersMenuVisible(false);
                  }}
                  title={`${num} passenger${num > 1 ? 's' : ''}`}
                />
              ))}
            </Menu>

            {/* Search Button */}
            <Button
              mode="contained"
              onPress={handleSearch}
              loading={searching}
              disabled={searching}
              style={styles.searchButton}>
              Search Flights
            </Button>
          </Card.Content>
        </Card>

        {/* Search Results */}
        {flights.length > 0 && (
          <View style={styles.resultsContainer}>
            <Title style={styles.resultsTitle}>
              {flights.length} flights found
            </Title>
            {flights.map(renderFlightCard)}
          </View>
        )}
      </ScrollView>

      {/* Date Pickers */}
      <DatePicker
        modal
        open={showDepartureDatePicker}
        date={new Date(searchParams.departureDate)}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => {
          setShowDepartureDatePicker(false);
          setSearchParams(prev => ({
            ...prev,
            departureDate: date.toISOString().split('T')[0],
          }));
        }}
        onCancel={() => setShowDepartureDatePicker(false)}
      />

      <DatePicker
        modal
        open={showReturnDatePicker}
        date={searchParams.returnDate ? new Date(searchParams.returnDate) : new Date()}
        mode="date"
        minimumDate={new Date(searchParams.departureDate)}
        onConfirm={(date) => {
          setShowReturnDatePicker(false);
          setSearchParams(prev => ({
            ...prev,
            returnDate: date.toISOString().split('T')[0],
          }));
        }}
        onCancel={() => setShowReturnDatePicker(false)}
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
  searchCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  tripTypeContainer: {
    marginBottom: 16,
  },
  tripTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  airportSelectionContainer: {
    marginBottom: 16,
  },
  airportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  airportColumn: {
    flex: 1,
  },
  swapButton: {
    margin: 0,
  },
  airportSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },
  airportSelectorContent: {
    flex: 1,
  },
  airportLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  airportCode: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  airportName: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  placeholderText: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  airportMenu: {
    maxHeight: 200,
  },
  menuItemTitle: {
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },
  dateLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
  },
  passengersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
    marginBottom: 16,
  },
  passengersLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  passengersText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
  },
  searchButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
    marginBottom: 16,
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
    marginBottom: 16,
  },
  routePoint: {
    alignItems: 'center',
    flex: 1,
  },
  routeMiddle: {
    alignItems: 'center',
    paddingHorizontal: 10,
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
  stopsText: {
    fontSize: 10,
    color: theme.colors.secondary,
    marginTop: 1,
  },
  flightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  baggageText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  statusChip: {
    borderRadius: 12,
  },
});

export default SearchScreen;