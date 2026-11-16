# ENGLISH QUEST 🎓
**10. Sınıf İngilizce · Tema 1: School Life & Education (B1.2)** — MEB Türkiye Yüzyılı Maarif Modeli programına göre hazırlanmış, oynanabilir İngilizce öğrenme oyunu.

Beyaz tema · animasyonlu · akıllı tahtada ve telefonda çalışır · internet olmadan da oynanır.

---

## 📥 İndirilebilir dosyalar (`indir` klasörü)

| Dosya | Nerede? | Nasıl açılır? |
|---|---|---|
| **EnglishQuest-AkilliTahta.html** | Akıllı tahta / bilgisayar | USB'ye at → tahtada dosyaya çift tıkla. Tek dosya, başka bir şey gerekmez. Ana ekrandaki ⛶ butonuyla tam ekran. |
| **EnglishQuest.apk** | Android telefon | Telefona gönder (WhatsApp, Drive, kablo) → dosyaya dokun → "Yükle". Telefon "bilinmeyen kaynaklar" izni isterse ver. Uygulama ana ekrana "English Quest" olarak gelir. |
| **EnglishQuest-Telefon.html** | Telefon (yedek yol) | Telefona gönder → Dosyalar'da uzun bas → **Birlikte aç → Chrome**. |

> - İlk açılışta isimden sonra **ses seçme ekranı** gelir: cihazdaki İngilizce sesler listelenir, dokununca dinlenir. Sonradan **Settings → Choose voice**'tan değiştirilebilir.
> - Kelime telaffuzu (🔊) telefonda **"Google Konuşma Hizmetleri"** ile çalışır; çoğu Android telefonda zaten yüklüdür.
> - iPhone `.apk` kuramaz. iPhone'dan oynamak için aşağıdaki sınıf sunucusunun adresi telefonun tarayıcısında açılabilir.

## 🏆 Sınıf sıralaması (bütün sınıf aynı sıralamada)

1. Öğretmen bilgisayarında **`Baslat.bat`**'a çift tıkla (bilgisayarda [Node.js](https://nodejs.org) kurulu olmalı). Windows güvenlik duvarı sorarsa **"İzin ver"** de.
2. Siyah pencerede `Phones / board: 192.168.x.x:5173` gibi bir adres yazar. Aynı adres oyunda **Ranks** ekranında ve **Settings → Class leaderboard**'da da görünür.
3. Öğrenciler telefonda (uygulama veya tarayıcı) **Settings → Class leaderboard** bölümüne bu adresi yazıp **Connect**'e basar. Bilgisayarlar adresi tarayıcıda da açabilir (`http://192.168.x.x:5173`).
4. Herkes **aynı Wi-Fi'ye** bağlı olmalı. Skorlar birkaç saniyede bir güncellenir; her oyunun ayrı sıralaması vardır. Diğer cihazlardaki oyuncuların yanında 📶 işareti görünür.
- Sunucu bilgisayarda **Settings → Class leaderboard → Reset** ile sınıf sıralaması sıfırlanır. Skorlar `class-scores.json` dosyasında tutulur.
- İnternete veya hesaba gerek yoktur; isimler okul ağından dışarı çıkmaz.
- Sunucu yoksa oyun yine çalışır, sıralama o cihazdaki oyuncularla sınırlı kalır.

### Bilgisayarda geliştirici yolu
- `Baslat.bat` → oyunu açar. Aynı Wi-Fi'deki telefonlar da siyah pencerede yazan adresten (`http://192.168.x.x:5173`) oynayabilir.
- Kodu değiştirdikten sonra indirme dosyalarını yeniden üretmek için:
  - `node tools/build.js` → iki `.html` dosyası
  - `powershell -ExecutionPolicy Bypass -File android\build-apk.ps1` → `.apk` (Android Studio'nun SDK'sını kullanır)

---

## İçerik

| Oyun | Ne yapıyorsun? |
|---|---|
| **Word Connect** | Türkçe anlamı verilen kelimenin harflerini sürükleyip kutulara yerleştir (8 seviye, ipucu) |
| **Word Match** | İngilizce ↔ Türkçe kartları sürükle-bırak / tıklayarak eşleştir (süreli & süresiz) |
| **Wordle** | Türkçe anlamdan İngilizce kelimeyi 5 hakta bul (yeşil / turuncu / gri) |
| **English Quiz** | 6 soru tipi, 4 seçenek, Türkçe açıklama, zayıf konu raporu |
| **Sentence Builder** | Karışık kelimelerle doğru cümleyi kur, yanlışta ipucu |
| **Word Circle** | Harf çarkında parmağını kaydırarak ünite kelimelerini bul (16 seviye) |
| **Word Riddle** | Kelime bilmecesi: bilmece / İngilizce→Türkçe / Türkçe→İngilizce + 3 kademeli ipucu |
| **Exam 1, 2, 3…** | 20 soruluk sınavlar, bitince hatalar + çözümleri, "Solve my mistakes", sonraki sınav |
| **Class Battle** | Akıllı tahtada iki takım yarışması |

- **Quest (macera yolu):** Tüm oyunlar sırayla bağlı; bir aşama bitince *Continue* ile sıradakine geçilir. Her bölüm bir sınavla biter, zorluk artarak **hiç bitmeden** devam eder.
- **Sıralama:** İlk girişte isim + avatar seçilir ve oyuncu tüm sıralamalara girer. **Her oyunun ayrı sıralaması** + genel XP + sınav sıralaması. Akıllı tahtada her öğrenci kendi adıyla oyuncu ekleyebilir (Ranks → Players → New Player).
- **Kelime merkezi:** 96 ünite kelimesi. Kartın ön yüzünde İngilizce kelime, kart çevrilince arkasında **Türkçe anlamı** + örnek cümle ve çevirisi. Favoriler, "biliyorum" işareti, tekrar kartları.
- **Soru bankası:** 107 soru (sınava eklenen 15 yeni soru dahil).
- **Akıllı hata sistemi:** Her yanlış kaydedilir; çok yanlış yapılan kelimeler oyunlarda daha sık çıkar; hatalardan otomatik tekrar testi.
- **XP, seviye, seri (streak), 19 rozet, günlük görevler.**
- **Ses:** Sadece kelimelerin okunuşu (🔊 butonuna basınca) + oyun efekt sesleri. Otomatik konuşma yok.

## Dosyalar
```
indir/            → indirilebilir oyun dosyaları (.html + .apk)
index.html        → oyun (geliştirme sürümü)
css/app.css       → tasarım
js/data.js        → kelimeler, sorular, cümleler, Word Circle seviyeleri (ünite içeriği)
js/core.js        → oyuncular, XP, sıralama, sesler, animasyonlar
js/screens.js     → menüler ve sayfalar
js/games/*.js     → oyunlar
android/          → Android uygulamasının kaynakları + derleme scripti
tools/            → build.js, verify.js (içerik kontrolü), serve.js (telefon için sunucu)
```
