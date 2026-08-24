# thermometrum-mobile

Expo / React Native client for [thermometrum-backend](../thermometrum-backend). Two screens: the
list of sensors with their current readings, and a per-device view with a 24 hour chart. Both
pull-to-refresh and reload themselves every 30 seconds.

Expo SDK 57. `App.tsx` is a one-line re-export of `src/App.tsx`, which holds the navigator.

## Running it

```bash
npm install
cp .env.example .env      # EXPO_PUBLIC_API_URL must be the backend's LAN address, not localhost
npx expo start
```

`localhost` in `.env` only works in a simulator on the same machine. A phone needs the address the
backend actually listens on — `docker compose up -d` in the backend publishes it on every interface,
so use the machine's LAN IP.

Expo inlines `EXPO_PUBLIC_*` into the bundle at build time, so after editing `.env` restart with
`npx expo start --clear` or the app keeps the old address.

## Building an APK

```bash
eas build --profile preview --platform android
```

Two things this needs, both already configured. `.env` is gitignored and never reaches the EAS
builder, so the `preview` profile in `eas.json` carries `EXPO_PUBLIC_API_URL` — its value is baked
into the APK, which therefore only works on that one network. And the backend serves plain HTTP,
which a standalone build blocks by default, so `app.json` enables `usesCleartextTraffic` through
`expo-build-properties`. Expo Go needs neither: it permits cleartext itself.

## Layout

| File | Holds |
|---|---|
| `src/App.tsx` | the native stack wiring the two screens together |
| `src/DevicesScreen.tsx` | the sensor list, its empty and error states |
| `src/DeviceScreen.tsx` | one device: current readings and the chart |
| `src/Chart.tsx` | the two-line SVG chart and its scales |
| `src/usePolling.ts` | loading, refreshing and error state plus the 30 second timer |
| `src/api.ts` | typed calls to `/api/devices`, `/api/readings/latest` and `/api/readings/history` |
