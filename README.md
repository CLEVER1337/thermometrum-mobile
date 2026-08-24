# thermometrum-mobile

Expo / React Native client for [thermometrum-backend](../thermometrum-backend). One screen: the
current temperature and humidity, a 24 hour chart, pull-to-refresh, and a refresh every 30 seconds.

## Scaffolding

The screen, the chart and the API client live in `src/` and are already written. The Expo project
files are not — they have to come from the generator so their versions match the SDK you get:

```bash
npx create-expo-app@latest . --template blank-typescript
npx expo install react-native-svg
```

Then point the generated entry point at this app:

```tsx
// App.tsx
export { default } from './src/App';
```

## Running it

```bash
cp .env.example .env      # EXPO_PUBLIC_API_URL must be the backend's LAN address, not localhost
npx expo start
```

`localhost` in `.env` only works in a simulator on the same machine. A phone needs the address the
backend actually listens on — start it with `ASPNETCORE_URLS=http://0.0.0.0:5056` and use your
machine's LAN IP.

The backend serves plain HTTP. Expo Go allows that; a standalone Android build does not, so add
`expo-build-properties` with `usesCleartextTraffic: true` before building an APK.

## Layout

| File | Holds |
|---|---|
| `src/App.tsx` | the screen, its loading, empty and error states |
| `src/Chart.tsx` | the two-line SVG chart and its scales |
| `src/api.ts` | typed calls to `/api/devices`, `/api/readings/latest` and `/api/readings/history` |

The first device from `/api/devices` is the one shown; there is no device picker yet.
