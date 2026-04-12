import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * ProfileScreen — User profile
 * Shows user stats, hobby history, and settings shortcuts.
 * UI to be implemented.
 */
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>ProfileScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  placeholder: { fontSize: 18, color: '#9CA3AF' },
});
