import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import Chart, { humidityColor, temperatureColor } from './Chart';
import ErrorBanner from './ErrorBanner';
import { getHistory, getLatest, type HistoryPoint, type Reading } from './api';
import { formatAge } from './format';
import type { RootStackParamList } from './navigation';
import { usePolling } from './usePolling';

type Props = NativeStackScreenProps<RootStackParamList, 'Device'>;

type DeviceData = {
  latest: Reading;
  history: HistoryPoint[];
};

export default function DeviceScreen({ route }: Props) {
  const { deviceId } = route.params;

  const load = useCallback(async (): Promise<DeviceData> => {
    const [latest, history] = await Promise.all([getLatest(deviceId), getHistory(deviceId)]);
    return { latest, history };
  }, [deviceId]);

  const { data, loading, refreshing, error, refresh } = usePolling<DeviceData>(load);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      {error !== null && <ErrorBanner message={error} onRetry={refresh} />}

      {data === null ? (
        <Text style={styles.muted}>No readings for this device yet.</Text>
      ) : (
        <>
          <View style={styles.cards}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Temperature</Text>
              <Text style={[styles.cardValue, { color: temperatureColor }]}>
                {data.latest.temperature.toFixed(1)} °C
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Humidity</Text>
              <Text style={[styles.cardValue, { color: humidityColor }]}>
                {data.latest.humidity.toFixed(1)} %
              </Text>
            </View>
          </View>

          <Text style={styles.muted}>{formatAge(data.latest.timestamp)}</Text>

          <View style={styles.chartCard}>
            <Text style={styles.cardLabel}>Last 24 hours</Text>
            <Chart points={data.history} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
    gap: 12,
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
});
