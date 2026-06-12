# MindFrame 🔮

Karanlık, premium bir **mentalizm / video prediction** uygulaması. Önceden çekilmiş bir video oynarken, seyircinin seçtiği sayı / kelime / kart / çizim / fotoğraf gizlice girilir ve videonun belirlenen saniyesinde "videoda zaten varmış gibi" belirir.

> Tamamen özgün marka, tasarım ve metinler. React Native + Expo + TypeScript, iOS öncelikli, Android uyumlu.

**Expo SDK 54** (React Native 0.81, React 19.1) — tüm modüller Expo Go uyumludur, native development build gerekmez.

## Çalıştırma

```bash
npm install
npx expo start
```

Telefonda **Expo Go** ile QR kodu okutun (iOS/Android). `expo-video`, `expo-image-picker` vb. tüm modüller Expo Go ile uyumludur.

## Mimari

```
src/
  components/   UI parçaları (overlay, grid, çizim kanvası, kilit ekranı…)
  screens/      Gallery, Editor, Perform, Share, Settings, IndexLists
  navigation/   react-navigation native stack
  store/        zustand: library (persist), settings (persist), perform (runtime)
  services/     media (picker+thumbnail), transmitter (mock realtime), demo data
  i18n/         TR / EN sözlükleri
  theme/        renkler, spacing, font eşlemeleri
  types/        tüm domain tipleri
  utils/        id, zaman yardımcıları
```

- **Kalıcılık:** AsyncStorage üzerinden `zustand/persist`. Performans değerleri asla diske yazılmaz (seyirci telefonu açarsa iz yok). Uygulama, store'lar yüklenene kadar markalı bir açılış ekranı gösterir.
- **Taşınabilir medya yolları:** Kütüphane mutlak `file://` yolu değil, **çıplak dosya adı** saklar; gerçek URI çalışma anında `resolveMediaUri` ile üretilir. iOS güncellemelerinde container yolu değişse bile videolar/thumbnail'ler kaybolmaz (eski kayıtlar store v2 migration ile otomatik dönüştürülür). Thumbnail'ler silinebilir cache yerine kalıcı documents dizininde tutulur.
- **Remote mode:** `services/transmitter.ts` içindeki `Transmitter` arayüzü; şu an in-process mock. Supabase Realtime / WebSocket eklemek = aynı arayüzü kanala bağlamak.
- **Export/render:** `services/exportService.ts` içindeki `VideoExporter` arayüzü; MVP'de `PassthroughExporter` orijinal dosyayı paylaşır (`rendered: false`). FFmpegKit eklenince `FfmpegExporter` aynı arayüze yazılır. Şimdilik en iyi paylaşım yolu: performans sırasında telefon ekran kaydı.
- **Konumlama:** Overlay koordinatları videonun letterbox'lı gerçek dikdörtgenine görelidir (`utils/layout.ts: fitRect`) — editörde yerleştirilen nokta, tam ekran performansta da görüntünün aynı pikseline düşer.

## Özellikler

- Video galerisi: demo videolar + kullanıcı videoları, thumbnail, tip/yöntem rozetleri, sahnele/düzenle/paylaş/sil.
- Editör: galeriden video seçme, reveal pencerelerini gösteren **timeline**, scrubber + frame frame ilerleme, Image In/Out zamanı, overlay'i **parmakla sürükleyerek** konumlama, boyut/kalınlık/opaklık/döndürme/perspektif/renk/font ayarları, çoklu reveal (multi prediction), index listesi bağlama, önek/sonek, **Test Performansı** butonu ve kaydedilmemiş değişiklik uyarısı.
- Performans: tam ekran video, gizli giriş yöntemleri:
  - **Grid (karartmasız / karartmalı)** — görünmez tuş takımı; varsayılan **4×3** (1-9, ⌫, 0, ✓). 3×3 seçilirse **uzun basış 0 girer** — 10/20/30 ve "07" gibi değerler her düzende girilebilir, 52 kartlık listede tüm kartlara erişilir.
  - **Pause / Pause sonrası** — duraklatma kılıflı basamak girişi
  - **Kilit ekranı** — sahte şifre = tahmin
  - **Parola modu (D-VIR)** — video öncesi parola kapısı
  - **Çizim** — alt kenara uzun bas → silik çizim alanı, çift dokunuş onay. Çizim, onay anında en-boy oranı korunarak normalize edilir: hangi ekran oranında çizilirse çizilsin reveal'da kırpılmadan, ortalanmış görünür.
  - **Fotoğraf** — performans öncesi galeri/kamera
  - **Uzaktan (mock)** — Ayarlar'daki asistan panelinden değer gönder
- Index listeleri: 52 iskambil kartı, ülkeler, şehirler, isimler, burçlar, objeler + özel liste oluşturma/düzenleme/silme (28 → listenin 28. öğesi).
- Reveal'lar **fade-in** ile, videonun içinde zaten varmış gibi belirir.
- Gizli jestler (seyirciye tamamen görünmez):
  - **Çıkış:** sol üst köşeye **2 sn** uzun bas. Android donanım geri tuşu performans sırasında **devre dışıdır** — tek çıkış bu jesttir.
  - **Input reset:** sağ üst köşeye 1 sn uzun bas — basamak tamponunu temizler, son girilen grid değerini yeniden girilebilir yapar.
  - Köşelerdeki bu iki bölge (84×84) grid dokunuşlarına kapalıdır; basamak girerken köşelerin hafif içinden dokun.
- Antrenman modu (Ayarlar → Grid): grid çizgilerini, girilen basamakları ve sahne öncesi ipuçlarını silik gösterir. Kapalıyken seyirci ekranında uygulamayı ele veren hiçbir metin yoktur.
- TR/EN dil desteği, koyu lüks tema (siyah/antrasit/mor/altın).

## Yol haritası

- [ ] FFmpegKit ile overlay'in videoya render edilmesi (gerçek export)
- [ ] Supabase Realtime transmitter (ikinci cihaz)
- [ ] Premium / satın alma sistemi
- [ ] Çizim girişinin reveal anında animasyonlu belirmesi
