import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * SocialFeedScreen — Community feed
 * Lists posts from community members; supports liking and navigating to details.
 * UI to be implemented.
 */
export default function SocialFeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>SocialFeedScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5' },
  placeholder: { fontSize: 18, color: '#9CA3AF' },
});
