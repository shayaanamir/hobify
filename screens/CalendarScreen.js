import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * CalendarScreen — Planning view
 * Displays a monthly calendar and planned activities.
 * UI to be implemented.
 */
export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>CalendarScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  placeholder: { fontSize: 18, color: '#9CA3AF' },
});
