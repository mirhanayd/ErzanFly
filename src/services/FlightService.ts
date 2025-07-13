import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Flight {
  id: string;
  airline: 'Pegasus' | 'AJet';
  flightNumber: string;
  from: Airport;
  to: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  availableSeats: number;
  aircraft: string;
  baggage: {
    cabin: string;
    checked: string;
  };
  priceHistory: PricePoint[];
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface SearchParams {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'oneWay' | 'roundTrip';
}

export interface WatchlistItem {
  id: string;
  searchParams: SearchParams;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: string;
  lastChecked: string;
}

class FlightService {
  private readonly PEGASUS_API_URL = 'https://api.pegasus.com.tr/v1';
  private readonly AJET_API_URL = 'https://api.ajet.anadolujet.com/v1';
  private readonly CACHE_KEY = 'flight_cache';
  private readonly WATCHLIST_KEY = 'flight_watchlist';

  // Popular airports in Turkey
  private readonly AIRPORTS: Airport[] = [
    { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
    { code: 'SAW', name: 'Sabiha Gökçen Airport', city: 'Istanbul', country: 'Turkey' },
    { code: 'ESB', name: 'Esenboğa Airport', city: 'Ankara', country: 'Turkey' },
    { code: 'ADB', name: 'Adnan Menderes Airport', city: 'Izmir', country: 'Turkey' },
    { code: 'AYT', name: 'Antalya Airport', city: 'Antalya', country: 'Turkey' },
    { code: 'BJV', name: 'Bodrum Airport', city: 'Bodrum', country: 'Turkey' },
    { code: 'DLM', name: 'Dalaman Airport', city: 'Dalaman', country: 'Turkey' },
    { code: 'TZX', name: 'Trabzon Airport', city: 'Trabzon', country: 'Turkey' },
    { code: 'KYA', name: 'Konya Airport', city: 'Konya', country: 'Turkey' },
    { code: 'VAN', name: 'Van Airport', city: 'Van', country: 'Turkey' },
  ];

  async searchFlights(params: SearchParams): Promise<Flight[]> {
    try {
      // Check cache first
      const cachedResults = await this.getCachedFlights(params);
      if (cachedResults) {
        return cachedResults;
      }

      // Simulate API calls to Pegasus and AJet
      const [pegasusFlights, ajetFlights] = await Promise.all([
        this.searchPegasusFlights(params),
        this.searchAJetFlights(params),
      ]);

      const allFlights = [...pegasusFlights, ...ajetFlights];
      
      // Cache results
      await this.cacheFlights(params, allFlights);
      
      return allFlights;
    } catch (error) {
      console.error('Error searching flights:', error);
      throw new Error('Failed to search flights');
    }
  }

  private async searchPegasusFlights(params: SearchParams): Promise<Flight[]> {
    // Simulate Pegasus API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return this.generateMockFlights(params, 'Pegasus');
  }

  private async searchAJetFlights(params: SearchParams): Promise<Flight[]> {
    // Simulate AJet API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return this.generateMockFlights(params, 'AJet');
  }

  private generateMockFlights(params: SearchParams, airline: 'Pegasus' | 'AJet'): Flight[] {
    const fromAirport = this.AIRPORTS.find(a => a.code === params.from);
    const toAirport = this.AIRPORTS.find(a => a.code === params.to);

    if (!fromAirport || !toAirport) {
      return [];
    }

    const flights: Flight[] = [];
    const basePrice = airline === 'Pegasus' ? 200 : 250;

    for (let i = 0; i < 3; i++) {
      const departureHour = 6 + i * 4;
      const arrivalHour = departureHour + 2;
      const price = basePrice + Math.random() * 100;

      flights.push({
        id: `${airline}-${Date.now()}-${i}`,
        airline,
        flightNumber: `${airline === 'Pegasus' ? 'PC' : 'VF'}${1000 + i}`,
        from: fromAirport,
        to: toAirport,
        departureTime: `${params.departureDate}T${departureHour.toString().padStart(2, '0')}:00:00`,
        arrivalTime: `${params.departureDate}T${arrivalHour.toString().padStart(2, '0')}:00:00`,
        duration: '2h 00m',
        price: Math.round(price),
        currency: 'TRY',
        availableSeats: 30 + Math.floor(Math.random() * 50),
        aircraft: airline === 'Pegasus' ? 'Boeing 737-800' : 'Airbus A320',
        baggage: {
          cabin: '8kg',
          checked: '20kg',
        },
        priceHistory: this.generatePriceHistory(price),
      });
    }

    return flights;
  }

  private generatePriceHistory(currentPrice: number): PricePoint[] {
    const history: PricePoint[] = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const priceVariation = (Math.random() - 0.5) * 0.2; // ±20% variation
      const price = currentPrice * (1 + priceVariation);
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
      });
    }
    
    return history;
  }

  async getAirports(): Promise<Airport[]> {
    return this.AIRPORTS;
  }

  async getFlightDetails(flightId: string): Promise<Flight | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const flightCache = JSON.parse(cached);
        for (const flights of Object.values(flightCache)) {
          const flight = (flights as Flight[]).find(f => f.id === flightId);
          if (flight) {
            return flight;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting flight details:', error);
      return null;
    }
  }

  async addToWatchlist(searchParams: SearchParams, targetPrice: number): Promise<void> {
    try {
      const watchlist = await this.getWatchlist();
      const newItem: WatchlistItem = {
        id: `watchlist-${Date.now()}`,
        searchParams,
        targetPrice,
        currentPrice: 0, // Will be updated by background job
        isActive: true,
        createdAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
      };

      watchlist.push(newItem);
      await AsyncStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw new Error('Failed to add to watchlist');
    }
  }

  async getWatchlist(): Promise<WatchlistItem[]> {
    try {
      const stored = await AsyncStorage.getItem(this.WATCHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting watchlist:', error);
      return [];
    }
  }

  async updateWatchlistItem(id: string, updates: Partial<WatchlistItem>): Promise<void> {
    try {
      const watchlist = await this.getWatchlist();
      const index = watchlist.findIndex(item => item.id === id);
      
      if (index !== -1) {
        watchlist[index] = { ...watchlist[index], ...updates };
        await AsyncStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(watchlist));
      }
    } catch (error) {
      console.error('Error updating watchlist item:', error);
      throw new Error('Failed to update watchlist item');
    }
  }

  async removeFromWatchlist(id: string): Promise<void> {
    try {
      const watchlist = await this.getWatchlist();
      const filtered = watchlist.filter(item => item.id !== id);
      await AsyncStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw new Error('Failed to remove from watchlist');
    }
  }

  async checkPriceUpdates(): Promise<void> {
    try {
      const watchlist = await this.getWatchlist();
      const activeItems = watchlist.filter(item => item.isActive);

      for (const item of activeItems) {
        const flights = await this.searchFlights(item.searchParams);
        const lowestPrice = Math.min(...flights.map(f => f.price));
        
        await this.updateWatchlistItem(item.id, {
          currentPrice: lowestPrice,
          lastChecked: new Date().toISOString(),
        });

        // Check if price alert should be triggered
        if (lowestPrice <= item.targetPrice) {
          // Trigger notification (handled by NotificationService)
          console.log(`Price alert: Flight from ${item.searchParams.from} to ${item.searchParams.to} is now ${lowestPrice} TRY`);
        }
      }
    } catch (error) {
      console.error('Error checking price updates:', error);
    }
  }

  private async getCachedFlights(params: SearchParams): Promise<Flight[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const flightCache = JSON.parse(cached);
        const cacheKey = this.generateCacheKey(params);
        const cachedFlights = flightCache[cacheKey];
        
        if (cachedFlights && cachedFlights.timestamp > Date.now() - 300000) { // 5 minutes
          return cachedFlights.flights;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached flights:', error);
      return null;
    }
  }

  private async cacheFlights(params: SearchParams, flights: Flight[]): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      const flightCache = cached ? JSON.parse(cached) : {};
      const cacheKey = this.generateCacheKey(params);
      
      flightCache[cacheKey] = {
        flights,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(flightCache));
    } catch (error) {
      console.error('Error caching flights:', error);
    }
  }

  private generateCacheKey(params: SearchParams): string {
    return `${params.from}-${params.to}-${params.departureDate}-${params.passengers}-${params.tripType}`;
  }
}

export default new FlightService();