import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Searchbar,
  Chip,
  Surface,
  Text,
  Avatar,
  useTheme,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import FlightService, { Airport, Flight } from '../services/FlightService';
import { spacing, typography } from '../theme/theme';

const { width } = Dimensions.get('window');

interface PopularRoute {
  from: string;
  to: string;
  price: number;
  image: string;
}

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularRoutes] = useState<PopularRoute[]>([
    { from: 'İstanbul', to: 'Antalya', price: 299, image: '🏖️' },
    { from: 'Ankara', to: 'İzmir', price: 249, image: '🏛️' },
    { from: 'İstanbul', to: 'Trabzon', price: 399, image: '🏔️' },
    { from: 'İzmir', to: 'Bodrum', price: 199, image: '🏝️' },
  ]);

  useEffect(() => {
    loadAirports();
    loadRecentSearches();
  }, []);

  const loadAirports = async () => {
    try {
      const airportData = await FlightService.getAirports();
      setAirports(airportData);
    } catch (error) {
      console.error('Error loading airports:', error);
    }
  };

  const loadRecentSearches = async () => {
    // In a real app, you would load this from AsyncStorage
    setRecentSearches(['İstanbul - Antalya', 'Ankara - İzmir', 'İstanbul - Trabzon']);
  };

  const handleQuickSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery });
    }
  };

  const handleRoutePress = (route: PopularRoute) => {
    navigation.navigate('Search', {
      from: route.from,
      to: route.to,
    });
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={[styles.greeting, { color: theme.colors.onPrimary }]}>
          Merhaba! 👋
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onPrimary }]}>
          Bugün nereye uçuyorsun?
        </Text>
      </View>
    </LinearGradient>
  );

  const renderSearchSection = () => (
    <Surface style={styles.searchSection} elevation={2}>
      <Title style={styles.sectionTitle}>Hızlı Arama</Title>
      <Searchbar
        placeholder="Şehir veya havaalanı ara..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        onSubmitEditing={handleQuickSearch}
        right={() => (
          <Button onPress={handleQuickSearch} mode="contained" compact>
            Ara
          </Button>
        )}
      />
      <View style={styles.quickActions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Search')}
          style={styles.actionButton}
          icon="airplane"
        >
          Uçuş Ara
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Watchlist')}
          style={styles.actionButton}
          icon="heart"
        >
          Takip Listesi
        </Button>
      </View>
    </Surface>
  );

  const renderRecentSearches = () => (
    <Surface style={styles.section} elevation={1}>
      <Title style={styles.sectionTitle}>Son Aramalar</Title>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recentSearches.map((search, index) => (
          <Chip
            key={index}
            onPress={() => navigation.navigate('Search', { query: search })}
            style={styles.recentChip}
            mode="outlined"
          >
            {search}
          </Chip>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderPopularRoutes = () => (
    <Surface style={styles.section} elevation={1}>
      <Title style={styles.sectionTitle}>Popüler Rotalar</Title>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {popularRoutes.map((route, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleRoutePress(route)}
            style={styles.routeCard}
          >
            <Card style={styles.routeCardInner}>
              <Card.Content>
                <Text style={styles.routeEmoji}>{route.image}</Text>
                <Text style={styles.routeText}>
                  {route.from} → {route.to}
                </Text>
                <Text style={styles.routePrice}>{route.price} TRY</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderFeatures = () => (
    <Surface style={styles.section} elevation={1}>
      <Title style={styles.sectionTitle}>Özellikler</Title>
      <View style={styles.featuresGrid}>
        <TouchableOpacity
          style={styles.featureItem}
          onPress={() => navigation.navigate('Watchlist')}
        >
          <Avatar.Icon
            size={48}
            icon="bell"
            style={[styles.featureIcon, { backgroundColor: theme.colors.primary }]}
          />
          <Text style={styles.featureTitle}>Fiyat Alarmı</Text>
          <Text style={styles.featureDesc}>
            Fiyatlar düştüğünde bildirim al
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.featureItem}
          onPress={() => navigation.navigate('Search')}
        >
          <Avatar.Icon
            size={48}
            icon="chart-line"
            style={[styles.featureIcon, { backgroundColor: theme.colors.secondary }]}
          />
          <Text style={styles.featureTitle}>Fiyat Takibi</Text>
          <Text style={styles.featureDesc}>
            Fiyat geçmişini görüntüle
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.featureItem}
          onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek!')}
        >
          <Avatar.Icon
            size={48}
            icon="calendar"
            style={[styles.featureIcon, { backgroundColor: theme.colors.tertiary }]}
          />
          <Text style={styles.featureTitle}>Esnek Tarihler</Text>
          <Text style={styles.featureDesc}>
            En uygun tarihleri bul
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.featureItem}
          onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek!')}
        >
          <Avatar.Icon
            size={48}
            icon="airplane-takeoff"
            style={[styles.featureIcon, { backgroundColor: theme.colors.error }]}
          />
          <Text style={styles.featureTitle}>Uçuş Durumu</Text>
          <Text style={styles.featureDesc}>
            Gerçek zamanlı uçuş bilgisi
          </Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      {renderSearchSection()}
      {renderRecentSearches()}
      {renderPopularRoutes()}
      {renderFeatures()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: typography.headlineMedium.fontSize,
    fontWeight: typography.headlineMedium.fontWeight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.bodyLarge.fontSize,
    opacity: 0.9,
  },
  searchSection: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: typography.titleLarge.fontSize,
    fontWeight: typography.titleLarge.fontWeight,
    marginBottom: spacing.sm,
  },
  searchBar: {
    marginBottom: spacing.md,
    elevation: 0,
    borderRadius: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  section: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: 12,
  },
  recentChip: {
    marginRight: spacing.sm,
  },
  routeCard: {
    marginRight: spacing.md,
  },
  routeCardInner: {
    width: 140,
    elevation: 2,
  },
  routeEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  routeText: {
    fontSize: typography.bodyMedium.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  routePrice: {
    fontSize: typography.titleMedium.fontSize,
    fontWeight: typography.titleMedium.fontWeight,
    textAlign: 'center',
    color: '#1976D2',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 1,
  },
  featureIcon: {
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: typography.titleSmall.fontSize,
    fontWeight: typography.titleSmall.fontWeight,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: typography.bodySmall.fontSize,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default HomeScreen;