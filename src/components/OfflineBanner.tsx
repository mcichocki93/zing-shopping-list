import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FONT_SIZE, SPACING } from '../constants';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineBanner() {
  const isConnected = useNetworkStatus();
  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons name="wifi-off" size={14} color="#fff" />
      <Text style={styles.text}>Offline – zmiany zsynchronizują się po powrocie</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: '#F57C00',
    paddingVertical: 5,
    paddingHorizontal: SPACING.sm,
  },
  text: {
    fontSize: FONT_SIZE.caption,
    color: '#fff',
    fontWeight: '600',
  },
});
