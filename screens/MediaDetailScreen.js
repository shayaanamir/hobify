import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * MediaDetailScreen — Detail view for a tracked media item (book, game, movie).
 * Shows all sessions for that media title plus aggregated stats.
 * Receives mediaTitle + hobbyId via route params.
 * UI to be implemented.
 */
export default function MediaDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>MediaDetailScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  placeholder: { fontSize: 18, color: '#9CA3AF' },
});
