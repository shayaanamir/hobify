import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * HomeScreen — Dashboard
 * Shows today's stats, active hobbies summary, and quick actions.
 * UI to be implemented.
 */
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>HomeScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  placeholder: { fontSize: 18, color: '#9CA3AF' },
});
