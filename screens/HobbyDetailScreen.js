import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * HobbyDetailScreen — Detail view for a single hobby.
 * Shows sessions history, goals, weekly chart, and a "Log Session" CTA.
 * Receives `hobbyId` via route params.
 * UI to be implemented.
 */
export default function HobbyDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>HobbyDetailScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  placeholder: { fontSize: 18, color: '#9CA3AF' },
});
