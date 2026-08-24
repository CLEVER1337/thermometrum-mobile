import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ErrorBanner from './ErrorBanner';
import { getDevices, type DeviceSummary } from './api';
import { humidityColor, temperatureColor } from './Chart';
import { formatAge } from './format';
import type { RootStackParamList } from './navigation';
import { usePolling } from './usePolling';

type Props = NativeStackScreenProps<RootStackParamList, 'Devices'>;

export default function DevicesScreen({ navigation }: Props) {
  const load = useCallback(() => getDevices(), []);
  const { data, loading, refreshing, error, refresh } = usePolling<DeviceSummary[]>(load);

  const renderDevice = useCallback(
    ({ item }: { item: DeviceSummary }) => (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('Device', { deviceId: item.deviceId })}
      >
        <View style={styles.rowText}>
          <Text style={styles.deviceId}>{item.deviceId}</Text>
          <Text style={styles.muted}>{formatAge(item.lastSeen)}</Text>
        </View>
        <View style={styles.rowValues}>
          <Text style={[styles.value, { color: temperatureColor }]}>{item.temperature.toFixed(1)} °C</Text>
          <Text style={[styles.value, { color: humidityColor }]}>{item.humidity.toFixed(1)} %</Text>
        </View>
      </TouchableOpacity>
    ),
    [navigation],
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={data ?? []}
      keyExtractor={(device) => device.deviceId}
      renderItem={renderDevice}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListHeaderComponent={error === null ? null : <ErrorBanner message={error} onRetry={refresh} />}
      ListEmptyComponent={
        error === null ? <Text style={styles.muted}>No sensor has sent a reading yet.</Text> : null
      }
    />
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
  row: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowText: {
    flexShrink: 1,
    gap: 2,
  },
  rowValues: {
    alignItems: 'flex-end',
  },
  deviceId: {
    fontSize: 17,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  muted: {
    color: '#6c757d',
  },
});
