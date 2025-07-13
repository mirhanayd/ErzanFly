import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  List,
  Switch,
  Surface,
  Avatar,
  Chip,
  Divider,
  Dialog,
  Portal,
  TextInput,
  Menu,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {theme} from '../theme/theme';
import {NotificationService} from '../services/NotificationService';
import {User, NotificationData} from '../types';

const ProfileScreen = () => {
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    preferences: {
      notifications: true,
      currency: 'TRY',
      language: 'en',
      theme: 'light',
    },
  });
  
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [themeMenuVisible, setThemeMenuVisible] = useState(false);

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    loadUserData();
    loadNotifications();
  }, []);

  const loadUserData = async () => {
    try {
      const stored = await AsyncStorage.getItem('erzanfly_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveUserData = async (userData: User) => {
    try {
      await AsyncStorage.setItem('erzanfly_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const storedNotifications = await notificationService.getStoredNotifications();
      setNotifications(storedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const updatePreference = async (key: keyof User['preferences'], value: any) => {
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        [key]: value,
      },
    };
    await saveUserData(updatedUser);
  };

  const handleNameUpdate = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter a valid name');
      return;
    }
    
    const updatedUser = {...user, name: editName.trim()};
    await saveUserData(updatedUser);
    setShowNameDialog(false);
    setEditName('');
  };

  const handleEmailUpdate = async () => {
    if (!editEmail.trim() || !editEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    const updatedUser = {...user, email: editEmail.trim()};
    await saveUserData(updatedUser);
    setShowEmailDialog(false);
    setEditEmail('');
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your watchlist items, notifications, and preferences. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'erzanfly_user',
                'erzanfly_watchlist',
                'erzanfly_notifications',
              ]);
              await notificationService.clearAllNotifications();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const markNotificationAsRead = async (id: string) => {
    await notificationService.markNotificationAsRead(id);
    await loadNotifications();
  };

  const clearNotifications = async () => {
    await notificationService.clearAllNotifications();
    setNotifications([]);
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

  const renderNotificationItem = (notification: NotificationData) => {
    const getNotificationIcon = () => {
      switch (notification.type) {
        case 'price_drop':
          return 'trending-down';
        case 'price_increase':
          return 'trending-up';
        default:
          return 'notifications';
      }
    };

    const getNotificationColor = () => {
      switch (notification.type) {
        case 'price_drop':
          return theme.colors.tertiary;
        case 'price_increase':
          return theme.colors.error;
        default:
          return theme.colors.primary;
      }
    };

    return (
      <List.Item
        key={notification.id}
        title={notification.title}
        description={notification.body}
        left={(props) => (
          <Icon
            name={getNotificationIcon()}
            size={24}
            color={getNotificationColor()}
            style={{marginTop: 8}}
          />
        )}
        right={(props) => (
          <View style={styles.notificationRight}>
            <Paragraph style={styles.notificationTime}>
              {new Date(notification.timestamp).toLocaleString()}
            </Paragraph>
            {!notification.read && (
              <Chip
                style={styles.unreadChip}
                textStyle={styles.unreadText}
                onPress={() => markNotificationAsRead(notification.id)}>
                New
              </Chip>
            )}
          </View>
        )}
        style={[
          styles.notificationItem,
          !notification.read && styles.unreadNotification,
        ]}
        onPress={() => markNotificationAsRead(notification.id)}
      />
    );
  };

  const currencies = ['TRY', 'USD', 'EUR', 'GBP'];
  const languages = [
    {code: 'en', name: 'English'},
    {code: 'tr', name: 'Türkçe'},
  ];
  const themes = [
    {code: 'light', name: 'Light'},
    {code: 'dark', name: 'Dark'},
    {code: 'system', name: 'System'},
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <Surface style={styles.profileHeader}>
          <Avatar.Text
            size={64}
            label={user.name.substring(0, 2).toUpperCase()}
            style={styles.avatar}
          />
          <Title style={styles.userName}>{user.name}</Title>
          <Paragraph style={styles.userEmail}>{user.email}</Paragraph>
        </Surface>

        {/* Account Settings */}
        <Card style={styles.card}>
          <Card.Title title="Account Settings" />
          <Card.Content>
            <List.Item
              title="Name"
              description={user.name}
              left={(props) => <List.Icon {...props} icon="person" />}
              right={(props) => <List.Icon {...props} icon="edit" />}
              onPress={() => {
                setEditName(user.name);
                setShowNameDialog(true);
              }}
            />
            <List.Item
              title="Email"
              description={user.email}
              left={(props) => <List.Icon {...props} icon="email" />}
              right={(props) => <List.Icon {...props} icon="edit" />}
              onPress={() => {
                setEditEmail(user.email);
                setShowEmailDialog(true);
              }}
            />
          </Card.Content>
        </Card>

        {/* Preferences */}
        <Card style={styles.card}>
          <Card.Title title="Preferences" />
          <Card.Content>
            <List.Item
              title="Push Notifications"
              description="Get notified about price changes"
              left={(props) => <List.Icon {...props} icon="notifications" />}
              right={() => (
                <Switch
                  value={user.preferences.notifications}
                  onValueChange={(value) => updatePreference('notifications', value)}
                />
              )}
            />
            
            <Menu
              visible={currencyMenuVisible}
              onDismiss={() => setCurrencyMenuVisible(false)}
              anchor={
                <List.Item
                  title="Currency"
                  description={user.preferences.currency}
                  left={(props) => <List.Icon {...props} icon="attach-money" />}
                  right={(props) => <List.Icon {...props} icon="arrow-drop-down" />}
                  onPress={() => setCurrencyMenuVisible(true)}
                />
              }>
              {currencies.map((currency) => (
                <Menu.Item
                  key={currency}
                  onPress={() => {
                    updatePreference('currency', currency);
                    setCurrencyMenuVisible(false);
                  }}
                  title={currency}
                />
              ))}
            </Menu>

            <Menu
              visible={languageMenuVisible}
              onDismiss={() => setLanguageMenuVisible(false)}
              anchor={
                <List.Item
                  title="Language"
                  description={languages.find(l => l.code === user.preferences.language)?.name}
                  left={(props) => <List.Icon {...props} icon="language" />}
                  right={(props) => <List.Icon {...props} icon="arrow-drop-down" />}
                  onPress={() => setLanguageMenuVisible(true)}
                />
              }>
              {languages.map((lang) => (
                <Menu.Item
                  key={lang.code}
                  onPress={() => {
                    updatePreference('language', lang.code);
                    setLanguageMenuVisible(false);
                  }}
                  title={lang.name}
                />
              ))}
            </Menu>

            <Menu
              visible={themeMenuVisible}
              onDismiss={() => setThemeMenuVisible(false)}
              anchor={
                <List.Item
                  title="Theme"
                  description={themes.find(t => t.code === user.preferences.theme)?.name}
                  left={(props) => <List.Icon {...props} icon="palette" />}
                  right={(props) => <List.Icon {...props} icon="arrow-drop-down" />}
                  onPress={() => setThemeMenuVisible(true)}
                />
              }>
              {themes.map((theme) => (
                <Menu.Item
                  key={theme.code}
                  onPress={() => {
                    updatePreference('theme', theme.code);
                    setThemeMenuVisible(false);
                  }}
                  title={theme.name}
                />
              ))}
            </Menu>
          </Card.Content>
        </Card>

        {/* Notifications */}
        <Card style={styles.card}>
          <Card.Title
            title="Recent Notifications"
            subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            right={(props) => (
              notifications.length > 0 && (
                <Button
                  mode="text"
                  onPress={clearNotifications}
                  style={styles.clearButton}>
                  Clear All
                </Button>
              )
            )}
          />
          <Card.Content>
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Icon name="notifications-none" size={48} color={theme.colors.onSurfaceVariant} />
                <Paragraph style={styles.emptyText}>No notifications yet</Paragraph>
              </View>
            ) : (
              <View style={styles.notificationsList}>
                {notifications.slice(0, 5).map(renderNotificationItem)}
                {notifications.length > 5 && (
                  <Paragraph style={styles.moreNotifications}>
                    and {notifications.length - 5} more...
                  </Paragraph>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* About */}
        <Card style={styles.card}>
          <Card.Title title="About" />
          <Card.Content>
            <List.Item
              title="App Settings"
              description="Open system app settings"
              left={(props) => <List.Icon {...props} icon="settings" />}
              right={(props) => <List.Icon {...props} icon="open-in-new" />}
              onPress={openAppSettings}
            />
            <List.Item
              title="Privacy Policy"
              description="Learn about our privacy practices"
              left={(props) => <List.Icon {...props} icon="privacy-tip" />}
              right={(props) => <List.Icon {...props} icon="open-in-new" />}
              onPress={() => Alert.alert('Privacy Policy', 'Privacy policy would be shown here')}
            />
            <List.Item
              title="Terms of Service"
              description="Read our terms and conditions"
              left={(props) => <List.Icon {...props} icon="description" />}
              right={(props) => <List.Icon {...props} icon="open-in-new" />}
              onPress={() => Alert.alert('Terms of Service', 'Terms of service would be shown here')}
            />
            <List.Item
              title="App Version"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="info" />}
            />
          </Card.Content>
        </Card>

        {/* Danger Zone */}
        <Card style={[styles.card, styles.dangerCard]}>
          <Card.Title title="Danger Zone" />
          <Card.Content>
            <Button
              mode="outlined"
              onPress={clearAllData}
              style={styles.dangerButton}
              textColor={theme.colors.error}>
              Clear All Data
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Name Dialog */}
      <Portal>
        <Dialog visible={showNameDialog} onDismiss={() => setShowNameDialog(false)}>
          <Dialog.Title>Edit Name</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Full Name"
              value={editName}
              onChangeText={setEditName}
              autoCapitalize="words"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowNameDialog(false)}>Cancel</Button>
            <Button onPress={handleNameUpdate}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Email Dialog */}
      <Portal>
        <Dialog visible={showEmailDialog} onDismiss={() => setShowEmailDialog(false)}>
          <Dialog.Title>Edit Email</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Email Address"
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEmailDialog(false)}>Cancel</Button>
            <Button onPress={handleEmailUpdate}>Save</Button>
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
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: theme.colors.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  card: {
    margin: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  dangerCard: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  dangerButton: {
    borderColor: theme.colors.error,
  },
  clearButton: {
    marginTop: -8,
  },
  emptyNotifications: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    color: theme.colors.onSurfaceVariant,
  },
  notificationsList: {
    maxHeight: 300,
  },
  notificationItem: {
    paddingVertical: 8,
  },
  unreadNotification: {
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 8,
    marginVertical: 2,
  },
  notificationRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  unreadChip: {
    backgroundColor: theme.colors.secondary,
    marginTop: 4,
  },
  unreadText: {
    color: theme.colors.onSecondary,
    fontSize: 10,
  },
  moreNotifications: {
    textAlign: 'center',
    marginTop: 16,
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
});

export default ProfileScreen;