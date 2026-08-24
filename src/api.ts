export type DeviceSummary = {
  deviceId: string;
  lastSeen: string;
  temperature: number;
  humidity: number;
};

export type Reading = {
  deviceId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
};

export type HistoryPoint = {
  timestamp: string;
  temperature: number;
  humidity: number;
};

const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
const baseUrl = (configuredUrl ?? 'http://localhost:5056').replace(/\/$/, '');
const requestTimeout = 8000;

async function getJson<T>(path: string): Promise<T> {
  if (configuredUrl === undefined) {
    throw new Error('EXPO_PUBLIC_API_URL is not set — copy .env.example to .env and restart with expo start --clear');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeout);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${path} responded ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (caught) {
    const reason = caught instanceof Error ? caught.message : String(caught);
    throw new Error(`${baseUrl} — ${reason}`);
  } finally {
    clearTimeout(timeout);
  }
}

export function getDevices(): Promise<DeviceSummary[]> {
  return getJson<DeviceSummary[]>('/api/devices');
}

export function getLatest(deviceId: string): Promise<Reading> {
  return getJson<Reading>(`/api/readings/latest?deviceId=${encodeURIComponent(deviceId)}`);
}

export function getHistory(deviceId: string, hours = 24, bucketMinutes = 5): Promise<HistoryPoint[]> {
  const query = `deviceId=${encodeURIComponent(deviceId)}&hours=${hours}&bucketMinutes=${bucketMinutes}`;
  return getJson<HistoryPoint[]>(`/api/readings/history?${query}`);
}
