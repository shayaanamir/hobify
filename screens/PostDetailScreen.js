import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * PostDetailScreen — Full view of a social post with comments.
 * Receives postId via route params.
 * UI to be implemented.
 */
export default function PostDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>PostDetailScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  placeholder: { fontSize: 18, color: '#9CA3AF' },
});
