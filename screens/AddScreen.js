import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * AddScreen — Full-screen modal for creating hobbies and logging sessions.
 * Presented without the bottom navigation bar.
 * UI to be implemented.
 */
export default function AddScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>AddScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  placeholder: { fontSize: 18, color: '#9CA3AF' },
});
