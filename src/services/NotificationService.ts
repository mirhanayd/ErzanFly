import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

export interface NotificationSettings {
  priceAlerts: boolean;
  flightUpdates: boolean;
  promotions: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface PriceAlert {
  id: string;
  flightRoute: string;
  targetPrice: number;
  currentPrice: number;
  title: string;
  message: string;
  timestamp: string;
}

class NotificationService {
  private readonly SETTINGS_KEY = 'notification_settings';
  private readonly ALERTS_KEY = 'price_alerts';
  private readonly DEFAULT_SETTINGS: NotificationSettings = {
    priceAlerts: true,
    flightUpdates: true,
    promotions: false,
    sound: true,
    vibration: true,
  };

  async initialize(): Promise<void> {
    try {
      // Request permission for notifications
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted');
        await this.setupMessageHandlers();
        await this.getFCMToken();
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private async setupMessageHandlers(): Promise<void> {
    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      
      if (remoteMessage.notification) {
        this.showLocalNotification(
          remoteMessage.notification.title || 'ErzanFly',
          remoteMessage.notification.body || '',
          remoteMessage.data
        );
      }
    });

    // Handle background messages
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app:', remoteMessage);
      this.handleNotificationTap(remoteMessage.data);
    });

    // Handle app opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state:', remoteMessage);
          this.handleNotificationTap(remoteMessage.data);
        }
      });
  }

  private async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      // Store token for backend registration
      await AsyncStorage.setItem('fcm_token', token);
      
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  private showLocalNotification(title: string, body: string, data?: any): void {
    if (Platform.OS === 'android') {
      // For Android, you might want to use react-native-push-notification
      // or similar library for local notifications
      Alert.alert(title, body);
    } else {
      Alert.alert(title, body);
    }
  }

  private handleNotificationTap(data?: any): void {
    if (data?.type === 'price_alert') {
      // Navigate to watchlist screen
      console.log('Navigate to watchlist with data:', data);
    } else if (data?.type === 'flight_update') {
      // Navigate to flight details
      console.log('Navigate to flight details with data:', data);
    }
  }

  async sendPriceAlert(
    flightRoute: string,
    targetPrice: number,
    currentPrice: number
  ): Promise<void> {
    try {
      const settings = await this.getSettings();
      
      if (!settings.priceAlerts) {
        return;
      }

      const title = 'Fiyat Alarmı! 🚨';
      const message = `${flightRoute} rotası için hedef fiyatınıza ulaşıldı! ${currentPrice} TRY`;
      
      const alert: PriceAlert = {
        id: `alert-${Date.now()}`,
        flightRoute,
        targetPrice,
        currentPrice,
        title,
        message,
        timestamp: new Date().toISOString(),
      };

      // Save alert to local storage
      await this.saveAlert(alert);

      // Send local notification
      this.showLocalNotification(title, message, {
        type: 'price_alert',
        flightRoute,
        targetPrice,
        currentPrice,
      });

      // In a real app, you would also send this to your backend
      // to trigger a push notification
      await this.sendPushNotification(title, message, {
        type: 'price_alert',
        flightRoute,
        targetPrice: targetPrice.toString(),
        currentPrice: currentPrice.toString(),
      });

    } catch (error) {
      console.error('Error sending price alert:', error);
    }
  }

  async sendFlightUpdate(
    flightNumber: string,
    updateType: 'delay' | 'gate_change' | 'cancellation',
    message: string
  ): Promise<void> {
    try {
      const settings = await this.getSettings();
      
      if (!settings.flightUpdates) {
        return;
      }

      const title = `Uçuş Güncelleme - ${flightNumber}`;
      
      this.showLocalNotification(title, message, {
        type: 'flight_update',
        flightNumber,
        updateType,
      });

      await this.sendPushNotification(title, message, {
        type: 'flight_update',
        flightNumber,
        updateType,
      });

    } catch (error) {
      console.error('Error sending flight update:', error);
    }
  }

  async sendPromotionalNotification(title: string, message: string): Promise<void> {
    try {
      const settings = await this.getSettings();
      
      if (!settings.promotions) {
        return;
      }

      this.showLocalNotification(title, message, {
        type: 'promotion',
      });

      await this.sendPushNotification(title, message, {
        type: 'promotion',
      });

    } catch (error) {
      console.error('Error sending promotional notification:', error);
    }
  }

  private async sendPushNotification(title: string, body: string, data: any): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('fcm_token');
      
      if (!token) {
        console.log('No FCM token available');
        return;
      }

      // In a real app, you would send this to your backend server
      // which would then send the push notification via FCM
      console.log('Would send push notification:', { title, body, data, token });
      
      // Example backend API call:
      // await fetch('https://your-backend.com/api/send-notification', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     token,
      //     title,
      //     body,
      //     data,
      //   }),
      // });

    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async getSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem(this.SETTINGS_KEY);
      return stored ? JSON.parse(stored) : this.DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return this.DEFAULT_SETTINGS;
    }
  }

  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw new Error('Failed to update notification settings');
    }
  }

  async getAlerts(): Promise<PriceAlert[]> {
    try {
      const stored = await AsyncStorage.getItem(this.ALERTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  }

  private async saveAlert(alert: PriceAlert): Promise<void> {
    try {
      const alerts = await this.getAlerts();
      alerts.unshift(alert); // Add to beginning
      
      // Keep only last 50 alerts
      const trimmedAlerts = alerts.slice(0, 50);
      
      await AsyncStorage.setItem(this.ALERTS_KEY, JSON.stringify(trimmedAlerts));
    } catch (error) {
      console.error('Error saving alert:', error);
    }
  }

  async clearAlerts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.ALERTS_KEY);
    } catch (error) {
      console.error('Error clearing alerts:', error);
    }
  }

  async schedulePriceCheck(): Promise<void> {
    try {
      // In a real app, you would use a background job library
      // like react-native-background-job or react-native-background-task
      
      // For demonstration, we'll just log that we would schedule it
      console.log('Price check scheduled - would run every 30 minutes');
      
      // Example with react-native-background-job:
      // BackgroundJob.register({
      //   jobKey: 'priceCheck',
      //   period: 30 * 60 * 1000, // 30 minutes
      //   job: () => {
      //     FlightService.checkPriceUpdates();
      //   },
      // });
      
    } catch (error) {
      console.error('Error scheduling price check:', error);
    }
  }

  async cancelPriceCheck(): Promise<void> {
    try {
      console.log('Price check cancelled');
      
      // Example with react-native-background-job:
      // BackgroundJob.unregister('priceCheck');
      
    } catch (error) {
      console.error('Error cancelling price check:', error);
    }
  }
}

export default new NotificationService();