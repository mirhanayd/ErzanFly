import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NotificationData} from '../types';
import {Platform} from 'react-native';

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      PushNotification.configure({
        onRegister: function (token) {
          console.log('FCM Token:', token);
        },
        onNotification: function (notification) {
          console.log('Notification received:', notification);
          // Handle notification tap
          if (notification.userInteraction) {
            // User tapped on notification
            // Navigate to appropriate screen
          }
        },
        onAction: function (notification) {
          console.log('Action received:', notification.action);
        },
        onRegistrationError: function (err) {
          console.error('Registration error:', err);
          reject(err);
        },
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: true,
        requestPermissions: Platform.OS === 'ios',
      });

      // Create notification channel for Android
      PushNotification.createChannel(
        {
          channelId: 'erzanfly_price_alerts',
          channelName: 'Price Alerts',
          channelDescription: 'Notifications for flight price changes',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );

      this.isInitialized = true;
      resolve();
    });
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await PushNotification.requestPermissions();
      return permissions.alert && permissions.badge && permissions.sound;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async showLocalNotification(
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    PushNotification.localNotification({
      title,
      message,
      channelId: 'erzanfly_price_alerts',
      userInfo: data,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      priority: 'high',
      importance: 'high',
    });
  }

  async scheduleNotification(
    title: string,
    message: string,
    date: Date,
    data?: any
  ): Promise<void> {
    PushNotification.localNotificationSchedule({
      title,
      message,
      date,
      channelId: 'erzanfly_price_alerts',
      userInfo: data,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      priority: 'high',
      importance: 'high',
    });
  }

  async cancelNotification(id: string): Promise<void> {
    PushNotification.cancelLocalNotifications({id});
  }

  async cancelAllNotifications(): Promise<void> {
    PushNotification.cancelAllLocalNotifications();
  }

  async sendPriceDropAlert(
    flightNumber: string,
    oldPrice: number,
    newPrice: number,
    currency: string = 'TRY'
  ): Promise<void> {
    const savings = oldPrice - newPrice;
    const title = `🎉 Price Drop Alert!`;
    const message = `${flightNumber} is now ${savings} ${currency} cheaper! New price: ${newPrice} ${currency}`;
    
    await this.showLocalNotification(title, message, {
      type: 'price_drop',
      flightNumber,
      oldPrice,
      newPrice,
      currency,
    });

    // Save notification to storage
    await this.saveNotificationToStorage({
      id: Date.now().toString(),
      title,
      body: message,
      type: 'price_drop',
      flightId: flightNumber,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  async sendPriceIncreaseAlert(
    flightNumber: string,
    oldPrice: number,
    newPrice: number,
    currency: string = 'TRY'
  ): Promise<void> {
    const increase = newPrice - oldPrice;
    const title = `📈 Price Increase Alert`;
    const message = `${flightNumber} price increased by ${increase} ${currency}. New price: ${newPrice} ${currency}`;
    
    await this.showLocalNotification(title, message, {
      type: 'price_increase',
      flightNumber,
      oldPrice,
      newPrice,
      currency,
    });

    // Save notification to storage
    await this.saveNotificationToStorage({
      id: Date.now().toString(),
      title,
      body: message,
      type: 'price_increase',
      flightId: flightNumber,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  async sendGeneralNotification(title: string, message: string): Promise<void> {
    await this.showLocalNotification(title, message, {
      type: 'general',
    });

    // Save notification to storage
    await this.saveNotificationToStorage({
      id: Date.now().toString(),
      title,
      body: message,
      type: 'general',
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  private async saveNotificationToStorage(notification: NotificationData): Promise<void> {
    try {
      const existingNotifications = await this.getStoredNotifications();
      const updatedNotifications = [notification, ...existingNotifications];
      
      // Keep only last 50 notifications
      const limitedNotifications = updatedNotifications.slice(0, 50);
      
      await AsyncStorage.setItem(
        'erzanfly_notifications',
        JSON.stringify(limitedNotifications)
      );
    } catch (error) {
      console.error('Error saving notification to storage:', error);
    }
  }

  async getStoredNotifications(): Promise<NotificationData[]> {
    try {
      const stored = await AsyncStorage.getItem('erzanfly_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.map(notif =>
        notif.id === id ? {...notif, read: true} : notif
      );
      
      await AsyncStorage.setItem(
        'erzanfly_notifications',
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem('erzanfly_notifications');
      await this.cancelAllNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }
}