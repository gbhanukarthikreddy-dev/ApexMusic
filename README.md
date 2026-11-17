# Apex Music

A mobile-first music streaming app built with **Expo (SDK 58)**, **React Native**, **TypeScript**, **Expo Router**, **Zustand**, **expo-audio**, **expo-image**, and **react-native-reanimated**.

## Architecture

```text
├── app/                     # Expo Router screens & layouts (tabs + stack + modals)
│   ├── _layout.tsx          # Root Stack + Splash overlay + Audio controller init
│   ├── player.tsx           # Full-screen player modal
│   ├── queue.tsx            # Queue management modal (reorder, remove, clear)
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Bottom tabs + persistent MiniPlayer
│   │   ├── index.tsx        # Home (Trending, New Releases, Recommended Playlists)
│   │   ├── search.tsx       # Debounced search, suggestions, recent searches, tabs
│   │   ├── library.tsx      # Liked songs, playlists, history, offline placeholder
│   │   └── settings.tsx     # Audio quality, backend URL, cache, about
│   ├── artist/[id].tsx      # Artist page (top songs, albums, singles)
│   ├── album/[id].tsx       # Album page (tracklist, play/shuffle)
│   └── playlist/[id].tsx    # Remote & local playlist page
├── components/              # Reusable UI components (StyleSheet only)
├── services/
│   ├── musicApi.ts          # Single data-source abstraction (IMusicDataSource)
│   └── audioService.ts      # expo-audio playback & lock-screen metadata controller
├── store/
│   ├── playerStore.ts       # Queue, playback state, shuffle, repeat, stream loading
│   └── libraryStore.ts      # Persisted likes, playlists, history, settings (AsyncStorage)
├── hooks/                   # useAudioController, useDebounce
├── theme/                   # Custom design tokens (colors, spacing, typography, radii)
├── types/                   # Shared TypeScript interfaces
├── utils/                   # Duration formatting, shuffle, array helpers
└── backend/                 # Node.js + Express + youtubei.js proxy & stream resolver
```

### Backend Choice: Node.js + Express + `youtubei.js`

We chose **Approach (a)** (a lightweight Node/Express server wrapping `youtubei.js`) over Python FastAPI + `ytmusicapi` because:
1. **Unified JS/TS ecosystem**: Both the Expo client and backend install and run with Node/npm—no Python virtual environments or external `yt-dlp` binary required.
2. **Built-in stream resolution**: `youtubei.js` handles both YouTube Music catalog browsing (`yt.music.*`) and server-side audio stream URL extraction/deciphering (`yt.getBasicInfo` + `format.decipher`), keeping all stream resolution off the client.

### Swapping the Music Data Source

All network calls are isolated behind `IMusicDataSource` in [services/musicApi.ts](file:///c:/Users/karth/OneDrive/Desktop/Apex%20Music/services/musicApi.ts).
To swap to a Python `ytmusicapi` FastAPI backend, another REST API, or a mock provider:
1. Implement `IMusicDataSource` (`getHomeFeed`, `search`, `getSearchSuggestions`, `getArtist`, `getAlbum`, `getPlaylist`, `getStreamUrl`, `healthCheck`).
2. Update `export const musicApi: IMusicDataSource = new YourCustomDataSource();` in `services/musicApi.ts`.
No screens or Zustand stores need to change.

---

## Setup & Running Locally

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install & Run the Backend
```bash
cd backend
npm install
npm start
```
The backend starts on `http://0.0.0.0:3001` (health check: `GET http://localhost:3001/api/health`).

### 3. Start the Expo App
From the project root:
```bash
npx expo start
```

### 4. Testing on a Device or Emulator
- **Android Emulator**: `http://10.0.2.2:3001` is selected automatically.
- **iOS Simulator**: `http://localhost:3001` is selected automatically.
- **Physical Device (Expo Go)**:
  - Ensure your phone and computer are on the same Wi-Fi network.
  - The app automatically derives your computer's LAN IP from Expo's `hostUri` on port `3001`.
  - If needed, you can override the backend URL at runtime in **Settings → Backend Server** (e.g., `http://192.168.1.42:3001`) and tap **Save & Test**, or set `EXPO_PUBLIC_API_URL` before starting Expo.
- **Background Playback & Lock-Screen Controls**:
  - `app.json` configures iOS `UIBackgroundModes: ["audio"]` and `expo-audio`.
  - For full native lock-screen media notifications on Android/iOS outside Expo Go, create a development build:
    ```bash
    npx expo run:android
    # or
    npx expo run:ios
    ```
