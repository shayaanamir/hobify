import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * LogSessionScreen — Full-screen form to log a new session.
 * Pre-fills hobbyId from route params.
 * Presented without the bottom navigation bar.
 * UI to be implemented.
 */
export default function LogSessionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>LogSessionScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  placeholder: { fontSize: 18, color: '#9CA3AF' },
});
