import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Chart, { humidityColor, temperatureColor } from './Chart';
import { getDevices, getHistory, getLatest, type HistoryPoint, type Reading } from './api';

const refreshInterval = 30000;

function formatAge(timestamp: string | undefined): string {
  if (!timestamp) {
    return '';
  }

  const seconds = Math.max(0, Math.round((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (seconds < 60) {
    return 'updated just now';
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `updated ${minutes} min ago`;
  }

  return `updated ${Math.round(minutes / 60)} h ago`;
}

export default function App() {
  const [latest, setLatest] = useState<Reading | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      let device = deviceId;
      if (device === null) {
        const devices = await getDevices();
        device = devices.length > 0 ? devices[0].deviceId : null;
        setDeviceId(device);
      }

      if (device === null) {
        setLatest(null);
        setHistory([]);
        setError(null);
        return;
      }

      const [reading, points] = await Promise.all([getLatest(device), getHistory(device)]);
      setLatest(reading);
      setHistory(points);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The backend is not reachable');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    load();
    const timer = setInterval(load, refreshInterval);
    return () => clearInterval(timer);
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Thermometrum</Text>

        {error !== null && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {latest === null ? (
          <Text style={styles.muted}>No sensor has sent a reading yet.</Text>
        ) : (
          <>
            <Text style={styles.deviceId}>{latest.deviceId}</Text>

            <View style={styles.cards}>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Temperature</Text>
                <Text style={[styles.cardValue, { color: temperatureColor }]}>
                  {latest.temperature.toFixed(1)} °C
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Humidity</Text>
                <Text style={[styles.cardValue, { color: humidityColor }]}>
                  {latest.humidity.toFixed(1)} %
                </Text>
              </View>
            </View>

            <Text style={styles.muted}>{formatAge(latest.timestamp)}</Text>

            <View style={styles.chartCard}>
              <Text style={styles.cardLabel}>Last 24 hours</Text>
              <Chart points={history} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  deviceId: {
    color: '#6c757d',
  },
  cards: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  cardLabel: {
    color: '#6c757d',
    fontSize: 13,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 34,
    fontWeight: '600',
  },
  muted: {
    color: '#6c757d',
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  errorText: {
    color: '#842029',
    flexShrink: 1,
  },
  retryButton: {
    backgroundColor: '#842029',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
