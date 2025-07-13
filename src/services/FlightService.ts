import {Flight, SearchParams, Airport} from '../types';

// Mock data for demonstration
const mockAirports: Airport[] = [
  {code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey'},
  {code: 'SAW', name: 'Sabiha Gokcen Airport', city: 'Istanbul', country: 'Turkey'},
  {code: 'AYT', name: 'Antalya Airport', city: 'Antalya', country: 'Turkey'},
  {code: 'IZM', name: 'Adnan Menderes Airport', city: 'Izmir', country: 'Turkey'},
  {code: 'ESB', name: 'Esenboga Airport', city: 'Ankara', country: 'Turkey'},
  {code: 'ADB', name: 'Adnan Menderes Airport', city: 'Izmir', country: 'Turkey'},
  {code: 'DLM', name: 'Dalaman Airport', city: 'Dalaman', country: 'Turkey'},
  {code: 'BJV', name: 'Milas Bodrum Airport', city: 'Bodrum', country: 'Turkey'},
];

const generateMockFlight = (
  airline: 'Pegasus' | 'AJet',
  from: Airport,
  to: Airport,
  date: string,
  basePrice: number,
): Flight => {
  const id = Math.random().toString(36).substr(2, 9);
  const flightNumber = `${airline === 'Pegasus' ? 'PC' : 'VF'}${Math.floor(Math.random() * 9000) + 1000}`;
  const departureTime = `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
  const duration = Math.floor(Math.random() * 180) + 60; // 1-4 hours
  const arrivalTime = new Date(new Date(`${date} ${departureTime}`).getTime() + duration * 60000)
    .toTimeString()
    .slice(0, 5);
  
  return {
    id,
    airline,
    flightNumber,
    departure: {
      airport: from.code,
      city: from.city,
      time: departureTime,
      date,
    },
    arrival: {
      airport: to.code,
      city: to.city,
      time: arrivalTime,
      date,
    },
    price: basePrice + Math.floor(Math.random() * 200),
    currency: 'TRY',
    duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
    stops: Math.random() > 0.7 ? 1 : 0,
    available: true,
    baggage: {
      cabin: '8kg',
      checked: '20kg',
    },
  };
};

export class FlightService {
  private static instance: FlightService;
  private baseUrl = 'https://api.erzanfly.com/v1';

  public static getInstance(): FlightService {
    if (!FlightService.instance) {
      FlightService.instance = new FlightService();
    }
    return FlightService.instance;
  }

  async searchFlights(params: SearchParams): Promise<Flight[]> {
    try {
      // Mock API call - in real implementation, this would call actual APIs
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const flights: Flight[] = [];
      
      // Generate mock Pegasus flights
      for (let i = 0; i < 3; i++) {
        flights.push(generateMockFlight('Pegasus', params.from, params.to, params.departureDate, 299));
      }
      
      // Generate mock AJet flights
      for (let i = 0; i < 3; i++) {
        flights.push(generateMockFlight('AJet', params.from, params.to, params.departureDate, 349));
      }
      
      return flights.sort((a, b) => a.price - b.price);
    } catch (error) {
      console.error('Error searching flights:', error);
      throw new Error('Failed to search flights');
    }
  }

  async getFlightDetails(flightId: string): Promise<Flight | null> {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real implementation, this would fetch specific flight details
      const mockFlight = generateMockFlight('Pegasus', mockAirports[0], mockAirports[1], '2024-01-15', 299);
      mockFlight.id = flightId;
      
      return mockFlight;
    } catch (error) {
      console.error('Error getting flight details:', error);
      return null;
    }
  }

  async getAirports(): Promise<Airport[]> {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockAirports;
    } catch (error) {
      console.error('Error getting airports:', error);
      return [];
    }
  }

  async trackPriceChanges(flightId: string): Promise<number> {
    try {
      // Mock price tracking
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate price change (±20%)
      const basePrice = 299;
      const change = (Math.random() - 0.5) * 0.4; // -20% to +20%
      return Math.floor(basePrice * (1 + change));
    } catch (error) {
      console.error('Error tracking price changes:', error);
      throw new Error('Failed to track price changes');
    }
  }

  // Real API integration methods (commented out for demo)
  /*
  private async callPegasusAPI(endpoint: string, params: any): Promise<any> {
    const response = await fetch(`https://api.pegasus.com/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_PEGASUS_API_KEY',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Pegasus API request failed');
    }
    
    return response.json();
  }

  private async callAJetAPI(endpoint: string, params: any): Promise<any> {
    const response = await fetch(`https://api.ajet.com/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_AJET_API_KEY',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('AJet API request failed');
    }
    
    return response.json();
  }
  */
}