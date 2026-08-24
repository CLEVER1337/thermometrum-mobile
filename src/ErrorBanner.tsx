import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  message: string;
  onRetry: () => void;
};

export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.button}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#f8d7da',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  message: {
    color: '#842029',
    flexShrink: 1,
  },
  button: {
    backgroundColor: '#842029',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
