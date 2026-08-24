import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { HistoryPoint } from './api';

export const temperatureColor = '#d9480f';
export const humidityColor = '#1b6ec2';

type Props = {
  points: HistoryPoint[];
  height?: number;
};

type Range = { min: number; max: number };

function rangeOf(values: number[]): Range {
  let min = Math.min(...values);
  let max = Math.max(...values);

  if (max - min < 0.5) {
    const middle = (min + max) / 2;
    min = middle - 0.5;
    max = middle + 0.5;
  }

  return { min, max };
}

function buildPath(points: HistoryPoint[], pick: (point: HistoryPoint) => number, height: number): string {
  const times = points.map((point) => new Date(point.timestamp).getTime());
  const minTime = Math.min(...times);
  const spanTime = Math.max(1, Math.max(...times) - minTime);
  const { min, max } = rangeOf(points.map(pick));

  return points
    .map((point, index) => {
      const x = ((times[index] - minTime) / spanTime) * 100;
      const y = height - ((pick(point) - min) / (max - min)) * height;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

export default function Chart({ points, height = 180 }: Props) {
  if (points.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>Not enough readings to draw a line yet.</Text>
      </View>
    );
  }

  const temperature = rangeOf(points.map((point) => point.temperature));
  const humidity = rangeOf(points.map((point) => point.humidity));

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <Path
          d={buildPath(points, (point) => point.temperature, height)}
          stroke={temperatureColor}
          strokeWidth={1.5}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        <Path
          d={buildPath(points, (point) => point.humidity, height)}
          stroke={humidityColor}
          strokeWidth={1.5}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
      <Text style={styles.caption}>
        {`${temperature.min.toFixed(1)}–${temperature.max.toFixed(1)} °C · `}
        {`${humidity.min.toFixed(1)}–${humidity.max.toFixed(1)} %`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6c757d',
  },
  caption: {
    color: '#6c757d',
    fontSize: 12,
    marginTop: 8,
  },
});
