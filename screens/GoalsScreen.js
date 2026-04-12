import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * GoalsScreen — Goals overview for all hobbies.
 * UI to be implemented.
 */
export default function GoalsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>GoalsScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  placeholder: { fontSize: 18, color: '#9CA3AF' },
});
