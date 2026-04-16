import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Heart } from 'lucide-react-native';

export function GuideCard({ guide, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{guide.authorAvatar}</Text>
          </View>
          <Text style={styles.authorName}>{guide.authorName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Clock size={12} color="#9CA3AF" />
          <Text style={styles.metaText}>{guide.readTime} min</Text>
          <Heart size={12} color="#9CA3AF" />
          <Text style={styles.metaText}>{guide.likes}</Text>
        </View>
      </View>
      <Text style={styles.title}>{guide.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{guide.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 13 },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginRight: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});
