import type { IndexList } from '../types';

function playingCards(): string[] {
  const suits = ['Sinek ♣', 'Karo ♦', 'Kupa ♥', 'Maça ♠'];
  const ranks = ['As', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Vale', 'Kız', 'Papaz'];
  const out: string[] = [];
  for (const suit of suits) for (const rank of ranks) out.push(`${suit} ${rank}`);
  return out;
}

const countries = [
  'Türkiye', 'Almanya', 'Fransa', 'İtalya', 'İspanya', 'İngiltere', 'Hollanda', 'Belçika',
  'İsviçre', 'Avusturya', 'Yunanistan', 'Portekiz', 'İsveç', 'Norveç', 'Danimarka', 'Finlandiya',
  'Polonya', 'Çekya', 'Macaristan', 'Romanya', 'Bulgaristan', 'Rusya', 'Ukrayna', 'ABD',
  'Kanada', 'Meksika', 'Brezilya', 'Arjantin', 'Şili', 'Kolombiya', 'Japonya', 'Çin',
  'Güney Kore', 'Hindistan', 'Endonezya', 'Tayland', 'Vietnam', 'Avustralya', 'Yeni Zelanda',
  'Mısır', 'Fas', 'Güney Afrika', 'Nijerya', 'Kenya', 'Suudi Arabistan', 'BAE', 'Katar',
  'İran', 'Irak', 'Azerbaycan',
];

const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
  'Mersin', 'Kayseri', 'Eskişehir', 'Samsun', 'Trabzon', 'Diyarbakır', 'Denizli', 'Şanlıurfa',
  'Malatya', 'Erzurum', 'Van', 'Sakarya', 'Muğla', 'Balıkesir', 'Hatay', 'Manisa',
  'Kocaeli', 'Aydın', 'Tekirdağ', 'Ordu', 'Afyonkarahisar', 'Sivas',
];

const names = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'Murat', 'Emre', 'Burak',
  'Ayşe', 'Fatma', 'Emine', 'Zeynep', 'Elif', 'Merve', 'Selin', 'Deniz', 'Ece', 'Defne',
  'Can', 'Cem', 'Kerem', 'Arda', 'Mert', 'Yusuf', 'Ömer', 'Eren', 'Kaan', 'Baran',
  'Aslı', 'Buse', 'Ceren', 'Dilara', 'Esra', 'Gizem', 'Hande', 'İrem', 'Melis', 'Naz',
];

const zodiac = [
  'Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak',
  'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık',
];

const objects = [
  'Anahtar', 'Saat', 'Yüzük', 'Kalem', 'Kitap', 'Telefon', 'Gözlük', 'Cüzdan', 'Şemsiye', 'Ayna',
  'Mum', 'Pusula', 'Zar', 'Madeni para', 'Kolye', 'Fincan', 'Harita', 'Fener', 'Defter', 'Makas',
];

export const builtInLists: IndexList[] = [
  { id: 'builtin_cards', name: 'İskambil Kartları (52)', items: playingCards(), builtIn: true },
  { id: 'builtin_countries', name: 'Ülkeler', items: countries, builtIn: true },
  { id: 'builtin_cities', name: 'Şehirler', items: cities, builtIn: true },
  { id: 'builtin_names', name: 'İsimler', items: names, builtIn: true },
  { id: 'builtin_zodiac', name: 'Burçlar', items: zodiac, builtIn: true },
  { id: 'builtin_objects', name: 'Objeler', items: objects, builtIn: true },
];
