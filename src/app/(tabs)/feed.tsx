/**
 * Feed Tab Screen ('/(tabs)/feed')
 *
 * Minimalist, clean feed tab screen.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export default function FeedScreen() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
