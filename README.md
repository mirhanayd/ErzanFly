# ErzanFly - React Native Uçuş Takip Uygulaması

![ErzanFly Logo](https://img.shields.io/badge/ErzanFly-v1.0.0-blue.svg) ![React Native](https://img.shields.io/badge/React%20Native-0.73.0-green.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-4.8.4-blue.svg)

ErzanFly, Pegasus ve AJet havayolları için geliştirilmiş modern ve kullanıcı dostu bir uçuş takip uygulamasıdır. Kullanıcılar uçuş fiyatlarını takip edebilir, fiyat alarmları kurabilir ve en uygun uçuş seçeneklerini kolayca bulabilirler.

## 🚀 Özellikler

### 🏠 Ana Sayfa
- **Hızlı Arama**: Şehir veya havaalanı adı ile hızlı uçuş arama
- **Son Aramalar**: Önceki arama geçmişine kolay erişim
- **Popüler Rotalar**: Türkiye'nin en popüler uçuş rotaları
- **Özellik Kartları**: Uygulama özelliklerine hızlı erişim

### 🔍 Uçuş Arama
- **Gelişmiş Arama**: Tek yön ve gidiş-dönüş uçuş arama
- **Havaalanı Seçimi**: Tüm Türkiye havaalanlarından seçim
- **Tarih Seçimi**: Esnek tarih seçimi ile arama
- **Yolcu Sayısı**: 1-9 arası yolcu sayısı seçimi
- **Gerçek Zamanlı Sonuçlar**: Pegasus ve AJet'ten canlı fiyatlar

### ❤️ Fiyat Takip Listesi
- **Fiyat Alarmları**: Hedef fiyata ulaşıldığında bildirim
- **Fiyat Grafikleri**: 30 günlük fiyat geçmişi görüntüleme
- **Aktif/Pasif Takip**: Alarmları açma/kapama
- **Detaylı İstatistikler**: En düşük, en yüksek, ortalama fiyatlar

### 👤 Profil ve Ayarlar
- **Bildirim Ayarları**: Fiyat alarmı, uçuş güncellemesi ayarları
- **Dil ve Para Birimi**: Türkçe dil desteği, TRY para birimi
- **Bildirim Geçmişi**: Son bildirimleri görüntüleme
- **Destek ve Yardım**: Müşteri destek iletişimi

### ✈️ Uçuş Detayları
- **Detaylı Bilgi**: Uçuş saatleri, havaalanı bilgileri
- **Fiyat Geçmişi**: Interaktif fiyat grafikleri
- **Bagaj Bilgileri**: Kabin ve bagaj ağırlık limitleri
- **Rezervasyon**: Doğrudan havayolu sitesine yönlendirme

## 📱 Teknik Özellikler

### 🎨 Modern UI/UX
- **Material Design 3**: Google'ın en güncel tasarım dili
- **Gradient Animasyonlar**: Görsel açıdan zengin arayüz
- **Koyu/Açık Tema**: Sistem ayarını takip eden tema desteği
- **Responsive Design**: Tüm ekran boyutlarında uyumlu

### 🔔 Push Notifications
- **Firebase FCM**: Güvenilir bildirim altyapısı
- **Fiyat Alarmları**: Hedef fiyata ulaşıldığında anlık bildirim
- **Uçuş Güncellemeleri**: Gecikme, kapı değişikliği bildirimleri
- **Arka Plan İşleme**: Uygulama kapalıyken bile fiyat kontrolü

### 💾 Veri Yönetimi
- **AsyncStorage**: Offline veri depolama
- **Önbellekleme**: Hızlı erişim için akıllı önbellekleme
- **Veri Senkronizasyonu**: Gerçek zamanlı veri güncellemeleri

## 🛠️ Kurulum

### Gereksinimler
- **Node.js**: 16.0 veya üstü
- **React Native CLI**: 0.73.0
- **Android Studio**: Android geliştirme için
- **Xcode**: iOS geliştirme için (sadece macOS)

### Kurulum Adımları

1. **Depoyu klonlayın:**
```bash
git clone https://github.com/mirhanayd/ErzanFly.git
cd ErzanFly
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **iOS bağımlılıkları (sadece macOS):**
```bash
cd ios && pod install && cd ..
```

4. **Android için geliştirme:**
```bash
npm run android
```

5. **iOS için geliştirme:**
```bash
npm run ios
```

## 📡 API Entegrasyonu

### Pegasus API
```typescript
// Pegasus API kullanımı
const pegasusFlights = await FlightService.searchPegasusFlights({
  from: 'IST',
  to: 'AYT',
  departureDate: '2024-07-15',
  passengers: 2
});
```

### AJet API
```typescript
// AJet API kullanımı
const ajetFlights = await FlightService.searchAJetFlights({
  from: 'ESB',
  to: 'ADB',
  departureDate: '2024-07-20',
  passengers: 1
});
```

## 📊 Proje Yapısı

```
ErzanFly/
├── src/
│   ├── screens/           # Uygulama ekranları
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── WatchlistScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── FlightDetailsScreen.tsx
│   ├── services/          # API ve servis katmanları
│   │   ├── FlightService.ts
│   │   └── NotificationService.ts
│   └── theme/             # Tema ve stil dosyaları
│       └── theme.ts
├── App.tsx                # Ana uygulama komponenti
├── package.json           # Proje bağımlılıkları
└── README.md             # Proje dokümantasyonu
```

## 🎯 Kullanım Örnekleri

### Uçuş Arama
```typescript
import FlightService from './src/services/FlightService';

const searchFlights = async () => {
  const results = await FlightService.searchFlights({
    from: 'IST',
    to: 'AYT',
    departureDate: '2024-07-15',
    passengers: 2,
    tripType: 'oneWay'
  });
  
  console.log('Bulunan uçuşlar:', results);
};
```

### Fiyat Alarmı Oluşturma
```typescript
import FlightService from './src/services/FlightService';

const createPriceAlert = async () => {
  await FlightService.addToWatchlist({
    from: 'IST',
    to: 'AYT',
    departureDate: '2024-07-15',
    passengers: 1,
    tripType: 'oneWay'
  }, 299); // Hedef fiyat: 299 TRY
};
```

### Bildirim Gönderme
```typescript
import NotificationService from './src/services/NotificationService';

const sendPriceAlert = async () => {
  await NotificationService.sendPriceAlert(
    'İstanbul → Antalya',
    350, // Hedef fiyat
    299  // Güncel fiyat
  );
};
```

## 🧪 Test Etme

```bash
# Tüm testleri çalıştır
npm test

# Test coverage raporu
npm run test:coverage

# Lint kontrolü
npm run lint

# TypeScript tip kontrolü
npm run typecheck
```

## 🚀 Deployment

### Android APK Oluşturma
```bash
cd android
./gradlew assembleRelease
```

### iOS App Store
```bash
# Xcode'da Archive > Distribute App
```

## 📈 Performans İyileştirmeleri

- **Lazy Loading**: Ekranlar ihtiyaç duyulduğunda yüklenir
- **Memoization**: React.memo ve useMemo ile gereksiz render'lar engellenir
- **Önbellekleme**: API sonuçları 5 dakika önbellekte tutulur
- **Optimized Images**: SVG ve optimized PNG kullanımı

## 🔒 Güvenlik

- **API Güvenliği**: HTTPS zorunluluğu
- **Veri Şifreleme**: Hassas veriler AsyncStorage'da şifreli
- **Token Yönetimi**: JWT token'ları güvenli şekilde saklanır

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasını inceleyin.

## 👥 Ekip

- **Geliştirici**: Mirhan Aydın
- **Tasarım**: ErzanFly Tasarım Ekibi
- **Test**: QA Ekibi

## 📞 İletişim

- **E-posta**: support@erzanfly.com
- **WhatsApp**: +90 555 123 45 67
- **Website**: https://erzanfly.com

## 🎉 Teşekkürler

Bu projenin geliştirilmesinde katkıda bulunan tüm açık kaynak projelerine ve React Native topluluğuna teşekkürler.

---

**ErzanFly** - Uçuş takibinde yeni bir deneyim! ✈️