export const APK_DOWNLOAD_URL =
  'https://github.com/gbhanukarthikreddy-dev/ApexMusic/releases/latest/download/apexmusic.apk';

export const GITHUB_REPO_URL =
  'https://github.com/gbhanukarthikreddy-dev/ApexMusic';

export interface DemoTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  durationLabel: string;
  accentFrom: string;
  accentTo: string;
  badge: string;
  lyrics: string[];
}

export const DEMO_TRACKS: DemoTrack[] = [
  {
    id: 'midnight-glass',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    durationSec: 200,
    durationLabel: '3:20',
    accentFrom: '#FA2D48',
    accentTo: '#6D28D9',
    badge: 'Offline Ready',
    lyrics: [
      'I been tryna call',
      'I been on my own for long enough',
      'Maybe you can show me how to love, maybe',
      'I said, ooh, I’m blinded by the lights',
      'No, I can’t sleep until I feel your touch',
      'I said, ooh, I’m drowning in the night',
    ],
  },
  {
    id: 'kesariya',
    title: 'Kesariya',
    artist: 'Arijit Singh · Pritam',
    album: 'Brahmāstra',
    durationSec: 268,
    durationLabel: '4:28',
    accentFrom: '#F59E0B',
    accentTo: '#BE123C',
    badge: 'Hindi · Synced',
    lyrics: [
      'Mujhko itna bataye koi',
      'Kaise tujhse dil na lagaye koi',
      'Rabba ne tujhko banane mein',
      'Kardi hai husn ki khaali tijoriyan',
      'Kesariya tera ishq hai piya',
      'Rang jaaun jo main haath lagaaun',
    ],
  },
  {
    id: 'starboy',
    title: 'Starboy',
    artist: 'The Weeknd · Daft Punk',
    album: 'Starboy',
    durationSec: 230,
    durationLabel: '3:50',
    accentFrom: '#3B82F6',
    accentTo: '#EC4899',
    badge: 'Lossless Feel',
    lyrics: [
      'I’m tryna put you in the worst mood, ah',
      'P1 cleaner than your church shoes, ah',
      'Look what you’ve done',
      'I’m a starboy',
      'Every day a player try to test me, ah',
      'House so empty, need a centerpiece',
    ],
  },
  {
    id: 'naatu',
    title: 'Naatu Naatu',
    artist: 'Rahul Sipligunj · Kaala Bhairava',
    album: 'RRR (Original Motion Picture)',
    durationSec: 215,
    durationLabel: '3:35',
    accentFrom: '#10B981',
    accentTo: '#0EA5E9',
    badge: 'Telugu · Trending',
    lyrics: [
      'Polam gattu dummulona',
      'Potlagitta dookinattu',
      'Naatu naatu naatu naatu',
      'Veera naatu',
      'Pachha mirchi korikinattu',
      'Chikkinaa chindulu veyaraa',
    ],
  },
];

export interface LanguageItem {
  name: string;
  native: string;
  vibe: string;
  accent: string;
  playlists: string[];
}

export const LANGUAGES: LanguageItem[] = [
  {
    name: 'English',
    native: 'Global',
    vibe: 'Pop · R&B · Indie',
    accent: '#FA2D48',
    playlists: ['Midnight Pop Glass', 'Late Night R&B', 'Acoustic Focus'],
  },
  {
    name: 'Hindi',
    native: 'हिन्दी',
    vibe: 'Bollywood · Indie · Lo-Fi',
    accent: '#F59E0B',
    playlists: ['Bollywood Unplugged', 'Desi Lo-Fi Nights', 'Arijit Essentials'],
  },
  {
    name: 'Telugu',
    native: 'తెలుగు',
    vibe: 'Tollywood · Mass · Melodies',
    accent: '#06B6D4',
    playlists: ['Tollywood Top 50', 'Telugu Breezy Melodies', 'Mass Beats'],
  },
  {
    name: 'Tamil',
    native: 'தமிழ்',
    vibe: 'Kollywood · Anirudh · Rahman',
    accent: '#8B5CF6',
    playlists: ['Kollywood Hits', 'ARR Timeless', 'Chennai Drive'],
  },
  {
    name: 'Punjabi',
    native: 'ਪੰਜਾਬੀ',
    vibe: 'Hip-Hop · Bhangra · Chill',
    accent: '#EC4899',
    playlists: ['Punjabi Wave', 'Highway Bass', 'Diljit & Friends'],
  },
  {
    name: 'Malayalam',
    native: 'മലയാളം',
    vibe: 'Soulful · Indie · Film',
    accent: '#10B981',
    playlists: ['Mollywood Acoustic', 'Monsoon Melodies', 'Kochi Indie'],
  },
  {
    name: 'Kannada',
    native: 'ಕನ್ನಡ',
    vibe: 'Sandalwood · Rock · Pop',
    accent: '#F97316',
    playlists: ['Sandalwood Fresh', 'Bengaluru Chill', 'Kannada Classics'],
  },
  {
    name: 'K-Pop',
    native: '한국어',
    vibe: 'Seoul Pop · Dance · OST',
    accent: '#3B82F6',
    playlists: ['Seoul Neon', 'K-Drama OSTs', 'Idol Anthems'],
  },
  {
    name: 'Spanish',
    native: 'Español',
    vibe: 'Reggaeton · Latin Pop',
    accent: '#EF4444',
    playlists: ['Fuego Latino', 'Sunset Reggaeton', 'Acústico'],
  },
];
