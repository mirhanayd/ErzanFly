import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
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
  Switch,
  List,
  Divider,
  Badge,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import NotificationService, { NotificationSettings, PriceAlert } from '../services/NotificationService';
import { spacing, typography } from '../theme/theme';
import { format } from 'date-fns';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    priceAlerts: true,
    flightUpdates: true,
    promotions: false,
    sound: true,
    vibration: true,
  });
  const [recentAlerts, setRecentAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadRecentAlerts();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await NotificationService.getSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadRecentAlerts = async () => {
    try {
      const alerts = await NotificationService.getAlerts();
      setRecentAlerts(alerts.slice(0, 5)); // Show last 5 alerts
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      const newSettings = { ...notificationSettings, [key]: value };
      setNotificationSettings(newSettings);
      await NotificationService.updateSettings({ [key]: value });
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Hata', 'Ayar güncellenirken bir hata oluştu');
    }
  };

  const handleClearAlerts = async () => {
    Alert.alert(
      'Bildirimleri Temizle',
      'Tüm bildirim geçmişini silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.clearAlerts();
              setRecentAlerts([]);
            } catch (error) {
              console.error('Error clearing alerts:', error);
              Alert.alert('Hata', 'Bildirimler temizlenirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Destek',
      'Destek ekibimizle nasıl iletişime geçmek istersiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'E-posta',
          onPress: () => Linking.openURL('mailto:support@erzanfly.com'),
        },
        {
          text: 'WhatsApp',
          onPress: () => Linking.openURL('https://wa.me/905551234567'),
        },
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Uygulamayı Değerlendir',
      'ErzanFly uygulamasını App Store\'da değerlendirmek ister misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Değerlendir',
          onPress: () => {
            // In a real app, this would open the App Store
            Alert.alert('Teşekkürler', 'App Store\'a yönlendiriliyorsunuz...');
          },
        },
      ]
    );
  };

  const handleShareApp = () => {
    Alert.alert(
      'Uygulamayı Paylaş',
      'ErzanFly uygulamasını arkadaşlarınızla paylaşın!',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Paylaş',
          onPress: () => {
            // In a real app, this would use React Native Share
            Alert.alert('Paylaşıldı', 'Uygulama linki panoya kopyalandı!');
          },
        },
      ]
    );
  };

  const renderUserSection = () => (
    <Surface style={styles.userSection} elevation={2}>
      <View style={styles.userInfo}>
        <Avatar.Icon
          size={80}
          icon="account"
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
        />
        <View style={styles.userDetails}>
          <Title style={styles.userName}>Hoş geldiniz!</Title>
          <Paragraph style={styles.userEmail}>
            Giriş yaparak daha fazla özellik kullanabilirsiniz
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => Alert.alert('Yakında', 'Giriş özelliği yakında eklenecek!')}
            style={styles.loginButton}
            icon="login"
          >
            Giriş Yap
          </Button>
        </View>
      </View>
    </Surface>
  );

  const renderNotificationSettings = () => (
    <Surface style={styles.section} elevation={1}>
      <Title style={styles.sectionTitle}>Bildirim Ayarları</Title>
      
      <List.Item
        title="Fiyat Alarmları"
        description="Hedef fiyata ulaşıldığında bildirim al"
        left={(props) => <List.Icon {...props} icon="bell" />}
        right={() => (
          <Switch
            value={notificationSettings.priceAlerts}
            onValueChange={(value) => handleSettingChange('priceAlerts', value)}
          />
        )}
      />
      
      <List.Item
        title="Uçuş Güncellemeleri"
        description="Uçuş durumu değişikliklerinde bildirim al"
        left={(props) => <List.Icon {...props} icon="airplane" />}
        right={() => (
          <Switch
            value={notificationSettings.flightUpdates}
            onValueChange={(value) => handleSettingChange('flightUpdates', value)}
          />
        )}
      />
      
      <List.Item
        title="Kampanyalar"
        description="Özel teklifler ve kampanyalar hakkında bildirim al"
        left={(props) => <List.Icon {...props} icon="tag" />}
        right={() => (
          <Switch
            value={notificationSettings.promotions}
            onValueChange={(value) => handleSettingChange('promotions', value)}
          />
        )}
      />
      
      <Divider style={styles.divider} />
      
      <List.Item
        title="Ses"
        description="Bildirim sesi"
        left={(props) => <List.Icon {...props} icon="volume-high" />}
        right={() => (
          <Switch
            value={notificationSettings.sound}
            onValueChange={(value) => handleSettingChange('sound', value)}
          />
        )}
      />
      
      <List.Item
        title="Titreşim"
        description="Bildirim titreşimi"
        left={(props) => <List.Icon {...props} icon="vibrate" />}
        right={() => (
          <Switch
            value={notificationSettings.vibration}
            onValueChange={(value) => handleSettingChange('vibration', value)}
          />
        )}
      />
    </Surface>
  );

  const renderRecentAlerts = () => (
    <Surface style={styles.section} elevation={1}>
      <View style={styles.sectionHeader}>
        <Title style={styles.sectionTitle}>Son Bildirimler</Title>
        {recentAlerts.length > 0 && (
          <Button
            mode="text"
            onPress={handleClearAlerts}
            textColor={theme.colors.error}
          >
            Temizle
          </Button>
        )}
      </View>
      
      {recentAlerts.length === 0 ? (
        <View style={styles.emptyAlerts}>
          <Text style={styles.emptyAlertsText}>Henüz bildirim yok</Text>
        </View>
      ) : (
        recentAlerts.map((alert) => (
          <Card key={alert.id} style={styles.alertCard}>
            <Card.Content>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertTime}>
                  {format(new Date(alert.timestamp), 'HH:mm')}
                </Text>
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <View style={styles.alertFooter}>
                <Paragraph style={styles.alertRoute}>{alert.flightRoute}</Paragraph>
                <Badge style={styles.alertBadge}>
                  {alert.currentPrice} TRY
                </Badge>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </Surface>
  );

  const renderAppSettings = () => (
    <Surface style={styles.section} elevation={1}>
      <Title style={styles.sectionTitle}>Uygulama</Title>
      
      <List.Item
        title="Dil"
        description="Türkçe"
        left={(props) => <List.Icon {...props} icon="translate" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => Alert.alert('Yakında', 'Dil seçimi yakında eklenecek!')}
      />
      
      <List.Item
        title="Para Birimi"
        description="Türk Lirası (TRY)"
        left={(props) => <List.Icon {...props} icon="currency-try" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => Alert.alert('Yakında', 'Para birimi seçimi yakında eklenecek!')}
      />
      
      <List.Item
        title="Tema"
        description="Sistem ayarını takip et"
        left={(props) => <List.Icon {...props} icon="palette" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => Alert.alert('Yakında', 'Tema seçimi yakında eklenecek!')}
      />
    </Surface>
  );

  const renderSupportSection = () => (
    <Surface style={styles.section} elevation={1}>
      <Title style={styles.sectionTitle}>Destek</Title>
      
      <List.Item
        title="Yardım Merkezi"
        description="Sık sorulan sorular ve rehberler"
        left={(props) => <List.Icon {...props} icon="help-circle" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => Alert.alert('Yakında', 'Yardım merkezi yakında eklenecek!')}
      />
      
      <List.Item
        title="İletişim"
        description="Destek ekibimizle iletişime geçin"
        left={(props) => <List.Icon {...props} icon="email" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={handleContactSupport}
      />
      
      <List.Item
        title="Uygulamayı Değerlendir"
        description="App Store'da puan verin"
        left={(props) => <List.Icon {...props} icon="star" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={handleRateApp}
      />
      
      <List.Item
        title="Paylaş"
        description="Arkadaşlarınızla paylaşın"
        left={(props) => <List.Icon {...props} icon="share" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={handleShareApp}
      />
    </Surface>
  );

  const renderAboutSection = () => (
    <Surface style={styles.section} elevation={1}>
      <Title style={styles.sectionTitle}>Hakkında</Title>
      
      <List.Item
        title="Versiyon"
        description="1.0.0"
        left={(props) => <List.Icon {...props} icon="information" />}
      />
      
      <List.Item
        title="Gizlilik Politikası"
        left={(props) => <List.Icon {...props} icon="shield-account" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => Alert.alert('Yakında', 'Gizlilik politikası yakında eklenecek!')}
      />
      
      <List.Item
        title="Kullanım Koşulları"
        left={(props) => <List.Icon {...props} icon="file-document" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => Alert.alert('Yakında', 'Kullanım koşulları yakında eklenecek!')}
      />
      
      <View style={styles.footerText}>
        <Text style={styles.footerContent}>
          © 2024 ErzanFly. Tüm hakları saklıdır.
        </Text>
        <Text style={styles.footerContent}>
          Pegasus ve AJet uçuşlarını takip edin.
        </Text>
      </View>
    </Surface>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderUserSection()}
      {renderNotificationSettings()}
      {renderRecentAlerts()}
      {renderAppSettings()}
      {renderSupportSection()}
      {renderAboutSection()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userSection: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: typography.titleLarge.fontSize,
    fontWeight: typography.titleLarge.fontWeight,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.bodyMedium.fontSize,
    color: '#666',
    marginBottom: spacing.sm,
  },
  loginButton: {
    alignSelf: 'flex-start',
  },
  section: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  divider: {
    marginVertical: spacing.xs,
  },
  emptyAlerts: {
    alignItems: 'center',
    padding: spacing.md,
  },
  emptyAlertsText: {
    fontSize: typography.bodyMedium.fontSize,
    color: '#666',
  },
  alertCard: {
    marginBottom: spacing.sm,
    elevation: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  alertTitle: {
    fontSize: typography.titleSmall.fontSize,
    fontWeight: typography.titleSmall.fontWeight,
  },
  alertTime: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
  },
  alertMessage: {
    fontSize: typography.bodyMedium.fontSize,
    marginBottom: spacing.sm,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertRoute: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
  },
  alertBadge: {
    backgroundColor: '#4CAF50',
  },
  footerText: {
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: spacing.md,
  },
  footerContent: {
    fontSize: typography.bodySmall.fontSize,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});

export default ProfileScreen;