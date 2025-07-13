export interface Flight {
  id: string;
  airline: 'Pegasus' | 'AJet';
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  price: number;
  currency: string;
  duration: string;
  stops: number;
  available: boolean;
  baggage?: {
    cabin: string;
    checked: string;
  };
}

export interface WatchlistItem {
  id: string;
  flight: Flight;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: string;
  lastChecked: string;
  notifications: boolean;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface SearchParams {
  from: Airport;
  to: Airport;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'oneWay' | 'roundTrip';
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    notifications: boolean;
    currency: string;
    language: string;
    theme: 'light' | 'dark' | 'system';
  };
}

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: 'price_drop' | 'price_increase' | 'general';
  flightId?: string;
  timestamp: string;
  read: boolean;
}