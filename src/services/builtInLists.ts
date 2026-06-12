import type { IndexList, Language } from '../types';

function playingCards(lang: Language): string[] {
  const suits = lang === 'tr' ? ['Sinek ♣', 'Karo ♦', 'Kupa ♥', 'Maça ♠'] : ['Clubs ♣', 'Diamonds ♦', 'Hearts ♥', 'Spades ♠'];
  const ranks =
    lang === 'tr'
      ? ['As', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Vale', 'Kız', 'Papaz']
      : ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
  const out: string[] = [];
  for (let s = 0; s < suits.length; s++) {
    for (const rank of ranks) {
      out.push(lang === 'tr' ? `${suits[s]} ${rank}` : `${rank} of ${suits[s]}`);
    }
  }
  return out;
}

const countriesTr = [
  'Türkiye', 'Almanya', 'Fransa', 'İtalya', 'İspanya', 'İngiltere', 'Hollanda', 'Belçika',
  'İsviçre', 'Avusturya', 'Yunanistan', 'Portekiz', 'İsveç', 'Norveç', 'Danimarka', 'Finlandiya',
  'Polonya', 'Çekya', 'Macaristan', 'Romanya', 'Bulgaristan', 'Rusya', 'Ukrayna', 'ABD',
  'Kanada', 'Meksika', 'Brezilya', 'Arjantin', 'Şili', 'Kolombiya', 'Japonya', 'Çin',
  'Güney Kore', 'Hindistan', 'Endonezya', 'Tayland', 'Vietnam', 'Avustralya', 'Yeni Zelanda',
  'Mısır', 'Fas', 'Güney Afrika', 'Nijerya', 'Kenya', 'Suudi Arabistan', 'BAE', 'Katar',
  'İran', 'Irak', 'Azerbaycan',
];

const countriesEn = [
  'Turkey', 'Germany', 'France', 'Italy', 'Spain', 'United Kingdom', 'Netherlands', 'Belgium',
  'Switzerland', 'Austria', 'Greece', 'Portugal', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Poland', 'Czechia', 'Hungary', 'Romania', 'Bulgaria', 'Russia', 'Ukraine', 'USA',
  'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Japan', 'China',
  'South Korea', 'India', 'Indonesia', 'Thailand', 'Vietnam', 'Australia', 'New Zealand',
  'Egypt', 'Morocco', 'South Africa', 'Nigeria', 'Kenya', 'Saudi Arabia', 'UAE', 'Qatar',
  'Iran', 'Iraq', 'Azerbaijan',
];

// proper nouns — same in both languages
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

const zodiacTr = [
  'Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak',
  'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık',
];
const zodiacEn = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const objectsTr = [
  'Anahtar', 'Saat', 'Yüzük', 'Kalem', 'Kitap', 'Telefon', 'Gözlük', 'Cüzdan', 'Şemsiye', 'Ayna',
  'Mum', 'Pusula', 'Zar', 'Madeni para', 'Kolye', 'Fincan', 'Harita', 'Fener', 'Defter', 'Makas',
];
const objectsEn = [
  'Key', 'Watch', 'Ring', 'Pen', 'Book', 'Phone', 'Glasses', 'Wallet', 'Umbrella', 'Mirror',
  'Candle', 'Compass', 'Dice', 'Coin', 'Necklace', 'Cup', 'Map', 'Lantern', 'Notebook', 'Scissors',
];

const listNames: Record<Language, Record<string, string>> = {
  tr: {
    builtin_cards: 'İskambil Kartları (52)',
    builtin_countries: 'Ülkeler',
    builtin_cities: 'Şehirler',
    builtin_names: 'İsimler',
    builtin_zodiac: 'Burçlar',
    builtin_objects: 'Objeler',
  },
  en: {
    builtin_cards: 'Playing Cards (52)',
    builtin_countries: 'Countries',
    builtin_cities: 'Cities',
    builtin_names: 'Names',
    builtin_zodiac: 'Zodiac Signs',
    builtin_objects: 'Objects',
  },
};

export function getBuiltInLists(lang: Language): IndexList[] {
  const n = listNames[lang];
  return [
    { id: 'builtin_cards', name: n.builtin_cards, items: playingCards(lang), builtIn: true },
    { id: 'builtin_countries', name: n.builtin_countries, items: lang === 'tr' ? countriesTr : countriesEn, builtIn: true },
    { id: 'builtin_cities', name: n.builtin_cities, items: cities, builtIn: true },
    { id: 'builtin_names', name: n.builtin_names, items: names, builtIn: true },
    { id: 'builtin_zodiac', name: n.builtin_zodiac, items: lang === 'tr' ? zodiacTr : zodiacEn, builtIn: true },
    { id: 'builtin_objects', name: n.builtin_objects, items: lang === 'tr' ? objectsTr : objectsEn, builtIn: true },
  ];
}
