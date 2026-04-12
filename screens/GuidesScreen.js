import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * GuidesScreen — Browse community guides.
 * UI to be implemented.
 */
export default function GuidesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>GuidesScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  placeholder: { fontSize: 18, color: '#9CA3AF' },
});
