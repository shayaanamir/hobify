import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * CollectionScreen — Media tracking view (books, games, movies).
 * Groups sessions by mediaTitle and shows progress/status.
 * UI to be implemented.
 */
export default function CollectionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>CollectionScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  placeholder: { fontSize: 18, color: '#9CA3AF' },
});
